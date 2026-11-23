import { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { Mark } from "@/components/sulyap-ui";
import { C, F, PROVINCES } from "@/lib/sulyap-theme";

export function AuthModal({
  open,
  onOpenChange,
  defaultMode = "signin",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "signin" | "signup";
}) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [province, setProvince] = useState<string>("Cavite");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await signIn(email, password);
        if (res.success) {
          toast.success("Welcome back!", {
            description: "Signed in to your CALABARZON Heritage Passport account.",
          });
          onOpenChange(false);
        } else {
          toast.error(res.error || "Invalid credentials.");
        }
      } else {
        if (!fullName.trim()) {
          toast.error("Please enter your full name.");
          setLoading(false);
          return;
        }
        const res = await signUp(fullName, email, password, province);
        if (res.success) {
          toast.success("Account created successfully!", {
            description: `Welcome to SulyapPH, ${fullName}!`,
          });
          onOpenChange(false);
        } else {
          toast.error(res.error || "Could not complete registration.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md border border-[#E2E8F0] bg-white dark:bg-[#131C31] dark:border-[#22314E] text-[#0F172A] dark:text-[#F8FAFC]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Mark size={42} />
            <div>
              <DialogTitle
                className="text-[20px] font-extrabold text-[#0F172A] dark:text-[#F8FAFC]"
                style={{ fontFamily: F.display }}
              >
                {mode === "signin" ? "Sign In to Sulyap" : "Create Citizen Passport Account"}
              </DialogTitle>
              <DialogDescription
                className="text-[12.5px] text-[#64748B] dark:text-[#94A3B8]"
                style={{ fontFamily: F.body }}
              >
                Official CALABARZON Heritage Portal &amp; e-Passport Account
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="mt-2 flex rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="flex-1 cursor-pointer rounded-lg py-2 text-center text-[13px] font-bold transition"
            style={{
              backgroundColor: mode === "signin" ? C.cover : "transparent",
              color: mode === "signin" ? "#FFFFFF" : undefined,
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="flex-1 cursor-pointer rounded-lg py-2 text-center text-[13px] font-bold transition"
            style={{
              backgroundColor: mode === "signup" ? C.cover : "transparent",
              color: mode === "signup" ? "#FFFFFF" : undefined,
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-3 space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-[11.5px] font-extrabold text-[#334155] dark:text-[#CBD5E1] uppercase">
                Buong Pangalan (Full Name)
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-[14px] font-medium outline-none transition focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
              />
            </div>
          )}

          <div>
            <label className="block text-[11.5px] font-extrabold text-[#334155] dark:text-[#CBD5E1] uppercase">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.ph"
              className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-[14px] font-medium outline-none transition focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-extrabold text-[#334155] dark:text-[#CBD5E1] uppercase">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-[14px] font-medium outline-none transition focus:border-[#0038A8] focus:ring-2 focus:ring-[#0038A8]/20"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-[11.5px] font-extrabold text-[#334155] dark:text-[#CBD5E1] uppercase">
                Home Province (Lalawigan)
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-[14px] font-medium outline-none transition focus:border-[#0038A8]"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-extrabold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: C.cover, fontFamily: F.body }}
          >
            {mode === "signin" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
            <span>{loading ? "Processing..." : mode === "signin" ? "Sign In" : "Register"}</span>
          </button>
        </form>

        <div className="mt-2 text-center">
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
            {mode === "signin" ? "Don't have a passport yet?" : "Already registered?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="cursor-pointer font-bold text-[#0038A8] dark:text-[#60A5FA] hover:underline"
            >
              {mode === "signin" ? "Register Citizen Passport" : "Sign in here"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
