import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const file = "/home/ubuntu/upload/logo.png";
const bytes = await fs.readFile(file);
const path = "branding/cantina-do-chale-logo.png";
const { error: uploadError } = await supabase.storage.from("menu-products").upload(path, bytes, { contentType: "image/png", upsert: true, cacheControl: "31536000" });
if (uploadError) throw uploadError;
const { data } = supabase.storage.from("menu-products").getPublicUrl(path);
console.log(data.publicUrl);
