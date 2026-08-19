import { createClient } from "@supabase/supabase-js";
import type { User } from "../drizzle/schema";
import { ENV } from "./_core/env";

const supabaseAuth = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function authenticateSupabaseAdmin(accessToken: string | null | undefined): Promise<User | null> {
  if (!accessToken || !ENV.supabaseUrl || !ENV.supabaseAnonKey) return null;
  const { data, error } = await supabaseAuth.auth.getUser(accessToken);
  if (error || !data.user?.email) return null;
  if (data.user.email.toLowerCase() !== ENV.supabaseAdminEmail.toLowerCase()) return null;

  const now = new Date();
  return {
    id: -2,
    openId: `supabase:${data.user.id}`,
    name: data.user.user_metadata?.full_name || data.user.email,
    email: data.user.email,
    loginMethod: "email",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  } as User;
}
