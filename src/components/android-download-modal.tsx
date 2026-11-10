import { useState } from "react";
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAppBranding } from "@/hooks/use-app-branding";
import { Mark } from "@/components/sulyap-ui";
import { C, F } from "@/lib/sulyap-theme";

export function AndroidDownloadModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
      description: "Check your browser Downloads or notification bar.",
    });
    setTimeout(() => setDownloading(false), 2000);
  };

  const copyLink = async () => {
    const fullUrl = `${window.location.origin}${apkPath}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("APK direct download link copied to clipboard!");
    } catch {
      toast.error("Could not copy link automatically.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E2E8F0",
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Mark
              size={48}
              customLogoUrl={branding.logoType === "custom" ? branding.customLogoUrl : null}
              presetId={branding.presetId}
            />
            <div>
              <DialogTitle
                className="text-[20px] font-extrabold sm:text-[22px]"
                style={{ fontFamily: F.display, color: C.ink }}
              >
                Download {branding.appName} for Android
              </DialogTitle>
              <DialogDescription
                className="text-[13px] font-medium"
                style={{ fontFamily: F.body, color: C.mute }}
              >
                Native Android package (.APK) · Fully functional 360° virtual tour
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* App Card Preview */}
          <div className="flex items-center justify-between rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-3.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#0038A8] px-2 py-0.5 text-[11px] font-extrabold text-white">
                  v1.0.0 RELEASE
                </span>
                <span className="text-[12px] font-bold text-[#64748B]">Android 8.0+</span>
              </div>
              <p className="text-[12px] font-medium text-[#334155]">
                Package: <code className="font-mono text-[11px]">ph.gov.sulyap.heritage</code>
              </p>
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 py-1.5 text-[12px] font-bold text-[#1E293B] shadow-2xs hover:bg-[#F1F5F9]"
            >
              <Copy className="size-3.5 text-[#0038A8]" /> Copy Link
            </button>
          </div>

          {/* Highlights & Features */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-2xs">
            <h4
              className="text-[12px] font-extrabold tracking-wider text-[#64748B] uppercase"
              style={{ fontFamily: F.body }}
            >
              Included Native Capabilities
            </h4>
            <ul className="mt-2.5 space-y-2 text-[13px]" style={{ fontFamily: F.body }}>
              <li className="flex items-center gap-2 text-[#1E293B]">
                <CheckCircle2 className="size-4 shrink-0 text-[#16A34A]" />
                <span>Full WebGL2 hardware acceleration for 16K/12K 360° tours</span>
              </li>
              <li className="flex items-center gap-2 text-[#1E293B]">
                <CheckCircle2 className="size-4 shrink-0 text-[#16A34A]" />
                <span>Real-time app name, logo & thumbnail synchronization</span>
              </li>
              <li className="flex items-center gap-2 text-[#1E293B]">
                <CheckCircle2 className="size-4 shrink-0 text-[#16A34A]" />
                <span>GPS geofencing for CALABARZON passport stamps</span>
              </li>
              <li className="flex items-center gap-2 text-[#1E293B]">
                <CheckCircle2 className="size-4 shrink-0 text-[#16A34A]" />
                <span>Offline cached fallback shell & full responsive touch gestures</span>
              </li>
            </ul>
          </div>

          {/* Direct Download Action Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl py-3.5 text-[15px] font-extrabold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: C.cover,
              fontFamily: F.body,
            }}
          >
            <Download className="size-5" />
            <span>{downloading ? "Starting Download..." : "Download Android App (.APK)"}</span>
          </button>

          {/* Step-by-Step Installation Guide */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF] p-3.5">
            <div className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#0038A8]">
              <Info className="size-4 shrink-0" />
              <span>How to Install on Your Android Device</span>
            </div>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[12.5px] text-[#1E3A8A]">
              <li>
                Tap <strong>Download Android App (.APK)</strong> above.
              </li>
              <li>Once downloaded, tap the file in your notification bar or file manager.</li>
              <li>
                If Android prompts <em>&quot;Install unknown apps&quot;</em>, toggle{" "}
                <strong>Allow from this source</strong>.
              </li>
              <li>
                Tap <strong>Install</strong> to start exploring CALABARZON in 360°!
              </li>
            </ol>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-[#16A34A]" /> Clean & verified APK package
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer font-bold hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
