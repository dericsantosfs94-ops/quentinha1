import fs from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("SUPABASE_URL e uma chave Supabase server-side são obrigatórias");

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function rest(table, method, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method,
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${table} ${method} ${response.status}: ${text}`);
  return text ? JSON.parse(text) : [];
}

async function upload(filePath, objectName) {
  const bytes = await fs.readFile(filePath);
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/menu-products/${objectName}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": objectName.endsWith(".jpg") ? "image/jpeg" : "image/webp",
      "x-upsert": "true",
    },
    body: bytes,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Storage ${objectName} ${response.status}: ${text}`);
  return `${SUPABASE_URL}/storage/v1/object/public/menu-products/${objectName}`;
}

const categories = [
  { id: 1, name: "Pratos caseiros", slug: "pratos-caseiros", icon: "soup", sort_order: 1, active: true },
  { id: 2, name: "Acompanhamentos", slug: "acompanhamentos", icon: "utensils", sort_order: 2, active: true },
  { id: 3, name: "Bebidas", slug: "bebidas", icon: "cup-soda", sort_order: 3, active: true },
  { id: 4, name: "Sobremesas", slug: "sobremesas", icon: "cake-slice", sort_order: 4, active: true },
];

const products = [
  { id: 30001, category_id: 4, name: "bolo de pote", description: "bolooo", price: "5.00", image_url: null, available: true, featured_of_day: false, sort_order: 0 },
  { id: 1, category_id: 1, name: "Prato da foto 01", description: "Nome provisório: prato feito com arroz à jardineira, farofa e filés empanados. Confirme a composição no painel.", price: "25.00", available: true, featured_of_day: false, sort_order: 1 },
  { id: 2, category_id: 1, name: "Prato da foto 02", description: "Nome provisório: prato feito com proteína ensopada, legumes coloridos e farofa. Confirme a composição.", price: "25.00", available: true, featured_of_day: false, sort_order: 2 },
  { id: 3, category_id: 1, name: "Prato da foto 03", description: "Nome provisório: massa com molho vermelho e peça de carne. Confirme a composição.", price: "25.00", available: true, featured_of_day: false, sort_order: 3 },
  { id: 4, category_id: 1, name: "Carne acebolada com fritas", description: "Nome provisório: carne acebolada acompanhada de batata frita e farofa. Confirme corte e porção.", price: "25.00", available: true, featured_of_day: false, sort_order: 4 },
  { id: 5, category_id: 1, name: "Prato da foto 05", description: "Nome provisório: carnes assadas com farofa, arroz, massa e bolinhos fritos. Confirme as proteínas e acompanhamentos.", price: "25.00", available: true, featured_of_day: false, sort_order: 5 },
  { id: 6, category_id: 1, name: "Prato da foto 06", description: "Nome provisório: prato com farofa, couve refogada e proteína com molho vermelho. Confirme a composição.", price: "25.00", available: true, featured_of_day: false, sort_order: 6 },
  { id: 7, category_id: 1, name: "Bife com fritas e salada", description: "Nome provisório: bife grelhado com batata frita, salada de maionese e farofa. Confirme corte e porção.", price: "25.00", available: true, featured_of_day: false, sort_order: 7 },
  { id: 8, category_id: 1, name: "Carne ao molho com batatas", description: "Nome provisório: carne ao molho com batatas, arroz e farofa. Confirme a proteína e a porção.", price: "25.00", available: true, featured_of_day: false, sort_order: 8 },
];

const assetRoot = "/home/ubuntu/webdev-static-assets/cantina-cardapio";
for (const product of products) {
  if (!product.id || product.id === 30001) continue;
  const extension = product.id === 3 ? "jpg" : "webp";
  const objectName = `prato-${String(product.id).padStart(2, "0")}.${extension}`;
  product.image_url = await upload(path.join(assetRoot, objectName), objectName);
}

await rest("menu_categories", "POST", categories);
await rest("menu_products", "POST", products);
await rest("restaurant_settings", "POST", { id: 1, is_open: true });

console.log(JSON.stringify({ categories: categories.length, products: products.length, uploadedImages: products.filter(product => product.image_url).length }, null, 2));
