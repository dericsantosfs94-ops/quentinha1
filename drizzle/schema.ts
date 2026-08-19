// Tipos legados mantidos neste caminho para compatibilidade de imports durante a migração.
// A persistência real agora é feita pelo Supabase Postgres em server/db.ts.

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

export type InsertUser = Partial<Omit<User, "id" | "createdAt" | "updatedAt">> & Pick<User, "openId">;
export type MenuCategory = { id: number; name: string; slug: string; icon: string; sortOrder: number; active: boolean; createdAt: Date };
export type MenuProduct = { id: number; categoryId: number; name: string; description: string; price: string; imageUrl: string | null; available: boolean; featuredOfDay: boolean; sortOrder: number; createdAt: Date; updatedAt: Date };
export type MenuProductOption = { id: number; productId: number; name: string; description: string | null; priceDelta: string; available: boolean; sortOrder: number; createdAt: Date; updatedAt: Date };
export type RestaurantSettings = { id: number; isOpen: boolean; updatedAt: Date };
