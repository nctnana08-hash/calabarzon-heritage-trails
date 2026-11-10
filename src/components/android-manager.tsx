import { useState } from "react";
import {
  Smartphone,
  Download,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Compass,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { useAppBranding } from "@/hooks/use-app-branding";
import { Mark, Pop } from "@/components/sulyap-ui";
import { C, F } from "@/lib/sulyap-theme";

export function AndroidManager() {
  const { branding } = useAppBranding();
  const [downloading, setDownloading] = useState(false);
  const apkPath = "/downloads/sulyap-calabarzon.apk";

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = apkPath;
    link.download = `${branding.appName.toLowerCase().replace(/\s+/g, "-")}-heritage-v1.0.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Android APK download started!", {
      description: "Saved to your browser's download folder.",
    });
    setTimeout(() => setDownloading(false), 2000);
  };

  const copyApkLink = async () => {
    const fullUrl = `${window.location.origin}${apkPath}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Direct APK link copied to clipboard!");
    } catch {
      toast.error("Could not copy link automatically.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Banner */}
      <Pop className="p-6">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#0038A8] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                Native Android Build (.APK)
              </span>
              <span className="text-[12px] font-bold text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Ready for Direct Download
              </span>
            </div>

            <h2
              className="mt-3 text-[24px] font-extrabold sm:text-[28px]"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              {branding.appName} Android Application
            </h2>

            <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">
              Full native Android client with hardware-accelerated WebGL 360° virtual tours,
              CALABARZON GPS arrival validation, live branding synchronization, and smooth touch
              gestures.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-extrabold text-white shadow-md transition-transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: C.cover,
                  fontFamily: F.body,
                }}
              >
                <Download className="size-4.5" />
                <span>{downloading ? "Starting..." : "Download Android APK"}</span>
              </button>

              <button
                type="button"
                onClick={copyApkLink}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-[13.5px] font-bold text-[#1E293B] shadow-2xs hover:bg-[#F8FAFC]"
              >
                <Copy className="size-4 text-[#0038A8]" />
                <span>Copy Shareable Download Link</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center md:col-span-4">
            <div className="flex flex-col items-center rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center shadow-xs">
              <Mark
                size={64}
                customLogoUrl={branding.logoType === "custom" ? branding.customLogoUrl : undefined}
                presetId={branding.presetId}
                className="rounded-2xl shadow-md"
              />
              <h3
                className="mt-3 text-[16px] font-bold text-[#0F172A]"
                style={{ fontFamily: F.display }}
              >
                {branding.appName} {branding.appBadge}
              </h3>
              <p className="mt-0.5 font-mono text-[11px] text-[#64748B]">ph.gov.sulyap.heritage</p>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-bold text-[#0038A8]">
                <ShieldCheck className="size-3.5 text-[#16A34A]" /> Release Signed
              </div>
            </div>
          </div>
        </div>
      </Pop>

      {/* Technical Specifications & Hardware Capabilities */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Pop className="p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#0038A8]">
            <Cpu className="size-5" />
          </div>
          <h4 className="mt-3 text-[14px] font-bold text-[#1E293B]">WebGL2 Hardware Engine</h4>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Direct GPU pipeline with automatic VRAM optimization for 16K/12K heritage panoramas.
          </p>
        </Pop>

        <Pop className="p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#16A34A]">
            <Compass className="size-5" />
          </div>
          <h4 className="mt-3 text-[14px] font-bold text-[#1E293B]">GPS Geo-Fencing</h4>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Real-time coordinate verification for stamping user passports at CALABARZON sites.
          </p>
        </Pop>

        <Pop className="p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
            <Sparkles className="size-5" />
          </div>
          <h4 className="mt-3 text-[14px] font-bold text-[#1E293B]">Dynamic Customization</h4>
          <p className="mt-1 text-[12px] text-[#64748B]">
            All name, logo, thumbnail, and color updates reflect live across the mobile app.
          </p>
        </Pop>

        <Pop className="p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#7C3AED]">
            <Layers className="size-5" />
          </div>
          <h4 className="mt-3 text-[14px] font-bold text-[#1E293B]">Offline Cached Shell</h4>
          <p className="mt-1 text-[12px] text-[#64748B]">
            Smooth fallback experience with cached passport stamps even with intermittent mobile
            data.
          </p>
        </Pop>
      </div>

      {/* Installation Instructions */}
      <Pop className="p-6">
        <h3 className="text-[17px] font-extrabold text-[#1E293B]" style={{ fontFamily: F.display }}>
          Android Device Installation Instructions
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#0038A8] text-[12px] font-extrabold text-white">
              1
            </span>
            <h5 className="mt-2 text-[13px] font-bold text-[#1E293B]">Download APK</h5>
            <p className="mt-0.5 text-[12px] text-[#64748B]">
              Tap the download button above to save the installer to your device.
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#0038A8] text-[12px] font-extrabold text-white">
              2
            </span>
            <h5 className="mt-2 text-[13px] font-bold text-[#1E293B]">Open Installer</h5>
            <p className="mt-0.5 text-[12px] text-[#64748B]">
              Tap the downloaded file from your notifications bar or Downloads folder.
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#0038A8] text-[12px] font-extrabold text-white">
              3
            </span>
            <h5 className="mt-2 text-[13px] font-bold text-[#1E293B]">Allow Unknown Apps</h5>
            <p className="mt-0.5 text-[12px] text-[#64748B]">
              If prompted by Android security, toggle &quot;Allow from this source&quot;.
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#0038A8] text-[12px] font-extrabold text-white">
              4
            </span>
            <h5 className="mt-2 text-[13px] font-bold text-[#1E293B]">Launch & Tour</h5>
            <p className="mt-0.5 text-[12px] text-[#64748B]">
              Open the app icon from your home screen and start exploring Region IV-A!
            </p>
          </div>
        </div>
      </Pop>
    </div>
  );
}
