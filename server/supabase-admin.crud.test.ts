import { afterAll, describe, expect, it } from "vitest";
import { createProduct, deleteProduct, listAdminMenu } from "./db";

const shouldRun = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL);
const createdIds: number[] = [];

describe.skipIf(!shouldRun)("Supabase admin CRUD", () => {
  it("cria produto com ID livre e remove o registro temporário", async () => {
    const name = `TESTE ID LIVRE ${Date.now()}`;
    const before = await listAdminMenu();
    const categoryId = before.categories[0]?.id;
    expect(categoryId).toBeTruthy();

    const afterCreate = await createProduct({
      categoryId: categoryId!,
      name,
      description: "Registro temporário de regressão.",
      price: "19.90",
      imageUrl: null,
      featuredOfDay: false,
    });
    const created = afterCreate.products.find(product => product.name === name);
    expect(created).toBeTruthy();
    expect(created!.id).toBeGreaterThan(Math.max(...before.products.map(product => product.id), 0));
    createdIds.push(created!.id);
    await deleteProduct(created!.id);
  });
});

afterAll(async () => {
  if (createdIds.length === 0) return;
  const menu = await listAdminMenu();
  for (const id of createdIds) {
    if (menu.products.some(product => product.id === id)) await deleteProduct(id);
  }
});
