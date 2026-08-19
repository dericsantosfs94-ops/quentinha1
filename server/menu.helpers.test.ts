import { describe, expect, it } from "vitest";
import { calculateMenuPrice, getFeaturedProducts } from "../shared/menu";

describe("menu helpers", () => {
  it("returns only available products marked as Cardápio do dia", () => {
    const result = getFeaturedProducts([
      { id: 1, price: 25, available: true, featuredOfDay: true },
      { id: 2, price: 30, available: false, featuredOfDay: true },
      { id: 3, price: 20, available: true, featuredOfDay: false },
    ]);
    expect(result.map((item) => item.id)).toEqual([1]);
  });

  it("adds only available selected options to the product price", () => {
    const price = calculateMenuPrice({
      id: 1,
      price: "25.00",
      available: true,
      featuredOfDay: false,
      options: [
        { id: 10, priceDelta: "3.50", available: true },
        { id: 11, priceDelta: 5, available: false },
      ],
    }, [10, 11]);
    expect(price).toBe(28.5);
  });
});
