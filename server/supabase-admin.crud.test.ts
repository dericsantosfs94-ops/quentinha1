import { afterAll, describe, expect, it } from "vitest";
import { createProduct, createProductOption, deleteProduct, deleteProductOption, listAdminMenu, updateProduct, updateProductOption } from "./db";

const shouldRun = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL);
const createdIds: number[] = [];
const createdOptionIds: number[] = [];

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
    const afterProductUpdate = await updateProduct({ id: created!.id, categoryId: created!.categoryId, name: `${name} ATUALIZADO`, description: "Descrição atualizada de regressão.", price: "21.90", imageUrl: null, available: false, featuredOfDay: true });
    const updatedProduct = afterProductUpdate.products.find(product => product.id === created!.id);
    expect(updatedProduct?.name).toBe(`${name} ATUALIZADO`);
    expect(updatedProduct?.description).toBe("Descrição atualizada de regressão.");
    expect(Number(updatedProduct?.price)).toBe(21.9);
    expect(updatedProduct?.available).toBe(false);
    expect(updatedProduct?.featuredOfDay).toBe(true);
    const afterOptionCreate = await createProductOption({ productId: created!.id, name: "Opção temporária", description: "Cobertura de teste", priceDelta: "2.50", available: true });
    const createdOption = afterOptionCreate.products.find(product => product.id === created!.id)?.options.find(option => option.name === "Opção temporária");
    expect(createdOption).toBeTruthy();
    createdOptionIds.push(createdOption!.id);
    const afterOptionUpdate = await updateProductOption({ id: createdOption!.id, productId: created!.id, name: "Opção temporária atualizada", description: "Cobertura atualizada", priceDelta: "3.00", available: true });
    expect(afterOptionUpdate.products.find(product => product.id === created!.id)?.options.some(option => option.name === "Opção temporária atualizada" && Number(option.priceDelta) === 3)).toBe(true);
    await deleteProductOption(createdOption!.id);
    await deleteProduct(created!.id);
  });
});

afterAll(async () => {
  if (createdIds.length === 0) return;
  const menu = await listAdminMenu();
  for (const id of createdOptionIds) {
    if (menu.products.some(product => product.options.some(option => option.id === id))) await deleteProductOption(id);
  }
  for (const id of createdIds) {
    if (menu.products.some(product => product.id === id)) await deleteProduct(id);
  }
});
