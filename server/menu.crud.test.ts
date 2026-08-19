import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  createProduct: vi.fn(async (input: unknown) => ({ id: 10, ...input })),
  createProductOption: vi.fn(async (input: unknown) => ({ id: 11, ...input })),
  updateProductOption: vi.fn(async ({ id, ...input }: { id: number; [key: string]: unknown }) => ({ id, ...input })),
  reorderProductOption: vi.fn(async (input: unknown) => input),
  deleteProductOption: vi.fn(async (id: number) => ({ id })),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  deleteProduct: vi.fn(),
  updateProduct: vi.fn(),
  listAdminMenu: vi.fn(async () => ({ categories: [], products: [] })),
  listMenu: vi.fn(async () => ({ categories: [], products: [] })),
  setRestaurantStatus: vi.fn(),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const adminContext = {
  user: { id: 1, openId: "admin", name: "Admin", email: null, loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: {} },
  res: { clearCookie: () => undefined },
} as unknown as TrpcContext;

const userContext = {
  user: { id: 2, openId: "regular", name: "Regular", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: {} },
  res: { clearCookie: () => undefined },
} as unknown as TrpcContext;

describe("menu CRUD contracts", () => {
  it("accepts the complete product create shape", async () => {
    const caller = appRouter.createCaller(adminContext);
    const result = await caller.menu.products.create({
      categoryId: 1,
      name: "Prato caseiro de teste",
      description: "Descrição de teste para validar o contrato do produto.",
      price: "25.00",
      imageUrl: "https://example.com/prato.webp",
      featuredOfDay: true,
    });
    expect(result).toEqual(expect.objectContaining({ id: 10, name: "Prato caseiro de teste", featuredOfDay: true }));
  });

  it("rejects malformed product payloads before persistence", async () => {
    const caller = appRouter.createCaller(adminContext);
    await expect(caller.menu.products.create({
      categoryId: 0,
      name: "x",
      description: "",
      price: "25,00",
      imageUrl: "not-a-url",
      featuredOfDay: false,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("accepts option create, update and reorder shapes", async () => {
    const caller = appRouter.createCaller(adminContext);
    const validOption = { productId: 1, name: "Porção extra", description: "Complemento de teste", priceDelta: "5.00", available: true };
    await expect(caller.menu.products.options.create(validOption)).resolves.toEqual(expect.objectContaining({ id: 11, name: "Porção extra" }));
    await expect(caller.menu.products.options.update({ id: 1, ...validOption })).resolves.toEqual(expect.objectContaining({ id: 1, name: "Porção extra" }));
    await expect(caller.menu.products.options.reorder({ id: 1, direction: "down" })).resolves.toEqual({ id: 1, direction: "down" });
  });

  it("protects product and option mutations from regular users", async () => {
    const caller = appRouter.createCaller(userContext);
    const product = { categoryId: 1, name: "Prato caseiro", description: "Descrição válida", price: "25.00", featuredOfDay: false };
    await expect(caller.menu.products.create(product)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.menu.products.options.create({ productId: 1, name: "Complemento", priceDelta: "2.00", available: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.menu.products.options.remove({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
