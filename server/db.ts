import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

const supabaseUrl = /^https?:\/\//.test(ENV.supabaseUrl) ? ENV.supabaseUrl : "https://invalid.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ENV.supabaseAnonKey || "invalid-key";
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function getDb() { return supabase; }

export type MenuCategory = { id: number; name: string; slug: string; icon: string; sortOrder: number; active: boolean; createdAt?: string };
export type MenuProductOption = { id: number; productId: number; name: string; description: string | null; priceDelta: string; available: boolean; sortOrder: number; createdAt?: string; updatedAt?: string };
export type MenuProduct = { id: number; categoryId: number; name: string; description: string; price: string; imageUrl: string | null; available: boolean; featuredOfDay: boolean; sortOrder: number; createdAt?: string; updatedAt?: string; options: MenuProductOption[] };
export type MenuData = { categories: MenuCategory[]; products: MenuProduct[]; isOpen: boolean };

function fail(error: { message?: string } | null, operation: string): never { throw new Error(`[Supabase] ${operation}: ${error?.message ?? "operação não concluída"}`); }
function category(row: any): MenuCategory { return { id: row.id, name: row.name, slug: row.slug, icon: row.icon ?? "utensils", sortOrder: row.sort_order ?? 0, active: row.active ?? true, createdAt: row.created_at }; }
function option(row: any): MenuProductOption { return { id: row.id, productId: row.product_id, name: row.name, description: row.description ?? null, priceDelta: String(row.price_delta ?? "0.00"), available: row.available ?? true, sortOrder: row.sort_order ?? 0, createdAt: row.created_at, updatedAt: row.updated_at }; }
function product(row: any, options: MenuProductOption[]): MenuProduct { return { id: row.id, categoryId: row.category_id, name: row.name, description: row.description, price: String(row.price), imageUrl: row.image_url ?? null, available: row.available ?? true, featuredOfDay: row.featured_of_day ?? false, sortOrder: row.sort_order ?? 0, createdAt: row.created_at, updatedAt: row.updated_at, options: options.filter(item => item.productId === row.id) }; }

async function loadMenu(includeUnavailable: boolean): Promise<MenuData> {
  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) return { categories: [], products: [], isOpen: true };
  let categoriesQuery = supabase.from("menu_categories").select("*").order("sort_order").order("name");
  let productsQuery = supabase.from("menu_products").select("*").order("sort_order").order("name");
  let optionsQuery = supabase.from("menu_product_options").select("*").order("sort_order").order("name");
  if (!includeUnavailable) {
    categoriesQuery = categoriesQuery.eq("active", true);
    productsQuery = productsQuery.eq("available", true);
    optionsQuery = optionsQuery.eq("available", true);
  }
  const [categoriesResult, productsResult, optionsResult, settingsResult] = await Promise.all([
    categoriesQuery,
    productsQuery,
    optionsQuery,
    supabase.from("restaurant_settings").select("is_open").limit(1),
  ]);
  if (categoriesResult.error) fail(categoriesResult.error, "carregar categorias");
  if (productsResult.error) fail(productsResult.error, "carregar produtos");
  if (optionsResult.error) fail(optionsResult.error, "carregar opções");
  if (settingsResult.error) fail(settingsResult.error, "carregar status");
  const options = (optionsResult.data ?? []).map(option);
  return { categories: (categoriesResult.data ?? []).map(category), products: (productsResult.data ?? []).map(row => product(row, options)), isOpen: settingsResult.data?.[0]?.is_open ?? true };
}

export const listMenu = () => loadMenu(false);
export const listAdminMenu = () => loadMenu(true);
export async function upsertUser(_user: unknown): Promise<void> {}
export async function getUserByOpenId(_openId: string): Promise<any> { return undefined; }

export async function createCategory(input: { name: string; slug: string; icon: string }) { const { error } = await supabase.from("menu_categories").insert({ name: input.name, slug: input.slug, icon: input.icon }); if (error) fail(error, "criar categoria"); return listAdminMenu(); }
export async function updateCategory(input: { id: number; name: string; slug: string; icon: string; active: boolean }) { const { error } = await supabase.from("menu_categories").update({ name: input.name, slug: input.slug, icon: input.icon, active: input.active }).eq("id", input.id); if (error) fail(error, "atualizar categoria"); return listAdminMenu(); }
export async function deleteCategory(id: number) { const { error } = await supabase.from("menu_categories").delete().eq("id", id); if (error) fail(error, "remover categoria"); return listAdminMenu(); }
export async function createProduct(input: { categoryId: number; name: string; description: string; price: string; imageUrl?: string | null; featuredOfDay: boolean }) { const { error } = await supabase.from("menu_products").insert({ category_id: input.categoryId, name: input.name, description: input.description, price: input.price, image_url: input.imageUrl ?? null, featured_of_day: input.featuredOfDay }); if (error) fail(error, "criar produto"); return listAdminMenu(); }
export async function updateProduct(input: { id: number; categoryId: number; name: string; description: string; price: string; imageUrl?: string | null; available: boolean; featuredOfDay: boolean }) { const { error } = await supabase.from("menu_products").update({ category_id: input.categoryId, name: input.name, description: input.description, price: input.price, image_url: input.imageUrl ?? null, available: input.available, featured_of_day: input.featuredOfDay }).eq("id", input.id); if (error) fail(error, "atualizar produto"); return listAdminMenu(); }
export async function createProductOption(input: { productId: number; name: string; description?: string | null; priceDelta: string; available: boolean }) { const { error } = await supabase.from("menu_product_options").insert({ product_id: input.productId, name: input.name, description: input.description ?? null, price_delta: input.priceDelta, available: input.available }); if (error) fail(error, "criar opção"); return listAdminMenu(); }
export async function updateProductOption(input: { id: number; productId: number; name: string; description?: string | null; priceDelta: string; available: boolean }) { const { error } = await supabase.from("menu_product_options").update({ product_id: input.productId, name: input.name, description: input.description ?? null, price_delta: input.priceDelta, available: input.available }).eq("id", input.id); if (error) fail(error, "atualizar opção"); return listAdminMenu(); }
export async function reorderProductOption(input: { id: number; direction: "up" | "down" }) { const { data: current, error: currentError } = await supabase.from("menu_product_options").select("*").eq("id", input.id).maybeSingle(); if (currentError) fail(currentError, "buscar opção"); if (!current) return listAdminMenu(); const { data: siblings, error: siblingsError } = await supabase.from("menu_product_options").select("*").eq("product_id", current.product_id).order("sort_order").order("id"); if (siblingsError) fail(siblingsError, "buscar opções"); const index = (siblings ?? []).findIndex(item => item.id === current.id); const target = (siblings ?? [])[input.direction === "up" ? index - 1 : index + 1]; if (target) { const first = await supabase.from("menu_product_options").update({ sort_order: target.sort_order }).eq("id", current.id); if (first.error) fail(first.error, "reordenar opção atual"); const second = await supabase.from("menu_product_options").update({ sort_order: current.sort_order }).eq("id", target.id); if (second.error) fail(second.error, "reordenar opção alvo"); } return listAdminMenu(); }
export async function deleteProductOption(id: number) { const { error } = await supabase.from("menu_product_options").delete().eq("id", id); if (error) fail(error, "remover opção"); return listAdminMenu(); }
export async function deleteProduct(id: number) { const { error } = await supabase.from("menu_products").delete().eq("id", id); if (error) fail(error, "remover produto"); return listAdminMenu(); }
export async function setRestaurantStatus(isOpen: boolean) { const { data: current, error: currentError } = await supabase.from("restaurant_settings").select("id").limit(1).maybeSingle(); if (currentError) fail(currentError, "buscar status"); const result = current ? await supabase.from("restaurant_settings").update({ is_open: isOpen }).eq("id", current.id) : await supabase.from("restaurant_settings").insert({ is_open: isOpen }); if (result.error) fail(result.error, "atualizar status"); return listAdminMenu(); }
