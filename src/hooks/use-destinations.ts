import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Destination } from "@/lib/destinations";
import { deleteDestinationProgress, FALLBACK_DESTINATIONS } from "@/lib/sulyap-data";

export type DestinationInput = {
  name: string;
  slug: string;
  description: string;
  address: string;
  province: string;
  category: string;
  image_path: string | null;
  latitude: number | null;
  longitude: number | null;
  featured: boolean;
  history?: string;
  significance?: string;
  sources?: string;
  gallery_urls?: string[];
};

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: async (): Promise<Destination[]> => {
      try {
        const { data, error } = await supabase.from("destinations").select("*").order("name");
        if (error) throw new Error(error.message);
        if (data && data.length > 0) return data as Destination[];
        return FALLBACK_DESTINATIONS;
      } catch {
        return FALLBACK_DESTINATIONS;
      }
    },
  });
}

export function useDestination(slug: string | undefined) {
  return useQuery({
    queryKey: ["destinations", "slug", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Destination | null> => {
      try {
        const { data, error } = await supabase
          .from("destinations")
          .select("*")
          .eq("slug", slug!)
          .maybeSingle();
        if (error) throw new Error(error.message);
        if (data) return data as Destination;
        return FALLBACK_DESTINATIONS.find((d) => d.slug === slug) ?? null;
      } catch {
        return FALLBACK_DESTINATIONS.find((d) => d.slug === slug) ?? null;
      }
    },
  });
}

export function useSaveDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      destination,
      input,
    }: {
      destination?: Destination | undefined;
      input: DestinationInput;
    }) => {
      const phase1Payload = {
        name: input.name,
        slug: input.slug,
        description: input.description,
        address: input.address,
        province: input.province,
        category: input.category,
        image_path: input.image_path,
        latitude: input.latitude,
        longitude: input.longitude,
        featured: input.featured,
      };

      const phase2Payload = {
        ...phase1Payload,
        ...(input.history !== undefined ? { history: input.history } : {}),
        ...(input.significance !== undefined ? { significance: input.significance } : {}),
        ...(input.sources !== undefined ? { sources: input.sources } : {}),
        ...(input.gallery_urls !== undefined ? { gallery_urls: input.gallery_urls } : {}),
      } as Database["public"]["Tables"]["destinations"]["Update"];

      if (destination) {
        const { error } = await supabase
          .from("destinations")
          .update(phase2Payload)
          .eq("id", destination.id);
        if (error) {
          // Graceful fallback if Phase 2 SQL migration has not been run yet
          if (error.message.includes("column") || error.message.includes("schema cache")) {
            const { error: retryErr } = await supabase
              .from("destinations")
              .update(phase1Payload)
              .eq("id", destination.id);
            if (retryErr) throw new Error(retryErr.message);
            return destination.id;
          }
          throw new Error(error.message);
        }
        return destination.id;
      }

      const { error } = await supabase
        .from("destinations")
        .insert(phase2Payload as Database["public"]["Tables"]["destinations"]["Insert"]);
      if (error) {
        if (error.message.includes("column") || error.message.includes("schema cache")) {
          const { error: retryErr } = await supabase.from("destinations").insert(phase1Payload);
          if (retryErr) throw new Error(retryErr.message);
          return null;
        }
        throw new Error(error.message);
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
  });
}

export function useDeleteDestination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (destination: Destination) => {
      const { error } = await supabase.from("destinations").delete().eq("id", destination.id);
      if (error) throw new Error(error.message);
      // Clean up passport & quiz progress so no orphan records remain (M2 / M4.3)
      deleteDestinationProgress(destination.id, destination.slug);
      // Best effort: clean up the stored image as well.
      if (destination.image_path) {
        await supabase.storage.from("destination-images").remove([destination.image_path]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
  });
}
