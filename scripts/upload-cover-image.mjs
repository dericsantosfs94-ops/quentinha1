import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const bytes = await fs.readFile("/home/ubuntu/upload/fundo.png");
const path = "branding/cantina-do-chale-cover.png";
const { error } = await supabase.storage.from("menu-products").upload(path, bytes, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
if (error) throw error;
console.log(supabase.storage.from("menu-products").getPublicUrl(path).data.publicUrl);
