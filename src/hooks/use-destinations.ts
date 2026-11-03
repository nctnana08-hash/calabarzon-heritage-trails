import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Destination } from "@/lib/destinations";

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
};

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: async (): Promise<Destination[]> => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("name");
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useDestination(slug: string | undefined) {
  return useQuery({
    queryKey: ["destinations", "slug", slug],
    enabled: !!slug,
    queryFn: async (): Promise<Destination | null> => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
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
      if (destination) {
        const { error } = await supabase
          .from("destinations")
          .update(input)
          .eq("id", destination.id);
        if (error) throw new Error(error.message);
        return destination.id;
      }
      const { error } = await supabase.from("destinations").insert(input);
      if (error) throw new Error(error.message);
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
      const { error } = await supabase
        .from("destinations")
        .delete()
        .eq("id", destination.id);
      if (error) throw new Error(error.message);
      // Best effort: clean up the stored image as well.
      if (destination.image_path) {
        await supabase.storage
          .from("destination-images")
          .remove([destination.image_path]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
    },
  });
}
