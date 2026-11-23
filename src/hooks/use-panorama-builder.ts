import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  type PanoramaTour,
  type PanoramaScene,
  type PanoramaHotspot,
  type PanoramaArtwork,
  getAllTours,
  getToursForDestination,
  saveTour,
  deleteTour as apiDeleteTour,
} from "@/lib/panorama-builder";

export function usePanoramaTours(destinationSlug?: string) {
  const [tours, setTours] = useState<PanoramaTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (destinationSlug) {
        const data = await getToursForDestination(destinationSlug);
        setTours(data);
      } else {
        const data = await getAllTours();
        setTours(data);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load virtual tours.");
    } finally {
      setLoading(false);
    }
  }, [destinationSlug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = async (tour: Partial<PanoramaTour>) => {
    try {
      const saved = await saveTour(tour);
      await refresh();
      toast.success(`Virtual tour "${saved.title}" saved successfully!`);
      return saved;
    } catch (e: unknown) {
      toast.error(`Could not save tour: ${e instanceof Error ? e.message : "Unknown error"}`);
      throw e;
    }
  };

  const remove = async (tourId: string) => {
    try {
      await apiDeleteTour(tourId);
      await refresh();
      toast.success("Virtual tour removed.");
    } catch (e: unknown) {
      toast.error(`Could not delete tour: ${e instanceof Error ? e.message : "Unknown error"}`);
      throw e;
    }
  };

  return {
    tours,
    loading,
    error,
    refresh,
    saveTour: save,
    deleteTour: remove,
  };
}
