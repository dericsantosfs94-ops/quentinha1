import { describe, expect, it } from "vitest";
import { formatOrderMessage } from "./order";

describe("formatOrderMessage", () => {
  it("inclui cliente, entrega, itens e subtotal", () => {
    const message = formatOrderMessage({ customerName: " Ana ", fulfillment: "delivery", address: "Rua das Flores, 10", lines: [{ name: "Feijão tropeiro", quantity: 2, price: 18.5 }], subtotal: 37 });
    expect(message).toContain("Nome: Ana");
    expect(message).toContain("Entrega: Rua das Flores, 10");
    expect(message).toContain("2x Feijão tropeiro");
    expect(message).toContain("R$ 37,00");
  });

  it("usa retirada e observações sem expor endereço vazio", () => {
    const message = formatOrderMessage({ customerName: "Bia", fulfillment: "pickup", notes: "Sem cebola", lines: [{ name: "Suco", quantity: 1, price: 8 }], subtotal: 8 });
    expect(message).toContain("Retirada na loja");
    expect(message).toContain("Observações: Sem cebola");
    expect(message).not.toContain("Entrega:");
  });
});
