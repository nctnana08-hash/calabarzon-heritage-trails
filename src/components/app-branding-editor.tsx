import React, { useRef, useState } from "react";
import {
  Sparkles,
  Upload,
  RefreshCw,
  Check,
  Smartphone,
  Globe,
  Sliders,
  Image as ImageIcon,
  Palette,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AppBranding,
  DEFAULT_BRANDING,
  LOGO_PRESETS,
  type LogoPresetId,
} from "@/lib/app-branding";
import { useAppBranding } from "@/hooks/use-app-branding";
import { Mark, Pop, Label, Btn } from "@/components/sulyap-ui";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formState, setFormState] = useState<AppBranding>(branding);
  const [dirty, setDirty] = useState(false);

  // Sync initial state if external branding updates
  React.useEffect(() => {
    setFormState(branding);
    setDirty(false);
  }, [branding]);

  const handleChange = <K extends keyof AppBranding>(field: K, val: AppBranding[K]) => {
    setFormState((prev) => ({ ...prev, [field]: val }));
    setDirty(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size must be under 2MB for fast mobile loading.");
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
      setDirty(true);
      toast.success("Logo uploaded! Remember to click 'Save Changes'.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateBranding(formState);
    setDirty(false);
    toast.success("App branding updated!", {
      description: "Changes are now reflected live across web and mobile app views.",
    });
  };

  const handleReset = () => {
    if (window.confirm("Reset app name, logo, and colors back to original Sulyap defaults?")) {
      resetBranding();
      setFormState(DEFAULT_BRANDING);
      setDirty(false);
      toast.info("Branding reset to defaults.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Cross-Platform Preview Header */}
      <Pop className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#0038A8]" />
            <h3
              className="text-[16px] font-extrabold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Live Cross-Platform Preview (Web & App)
            </h3>
          </div>
          <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-bold text-[#16A34A]">
            ● Real-Time Sync
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Web App Navigation Bar Simulation */}
          <div className="rounded-2xl border border-[#CBD5E1] bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#64748B] uppercase">
              <Globe className="size-3.5" /> Web Header Bar
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3">
              <Mark
                size={38}
                customLogoUrl={
                  formState.logoType === "custom" ? formState.customLogoUrl : undefined
                }
                presetId={formState.presetId}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="truncate text-[18px] font-extrabold leading-none"
                    style={{ fontFamily: F.display, color: formState.primaryColor }}
                  >
                    {formState.appName || "App Name"}
                  </span>
                  {formState.appBadge ? (
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white"
                      style={{ backgroundColor: C.red }}
                    >
                      {formState.appBadge}
                    </span>
                  ) : null}
                </div>
                <span className="mt-0.5 block truncate text-[11px] font-medium text-[#64748B]">
                  {formState.appTagline || "Heritage Portal"}
                </span>
              </div>
            </div>
          </div>

          {/* Android Launcher Icon & App Bar Simulation */}
          <div className="rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#64748B] uppercase">
              <Smartphone className="size-3.5" /> Android App Display
            </div>
            <div className="mt-3 flex items-center gap-3.5">
              <div className="relative">
                <Mark
                  size={46}
                  customLogoUrl={
                    formState.logoType === "custom" ? formState.customLogoUrl : undefined
                  }
                  presetId={formState.presetId}
                  className="rounded-2xl shadow-md"
                />
              </div>
              <div className="min-w-0">
                <h4
                  className="truncate text-[15px] font-bold"
                  style={{ fontFamily: F.display, color: C.ink }}
                >
                  {formState.appName} {formState.appBadge}
                </h4>
                <p className="text-[12px] text-[#64748B]">Native Package: ph.gov.sulyap.heritage</p>
                <span className="text-[10px] font-semibold text-[#16A34A]">
                  ✓ Verified APK Compatible
                </span>
              </div>
            </div>
          </div>
        </div>
      </Pop>

      {/* Editor Controls */}
      <Pop className="p-6">
        <div className="space-y-6">
          {/* Section 1: Names and Titles */}
          <div>
            <h3
              className="text-[18px] font-extrabold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              1. App Name & Titles
            </h3>
            <p className="mt-0.5 text-[13px] text-[#64748B]">
              Define the public name and badge shown in the navigation bars, Android launcher, and
              browser tab.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-extrabold text-[#334155] uppercase">
                  App Name
                </label>
                <input
                  type="text"
                  value={formState.appName}
                  onChange={(e) => handleChange("appName", e.target.value)}
                  placeholder="e.g. Sulyap, Lakbay Kultura"
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-[14px] font-bold outline-none transition focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
                />
              </div>

              <div>
                <label className="block text-[12px] font-extrabold text-[#334155] uppercase">
                  Badge / Suffix
                </label>
                <input
                  type="text"
                  value={formState.appBadge}
                  onChange={(e) => handleChange("appBadge", e.target.value)}
                  placeholder="e.g. PH, 2026, GOV"
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-[14px] font-bold uppercase outline-none transition focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[12px] font-extrabold text-[#334155] uppercase">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formState.appTagline}
                  onChange={(e) => handleChange("appTagline", e.target.value)}
                  placeholder="e.g. CALABARZON Heritage Portal & Virtual Tour"
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-[14px] font-medium outline-none transition focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[12px] font-extrabold text-[#334155] uppercase">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formState.appDescription}
                  onChange={(e) => handleChange("appDescription", e.target.value)}
                  placeholder="Brief description for social share and Android package overview"
                  className="mt-1 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 text-[13px] outline-none transition focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#E2E8F0]" />

          {/* Section 2: Logo and Thumbnail Customization */}
          <div>
            <h3
              className="text-[18px] font-extrabold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              2. App Logo & Thumbnail Icon
            </h3>
            <p className="mt-0.5 text-[13px] text-[#64748B]">
              Choose from pre-designed Philippine heritage emblems, upload your own image, or
              provide an image URL.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleChange("logoType", "preset")}
                className="cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold transition"
                style={{
                  backgroundColor: formState.logoType === "preset" ? C.cover : "#F1F5F9",
                  color: formState.logoType === "preset" ? "#FFFFFF" : C.ink,
                }}
              >
                Use Heritage Preset Emblem
              </button>
              <button
                type="button"
                onClick={() => handleChange("logoType", "custom")}
                className="cursor-pointer rounded-xl px-4 py-2 text-[13px] font-bold transition"
                style={{
                  backgroundColor: formState.logoType === "custom" ? C.cover : "#F1F5F9",
                  color: formState.logoType === "custom" ? "#FFFFFF" : C.ink,
                }}
              >
                Upload Custom Logo / Picture
              </button>
            </div>

            {formState.logoType === "preset" ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {LOGO_PRESETS.map((preset) => {
                  const selected = formState.presetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleChange("presetId", preset.id)}
                      className="flex cursor-pointer items-center gap-3.5 rounded-2xl border p-3.5 transition"
                      style={{
                        borderColor: selected ? "#0038A8" : "#E2E8F0",
                        backgroundColor: selected ? "#EFF6FF" : "#FFFFFF",
                      }}
                    >
                      <Mark size={40} presetId={preset.id} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[13.5px] font-bold text-[#1E293B]">{preset.name}</h4>
                          {selected ? (
                            <span className="flex size-5 items-center justify-center rounded-full bg-[#0038A8] text-white">
                              <Check className="size-3" />
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[12px] text-[#64748B]">{preset.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 space-y-4 rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    {formState.customLogoUrl ? (
                      <img
                        src={formState.customLogoUrl}
                        alt="Custom Logo Preview"
                        className="size-16 rounded-2xl border border-[#CBD5E1] object-cover shadow-2xs"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-[#94A3B8] bg-white text-[#94A3B8]">
                        <ImageIcon className="size-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
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
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-bold text-[#1E293B] shadow-2xs hover:bg-[#F1F5F9]"
                    >
                      <Upload className="size-4 text-[#0038A8]" /> Choose Image from Device
                    </button>
                    <p className="text-[11px] text-[#64748B]">
                      Supported: PNG, JPG, WebP, SVG (Square 1:1 ratio recommended, max 2MB)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-extrabold text-[#334155] uppercase">
                    Or Enter Image URL
                  </label>
                  <input
                    type="url"
                    value={formState.customLogoUrl ?? ""}
                    onChange={(e) => handleChange("customLogoUrl", e.target.value || null)}
                    placeholder="https://example.com/logo.png"
                    className="mt-1 w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2 text-[13px] font-mono outline-none transition focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-[#E2E8F0]" />

          {/* Section 3: Brand Accent Theme */}
          <div>
            <h3
              className="text-[18px] font-extrabold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              3. Theme Accent Color
            </h3>
            <p className="mt-0.5 text-[13px] text-[#64748B]">
              Primary header color applied across the web portal and Android application shell.
            </p>

            <div className="mt-3 flex flex-wrap gap-2.5">
              {THEME_COLOR_OPTIONS.map((c) => {
                const active = formState.primaryColor.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => handleChange("primaryColor", c.hex)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-[12.5px] font-bold transition"
                    style={{
                      borderColor: active ? c.hex : "#E2E8F0",
                      backgroundColor: active ? `${c.hex}14` : "#FFFFFF",
                      color: active ? c.hex : C.ink,
                    }}
                  >
                    <span
                      className="size-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.label}</span>
                    {active ? <Check className="size-3.5" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-[13px] font-bold text-[#64748B] hover:bg-[#F1F5F9]"
            >
              <RefreshCw className="size-3.5" /> Reset to Original Defaults
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-6 py-2.5 text-[14px] font-extrabold text-white shadow-md transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: C.cover,
                fontFamily: F.body,
              }}
            >
              <Check className="size-4" /> Save & Apply Branding Everywhere
            </button>
          </div>
        </div>
      </Pop>
    </div>
  );
}
