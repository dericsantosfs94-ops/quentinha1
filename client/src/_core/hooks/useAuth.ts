import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export type AuthUser = {
  id: number;
  openId: string;
  name: string;
  email: string | null;
  role: "admin" | "user";
};

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

const ADMIN_EMAIL = "admimsupabase@proton.me";

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const authUser = data.session?.user;
    if (!authUser?.email) {
      setUser(null);
    } else {
      setUser({
        id: -2,
        openId: `supabase:${authUser.id}`,
        name: authUser.user_metadata?.full_name || authUser.email,
        email: authUser.email,
        role: authUser.email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSession();
    const { data } = supabase.auth.onAuthStateChange(() => {
      void loadSession();
    });
    return () => data.subscription.unsubscribe();
  }, [loadSession]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || loading || user) return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    if (redirectPath) window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, loading, redirectPath, user]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error: null,
    isAuthenticated: Boolean(user),
    refresh: loadSession,
    logout,
  };
}
