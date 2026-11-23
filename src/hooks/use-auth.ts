import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "traveler";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  province?: string;
  avatarUrl?: string | null;
};

async function toAuthUser(user: User): Promise<AuthUser> {
  const { data: isAdmin, error } = await supabase.rpc("is_sulyap_admin");
  if (error) console.error("Could not verify administrator role", error);

  const email = user.email ?? "";
  const fullName = user.user_metadata?.["full_name"];
  const province = user.user_metadata?.["province"];
  const avatarUrl = user.user_metadata?.["avatar_url"];

  const result: AuthUser = {
    id: user.id,
    email,
    name:
      typeof fullName === "string" && fullName.trim()
        ? fullName
        : email.split("@")[0] || "Traveler",
    role: isAdmin === true ? "admin" : "traveler",
    avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
  };
  if (typeof province === "string") result.province = province;
  return result;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const updateUser = async (nextUser: User | null) => {
      const resolved = nextUser ? await toAuthUser(nextUser) : null;
      if (active) {
        setUser(resolved);
        setLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => updateUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void updateUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    province = "Cavite",
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim(), province } },
    });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    loading,
    signIn,
    signUp,
    signOut,
  };
}
