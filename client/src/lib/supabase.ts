import { createClient, type Session } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase Auth is not configured in the frontend environment.");
}

export const supabase = createClient(supabaseUrl ?? "https://placeholder.supabase.co", supabaseAnonKey ?? "placeholder", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

let currentSession: Session | null = null;
void supabase.auth.getSession().then(({ data }) => {
  currentSession = data.session;
});

supabase.auth.onAuthStateChange((_event, session) => {
  currentSession = session;
});

export const getSupabaseAccessToken = () => currentSession?.access_token ?? null;
