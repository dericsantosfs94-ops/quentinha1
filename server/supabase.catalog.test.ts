import { describe, expect, it } from "vitest";
import { listMenu } from "./db";

describe("Supabase catalog integration", () => {
  it("loads the migrated catalog and public image URLs", async () => {
    const menu = await listMenu();
    expect(menu.categories.length).toBeGreaterThanOrEqual(4);
    expect(menu.products.length).toBeGreaterThanOrEqual(8);
    expect(typeof menu.isOpen).toBe("boolean");
    expect(menu.products.filter(product => product.imageUrl?.includes("supabase.co/storage")).length).toBeGreaterThanOrEqual(8);
  }, 15000);
});
