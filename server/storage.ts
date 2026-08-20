import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

const supabase = createClient(
  ENV.supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || ENV.supabaseAnonKey,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function normalizeKey(relKey: string) {
  return relKey.replace(/^\/+/, "");
}

function publicUrl(key: string) {
  return `${ENV.supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/menu-products/${encodeURIComponent(key).replace(/%2F/g, "/")}`;
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream") {
  const key = normalizeKey(relKey);
  const { error } = await supabase.storage.from("menu-products").upload(key, data, { contentType, upsert: true });
  if (error) throw new Error(`[Supabase Storage] upload: ${error.message}`);
  return { key, url: publicUrl(key) };
}

export async function storageDelete(relKey: string) {
  const key = normalizeKey(relKey);
  const { error } = await supabase.storage.from("menu-products").remove([key]);
  if (error) throw new Error(`[Supabase Storage] remoção: ${error.message}`);
  return { key };
}

export async function storageGet(relKey: string) {
  const key = normalizeKey(relKey);
  return { key, url: publicUrl(key) };
}

export async function storageGetSignedUrl(relKey: string) {
  const key = normalizeKey(relKey);
  const { data, error } = await supabase.storage.from("menu-products").createSignedUrl(key, 3600);
  if (error || !data?.signedUrl) throw new Error(`[Supabase Storage] signed URL: ${error?.message ?? "URL ausente"}`);
  return data.signedUrl;
}
