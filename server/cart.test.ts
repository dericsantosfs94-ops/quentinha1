import { describe, expect, it } from "vitest";
import { addCartItem, cartSubtotal, changeCartQuantity } from "../shared/cart";

describe("cart operations", () => {
  it("adds a new item and increments an existing item", () => {
    const first = addCartItem([], { id: "1", price: 10 });
    const second = addCartItem(first, { id: "1", price: 10 });
    expect(first).toEqual([{ id: "1", price: 10, quantity: 1 }]);
    expect(second[0]?.quantity).toBe(2);
  });

  it("changes quantity and removes items at zero", () => {
    const items = [{ id: "1", price: 10, quantity: 2 }];
    expect(changeCartQuantity(items, "1", 1)[0]?.quantity).toBe(3);
    expect(changeCartQuantity(items, "1", -2)).toEqual([]);
  });

  it("calculates subtotal in real time", () => {
    expect(cartSubtotal([{ id: "1", price: 10, quantity: 2 }, { id: "2", price: 5.5, quantity: 1 }])).toBe(25.5);
  });
});
