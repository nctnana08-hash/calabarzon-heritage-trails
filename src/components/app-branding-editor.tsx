import React, { useRef, useState } from "react";
import {
  Sparkles,
  Upload,
  RefreshCw,
  Check,
  Smartphone,
  Shield,
  Lock,
  Layers,
  Palette,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AppBranding,
  DEFAULT_BRANDING,
  LOGO_PRESETS,
  type LogoPresetId,
} from "@/lib/app-branding";
import { useAppBranding } from "@/hooks/use-app-branding";
import { useAuth } from "@/hooks/use-auth";
import { Mark, Pop } from "@/components/sulyap-ui";
import { C, F } from "@/lib/sulyap-theme";

const THEME_COLOR_OPTIONS = [
  { label: "Philippine Navy", hex: "#0038A8" },
  { label: "Deep Royal", hex: "#1E3A8A" },
  { label: "Heritage Emerald", hex: "#065F46" },
  { label: "Colonial Crimson", hex: "#991B1B" },
  { label: "Midnight Slate", hex: "#0F172A" },
];

export function AppBrandingEditor() {
  const { branding, updateBranding, resetBranding } = useAppBranding();
  const { isAdmin, signInDemoAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"identity" | "logo" | "theme">("identity");
  const [formState, setFormState] = useState<AppBranding>(branding);

  // Sync state with branding
  React.useEffect(() => {
    setFormState(branding);
  }, [branding]);

  // Admin access gate
  if (!isAdmin) {
    return (
      <Pop className="p-8 text-center border border-[#E2E8F0] dark:border-[#22314E] dark:bg-[#131C31]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0038A8] dark:text-[#93C5FD]">
          <Lock className="size-7" />
        </div>
        <h3
          className="mt-4 text-[20px] font-extrabold text-[#0F172A] dark:text-[#F8FAFC]"
          style={{ fontFamily: F.display }}
        >
          Administrator Access Required
        </h3>
        <p
          className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#64748B] dark:text-[#94A3B8]"
          style={{ fontFamily: F.body }}
        >
          Public application branding, app name, logo, and theme customizations are restricted to
          authorized Regional Administrators.
        </p>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={signInDemoAdmin}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-extrabold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: C.cover, fontFamily: F.body }}
          >
            <Shield className="size-4" />
            <span>Sign In as Regional Administrator (Demo)</span>
          </button>
        </div>
      </Pop>
    );
  }

  const handleChange = <K extends keyof AppBranding>(field: K, val: AppBranding[K]) => {
    setFormState((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB for fast loading.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormState((prev) => ({
        ...prev,
        logoType: "custom",
        customLogoUrl: result,
      }));
      toast.success("Logo uploaded! Click 'Save Branding' below to apply.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateBranding(formState);
    toast.success("Branding updated successfully!", {
      description: "Changes are now live across all web and mobile views.",
    });
  };

  const handleReset = () => {
    if (window.confirm("Reset app name, logo, and colors back to Sulyap original defaults?")) {
      resetBranding();
      setFormState(DEFAULT_BRANDING);
      toast.info("Branding reset to defaults.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Clean 2-Column Layout: Controls on Left, Device Mockup on Right */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Clean Segmented Settings */}
        <div className="lg:col-span-7 space-y-4">
          {/* Segmented Control Bar */}
          <div className="flex rounded-2xl border border-[#CBD5E1] dark:border-[#334155] bg-[#F1F5F9] dark:bg-[#1E293B] p-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("identity")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold transition"
              style={{
                backgroundColor: activeTab === "identity" ? C.cover : "transparent",
                color: activeTab === "identity" ? "#FFFFFF" : undefined,
              }}
            >
              <Tag className="size-3.5" />
              <span>Identity</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("logo")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold transition"
              style={{
                backgroundColor: activeTab === "logo" ? C.cover : "transparent",
                color: activeTab === "logo" ? "#FFFFFF" : undefined,
              }}
            >
              <ImageIcon className="size-3.5" />
              <span>Logo &amp; Icon</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("theme")}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold transition"
              style={{
                backgroundColor: activeTab === "theme" ? C.cover : "transparent",
                color: activeTab === "theme" ? "#FFFFFF" : undefined,
              }}
            >
              <Palette className="size-3.5" />
              <span>Theme</span>
            </button>
          </div>

          {/* Tab 1: Identity */}
          {activeTab === "identity" && (
            <Pop className="p-5 border border-[#E2E8F0] dark:border-[#22314E] dark:bg-[#131C31] space-y-4">
              <div>
                <label className="block text-[11.5px] font-extrabold uppercase text-[#334155] dark:text-[#CBD5E1]">
                  App Name
                </label>
                <input
                  type="text"
                  value={formState.appName}
                  onChange={(e) => handleChange("appName", e.target.value)}
                  placeholder="e.g. Sulyap, Lakbay Kultura"
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-[14px] font-bold outline-none transition focus:border-[#0038A8]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-extrabold uppercase text-[#334155] dark:text-[#CBD5E1]">
                  Badge / Suffix
                </label>
                <input
                  type="text"
                  value={formState.appBadge}
                  onChange={(e) => handleChange("appBadge", e.target.value)}
                  placeholder="e.g. PH, 2026, GOV"
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-[14px] font-bold uppercase outline-none transition focus:border-[#0038A8]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-extrabold uppercase text-[#334155] dark:text-[#CBD5E1]">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formState.appTagline}
                  onChange={(e) => handleChange("appTagline", e.target.value)}
                  placeholder="e.g. CALABARZON Heritage Portal"
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-[14px] font-medium outline-none transition focus:border-[#0038A8]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-extrabold uppercase text-[#334155] dark:text-[#CBD5E1]">
                  Summary Description
                </label>
                <textarea
                  rows={2}
                  value={formState.appDescription}
                  onChange={(e) => handleChange("appDescription", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2 text-[13px] outline-none transition focus:border-[#0038A8]"
                />
              </div>
            </Pop>
          )}

          {/* Tab 2: Logo & Icon */}
          {activeTab === "logo" && (
            <Pop className="p-5 border border-[#E2E8F0] dark:border-[#22314E] dark:bg-[#131C31] space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Mark
                    size={64}
                    customLogoUrl={
                      formState.logoType === "custom" ? formState.customLogoUrl : undefined
                    }
                    presetId={formState.presetId}
                    className="rounded-2xl shadow-xs"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2 text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC] shadow-2xs hover:bg-[#F1F5F9]"
                  >
                    <Upload className="size-4 text-[#0038A8]" />
                    <span>Upload Custom Image</span>
                  </button>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Square 1:1 PNG, JPG, or SVG under 2MB.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E2E8F0] dark:border-[#22314E] pt-3">
                <span className="block text-[11.5px] font-extrabold uppercase text-[#334155] dark:text-[#CBD5E1] mb-2">
                  Or Select Heritage Preset Emblem
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {LOGO_PRESETS.map((p) => {
                    const isSelected =
                      formState.logoType === "preset" && formState.presetId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setFormState((prev) => ({
                            ...prev,
                            logoType: "preset",
                            presetId: p.id,
                            customLogoUrl: null,
                          }));
                        }}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-left transition"
                        style={{
                          borderColor: isSelected ? "#0038A8" : "#E2E8F0",
                          backgroundColor: isSelected ? "#EFF6FF" : "transparent",
                        }}
                      >
                        <Mark size={32} presetId={p.id} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                            {p.name.split("(")[0]}
                          </p>
                        </div>
                        {isSelected ? <Check className="size-3.5 text-[#0038A8]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Pop>
          )}

          {/* Tab 3: Theme */}
          {activeTab === "theme" && (
            <Pop className="p-5 border border-[#E2E8F0] dark:border-[#22314E] dark:bg-[#131C31] space-y-4">
              <span className="block text-[11.5px] font-extrabold uppercase text-[#334155] dark:text-[#CBD5E1]">
                Primary Civic Accent Color
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {THEME_COLOR_OPTIONS.map((c) => {
                  const isSelected = formState.primaryColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleChange("primaryColor", c.hex)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition"
                      style={{
                        borderColor: isSelected ? c.hex : "#E2E8F0",
                        backgroundColor: isSelected ? `${c.hex}14` : "transparent",
                      }}
                    >
                      <span
                        className="size-5 rounded-full shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[13px] font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                        {c.label}
                      </span>
                      {isSelected ? (
                        <Check className="ml-auto size-4" style={{ color: c.hex }} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </Pop>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-4 py-2.5 text-[12.5px] font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9]"
            >
              <RefreshCw className="size-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-extrabold text-white shadow-md transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: C.cover, fontFamily: F.body }}
            >
              <Check className="size-4" />
              <span>Save &amp; Apply Branding</span>
            </button>
          </div>
        </div>

        {/* Right Column: Realistic Live Device Mockup */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border-2 border-[#CBD5E1] dark:border-[#334155] bg-[#FFFFFF] dark:bg-[#0B1120] p-4 shadow-md">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#22314E] pb-2 text-[11px] font-extrabold text-[#64748B] dark:text-[#94A3B8] uppercase">
              <span className="flex items-center gap-1.5">
                <Smartphone className="size-3.5 text-[#0038A8]" />
                <span>Live Device Preview</span>
              </span>
              <span className="text-[#16A34A]">● Real-Time</span>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="mt-4 rounded-2xl border border-[#E2E8F0] dark:border-[#22314E] bg-[#F8FAFC] dark:bg-[#131C31] p-3 shadow-inner">
              {/* Fake Speaker Notch */}
              <div className="mx-auto h-1.5 w-16 rounded-full bg-[#CBD5E1] dark:bg-[#334155] mb-3" />

              {/* Simulated App Header */}
              <div className="rounded-xl border border-[#E2E8F0] dark:border-[#22314E] bg-white dark:bg-[#1E293B] p-2.5 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Mark
                    size={36}
                    customLogoUrl={
                      formState.logoType === "custom" ? formState.customLogoUrl : undefined
                    }
                    presetId={formState.presetId}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span
                        className="truncate text-[16px] font-extrabold leading-none"
                        style={{ fontFamily: F.display, color: formState.primaryColor }}
                      >
                        {formState.appName || "App Name"}
                      </span>
                      {formState.appBadge ? (
                        <span
                          className="rounded px-1 py-0.5 text-[8.5px] font-extrabold uppercase text-white"
                          style={{ backgroundColor: C.red }}
                        >
                          {formState.appBadge}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block truncate text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                      {formState.appTagline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulated Mini Hero Card */}
              <div
                className="mt-3 rounded-xl p-3.5 text-white shadow-xs"
                style={{ backgroundColor: formState.primaryColor }}
              >
                <span className="text-[9px] font-extrabold text-[#FCD116] uppercase tracking-wider">
                  Region IV-A Passport
                </span>
                <p className="mt-1 text-[13px] font-bold leading-tight">
                  {formState.appName}: Explore 19 Heritage Places in 360°
                </p>
                <div className="mt-2.5 flex gap-1.5">
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[9px] font-extrabold text-white">
                    16K 360° VR
                  </span>
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[9px] font-extrabold text-white">
                    Passport Stamps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
