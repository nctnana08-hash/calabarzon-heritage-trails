import { useEffect, useState } from "react";
import {
  type AppBranding,
  DEFAULT_BRANDING,
  getStoredBranding,
  resetStoredBranding,
  saveStoredBranding,
} from "@/lib/app-branding";

export function useAppBranding(): {
  branding: AppBranding;
  updateBranding: (next: Partial<AppBranding>) => void;
  resetBranding: () => void;
} {
  const [branding, setBranding] = useState<AppBranding>(DEFAULT_BRANDING);

  useEffect(() => {
    // Client-side hydration
    setBranding(getStoredBranding());

    const onCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<AppBranding>;
      if (customEvent.detail) {
        setBranding(customEvent.detail);
      } else {
        setBranding(getStoredBranding());
      }
    };

    const onStorageChange = (e: StorageEvent) => {
      if (e.key === "sulyap_app_branding_v1") {
        setBranding(getStoredBranding());
      }
    };

    window.addEventListener("sulyap:branding-changed", onCustomChange);
    window.addEventListener("storage", onStorageChange);
    return () => {
      window.removeEventListener("sulyap:branding-changed", onCustomChange);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  const updateBranding = (next: Partial<AppBranding>) => {
    const current = getStoredBranding();
    const updated: AppBranding = {
      ...current,
      ...next,
    };
    saveStoredBranding(updated);
    setBranding(updated);
  };

  const reset = () => {
    const def = resetStoredBranding();
    setBranding(def);
  };

  return { branding, updateBranding, resetBranding: reset };
}
