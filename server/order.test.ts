import { describe, expect, it } from "vitest";
import { formatOrderMessage } from "../shared/order";

describe("WhatsApp order summary", () => {
  it("formats delivery details and subtotal", () => {
    const result = formatOrderMessage({ customerName: "Ana", fulfillment: "delivery", address: "Rua das Flores, 10", lines: [{ name: "Feijão tropeiro", quantity: 2, price: 18.5 }], subtotal: 37 });
    expect(result).toContain("Nome: Ana");
    expect(result).toContain("Entrega: Rua das Flores, 10");
    expect(result).toContain("2x Feijão tropeiro");
    expect(result).toContain("37,00");
  });

  it("formats pickup and optional notes", () => {
    const result = formatOrderMessage({ customerName: "Bia", fulfillment: "pickup", notes: "Sem cebola", lines: [{ name: "Suco", quantity: 1, price: 8 }], subtotal: 8 });
    expect(result).toContain("Retirada na loja");
    expect(result).toContain("Observações: Sem cebola");
    expect(result).not.toContain("Entrega:");
  });
});
