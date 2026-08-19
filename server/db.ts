import { mapUser, supabase, type AppUser, type SupabaseUserRow } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

type CategoryRow = { id: number; name: string; slug: string; icon: string; sort_order: number; active: boolean; created_at: string };
type ProductRow = { id: number; category_id: number; name: string; description: string; price: string | number; image_url: string | null; available: boolean; featured_of_day: boolean; sort_order: number; created_at: string; updated_at: string };
type OptionRow = { id: number; product_id: number; name: string; description: string | null; price_delta: string | number; available: boolean; sort_order: number; created_at: string; updated_at: string };

type Category = { id: number; name: string; slug: string; icon: string; sortOrder: number; active: boolean; createdAt: Date };
type ProductOption = { id: number; productId: number; name: string; description: string | null; priceDelta: string; available: boolean; sortOrder: number; createdAt: Date; updatedAt: Date };
type Product = { id: number; categoryId: number; name: string; description: string; price: string; imageUrl: string | null; available: boolean; featuredOfDay: boolean; sortOrder: number; createdAt: Date; updatedAt: Date; options: ProductOption[] };

function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug, icon: row.icon, sortOrder: row.sort_order, active: row.active, createdAt: new Date(row.created_at) };
}

function mapOption(row: OptionRow): ProductOption {
  return { id: row.id, productId: row.product_id, name: row.name, description: row.description, priceDelta: String(row.price_delta), available: row.available, sortOrder: row.sort_order, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) };
}

function mapProduct(row: ProductRow, options: ProductOption[] = []): Product {
  return { id: row.id, categoryId: row.category_id, name: row.name, description: row.description, price: String(row.price), imageUrl: row.image_url, available: row.available, featuredOfDay: row.featured_of_day, sortOrder: row.sort_order, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at), options };
}

async function readSettings(client: SupabaseClient = supabase) {
  const { data, error } = await client.from("restaurant_settings").select("is_open").order("id", { ascending: true }).limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.is_open ?? true;
}

async function readMenu(includeInactive: boolean, client: SupabaseClient = supabase) {
  const categoriesQuery = client.from("menu_categories").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });
  const productsQuery = client.from("menu_products").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });
  const optionsQuery = client.from("menu_product_options").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });
  const [{ data: categoryRows, error: categoryError }, { data: productRows, error: productError }, { data: optionRows, error: optionError }, isOpen] = await Promise.all([
    includeInactive ? categoriesQuery : categoriesQuery.eq("active", true),
    includeInactive ? productsQuery : productsQuery.eq("available", true),
    includeInactive ? optionsQuery : optionsQuery.eq("available", true),
    readSettings(),
  ]);
  if (categoryError) throw new Error(categoryError.message);
  if (productError) throw new Error(productError.message);
  if (optionError) throw new Error(optionError.message);
  const options = ((optionRows ?? []) as OptionRow[]).map(mapOption);
  return {
    categories: ((categoryRows ?? []) as CategoryRow[]).map(mapCategory),
    products: ((productRows ?? []) as ProductRow[]).map((row) => mapProduct(row, options.filter((option) => option.productId === row.id))),
    isOpen,
  };
}

export async function listMenu(client: SupabaseClient = supabase) { return readMenu(false, client); }
export async function listAdminMenu(client: SupabaseClient = supabase) { return readMenu(true, client); }

export async function getUserByOpenId(openId: string, client: SupabaseClient = supabase): Promise<AppUser | undefined> {
  const { data, error } = await client.from("users").select("*").eq("open_id", openId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapUser(data as SupabaseUserRow) : undefined;
}

export async function upsertUser(user: { openId: string; name?: string | null; email?: string | null; loginMethod?: string | null; role?: "user" | "admin"; lastSignedIn?: Date }, client: SupabaseClient = supabase): Promise<void> {
  const { error } = await client.from("users").upsert({ open_id: user.openId, name: user.name ?? null, email: user.email ?? null, login_method: user.loginMethod ?? "email", ...(user.role ? { role: user.role } : {}), last_signed_in: (user.lastSignedIn ?? new Date()).toISOString() }, { onConflict: "open_id" });
  if (error) throw new Error(error.message);
}

async function refreshAdminMenu(client: SupabaseClient = supabase) { return listAdminMenu(client); }

export async function createCategory(input: { name: string; slug: string; icon: string }, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_categories").insert({ name: input.name, slug: input.slug, icon: input.icon });
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function updateCategory(input: { id: number; name: string; slug: string; icon: string; active: boolean }, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_categories").update({ name: input.name, slug: input.slug, icon: input.icon, active: input.active }).eq("id", input.id);
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function deleteCategory(id: number, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function createProduct(input: { categoryId: number; name: string; description: string; price: string; imageUrl?: string | null; featuredOfDay: boolean }, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_products").insert({ category_id: input.categoryId, name: input.name, description: input.description, price: input.price, image_url: input.imageUrl ?? null, featured_of_day: input.featuredOfDay });
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function updateProduct(input: { id: number; categoryId: number; name: string; description: string; price: string; imageUrl?: string | null; available: boolean; featuredOfDay: boolean }, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_products").update({ category_id: input.categoryId, name: input.name, description: input.description, price: input.price, image_url: input.imageUrl ?? null, available: input.available, featured_of_day: input.featuredOfDay }).eq("id", input.id);
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function deleteProduct(id: number, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function createProductOption(input: { productId: number; name: string; description?: string | null; priceDelta: string; available: boolean }, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_product_options").insert({ product_id: input.productId, name: input.name, description: input.description ?? null, price_delta: input.priceDelta, available: input.available });
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function updateProductOption(input: { id: number; productId: number; name: string; description?: string | null; priceDelta: string; available: boolean }, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_product_options").update({ product_id: input.productId, name: input.name, description: input.description ?? null, price_delta: input.priceDelta, available: input.available }).eq("id", input.id);
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function reorderProductOption(input: { id: number; direction: "up" | "down" }, client: SupabaseClient = supabase) {
  const { data: current, error: currentError } = await client.from("menu_product_options").select("*").eq("id", input.id).maybeSingle();
  if (currentError) throw new Error(currentError.message);
  if (!current) return refreshAdminMenu(client);
  const { data: siblings, error: siblingError } = await client.from("menu_product_options").select("*").eq("product_id", current.product_id).order("sort_order", { ascending: true }).order("id", { ascending: true });
  if (siblingError) throw new Error(siblingError.message);
  const index = (siblings ?? []).findIndex((option) => option.id === current.id);
  const target = (siblings ?? [])[input.direction === "up" ? index - 1 : index + 1];
  if (target) {
    const first = await client.from("menu_product_options").update({ sort_order: target.sort_order }).eq("id", current.id);
    if (first.error) throw new Error(first.error.message);
    const second = await client.from("menu_product_options").update({ sort_order: current.sort_order }).eq("id", target.id);
    if (second.error) throw new Error(second.error.message);
  }
  return refreshAdminMenu(client);
}

export async function deleteProductOption(id: number, client: SupabaseClient = supabase) {
  const { error } = await client.from("menu_product_options").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return refreshAdminMenu(client);
}

export async function setRestaurantStatus(isOpen: boolean, client: SupabaseClient = supabase) {
  const { data: current, error: currentError } = await client.from("restaurant_settings").select("id").order("id", { ascending: true }).limit(1).maybeSingle();
  if (currentError) throw new Error(currentError.message);
  const result = current ? await client.from("restaurant_settings").update({ is_open: isOpen }).eq("id", current.id) : await client.from("restaurant_settings").insert({ is_open: isOpen });
  if (result.error) throw new Error(result.error.message);
  return refreshAdminMenu(client);
}
