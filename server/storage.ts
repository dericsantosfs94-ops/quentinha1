import { supabase } from "./supabase";

export async function storagePut(relKey: string, data: Buffer | Uint8Array, contentType = "application/octet-stream") {
  const path = relKey.replace(/^\/+/, "");
  const { error } = await supabase.storage.from("menu-products").upload(path, data, { contentType, upsert: true });
  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
  const { data: publicData } = supabase.storage.from("menu-products").getPublicUrl(path);
  return { key: path, url: publicData.publicUrl };
}

export async function storageGet(key: string) {
  const { data } = supabase.storage.from("menu-products").getPublicUrl(key);
  return { key, url: data.publicUrl };
}

export const storageGetSignedUrl = storageGet;
