import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserByOpenId } from "../db";
import { createSupabaseClient, supabase, type AppUser } from "../supabase";

export const SUPABASE_AUTH_COOKIE = "supabase_access_token";
type StoredSession = { accessToken: string; refreshToken: string; expiresAt: number };

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AppUser | null;
  supabase: SupabaseClient;
  accessToken: string | null;
};

export function encodeSessionCookie(session: StoredSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSessionCookie(value: string | undefined): StoredSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<StoredSession>;
    if (typeof parsed.accessToken === "string" && typeof parsed.refreshToken === "string" && typeof parsed.expiresAt === "number") return parsed as StoredSession;
  } catch {
    return null;
  }
  return null;
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const cookies = parseCookieHeader(opts.req.headers.cookie ?? "");
  let session = decodeSessionCookie(cookies[SUPABASE_AUTH_COOKIE]);
  let accessToken = session?.accessToken ?? (typeof opts.req.headers.authorization === "string" && opts.req.headers.authorization.startsWith("Bearer ") ? opts.req.headers.authorization.slice(7) : null);
  let client = accessToken ? createSupabaseClient(accessToken) : supabase;

  if (session && session.expiresAt <= Math.floor(Date.now() / 1000) + 60) {
    const refreshClient = createSupabaseClient();
    const { data } = await refreshClient.auth.refreshSession({ refresh_token: session.refreshToken });
    if (data.session) {
      session = { accessToken: data.session.access_token, refreshToken: data.session.refresh_token, expiresAt: data.session.expires_at ?? Math.floor(Date.now() / 1000) + (data.session.expires_in ?? 3600) };
      accessToken = session.accessToken;
      client = createSupabaseClient(accessToken);
      opts.res.cookie(SUPABASE_AUTH_COOKIE, encodeSessionCookie(session), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: Math.max(0, session.expiresAt - Math.floor(Date.now() / 1000)) * 1000 });
    }
  }

  let user: AppUser | null = null;
  if (accessToken) {
    try {
      const { data, error } = await client.auth.getUser(accessToken);
      if (!error && data.user) user = (await getUserByOpenId(data.user.id, client)) ?? null;
    } catch {
      user = null;
    }
  }
  return { req: opts.req, res: opts.res, user, supabase: client, accessToken };
}
