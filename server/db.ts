import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, menuCategories, menuProducts, restaurantSettings, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listMenu() {
  const db = await getDb();
  if (!db) return { categories: [], products: [], isOpen: true };
  const [categories, products, settings] = await Promise.all([
    db.select().from(menuCategories).where(eq(menuCategories.active, true)).orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name)),
    db.select().from(menuProducts).where(eq(menuProducts.available, true)).orderBy(asc(menuProducts.sortOrder), asc(menuProducts.name)),
    db.select().from(restaurantSettings).limit(1),
  ]);
  return { categories, products, isOpen: settings[0]?.isOpen ?? true };
}

export async function listAdminMenu() {
  const db = await getDb(); if (!db) return { categories: [], products: [], isOpen: true };
  const [categories, products, settings] = await Promise.all([
    db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name)),
    db.select().from(menuProducts).orderBy(asc(menuProducts.sortOrder), asc(menuProducts.name)),
    db.select().from(restaurantSettings).limit(1),
  ]);
  return { categories, products, isOpen: settings[0]?.isOpen ?? true };
}

export async function createCategory(input: { name: string; slug: string; icon: string }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.insert(menuCategories).values(input);
  return listAdminMenu();
}

export async function updateCategory(input: { id: number; name: string; slug: string; icon: string; active: boolean }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(menuCategories).set(input).where(eq(menuCategories.id, input.id));
  return listAdminMenu();
}

export async function deleteCategory(id: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.delete(menuCategories).where(eq(menuCategories.id, id));
  return listAdminMenu();
}

export async function createProduct(input: { categoryId: number; name: string; description: string; price: string; imageUrl?: string | null }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.insert(menuProducts).values(input);
  return listAdminMenu();
}

export async function updateProduct(input: { id: number; categoryId: number; name: string; description: string; price: string; imageUrl?: string | null; available: boolean }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.update(menuProducts).set(input).where(eq(menuProducts.id, input.id));
  return listAdminMenu();
}

export async function deleteProduct(id: number) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.delete(menuProducts).where(eq(menuProducts.id, id));
  return listAdminMenu();
}

export async function setRestaurantStatus(isOpen: boolean) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const current = await db.select().from(restaurantSettings).limit(1);
  if (current[0]) await db.update(restaurantSettings).set({ isOpen }).where(eq(restaurantSettings.id, current[0].id));
  else await db.insert(restaurantSettings).values({ isOpen });
  return listAdminMenu();
}
