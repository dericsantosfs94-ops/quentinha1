import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, formatOrderMessage } from "../shared/order";

describe("WhatsApp order summary", () => {
  it("formats delivery details and subtotal", () => {
    const result = formatOrderMessage({ customerName: "Ana", fulfillment: "delivery", payment: "pix", address: "Rua das Flores, 10", lines: [{ name: "Feijão tropeiro", quantity: 2, price: 18.5 }], subtotal: 37 });
    expect(result).toContain("Nome: Ana");
    expect(result).toContain("Entrega: Rua das Flores, 10");
    expect(result).toContain("Pagamento: Pix pelo WhatsApp");
    expect(result).toContain("2x Feijão tropeiro");
    expect(result).toContain("37,00");
  });

  it("formats pickup and optional notes", () => {
    const result = formatOrderMessage({ customerName: "Bia", fulfillment: "pickup", payment: "on_delivery", notes: "Sem cebola", lines: [{ name: "Suco", quantity: 1, price: 8 }], subtotal: 8 });
    expect(result).toContain("Retirada na loja");
    expect(result).toContain("Pagamento: na entrega/retirada");
    expect(result).toContain("Observações: Sem cebola");
    expect(result).not.toContain("Entrega:");
  });

  it("builds an encoded WhatsApp URL with payment and order details", () => {
    const url = buildWhatsAppUrl({ customerName: "Carlos", fulfillment: "pickup", payment: "pix", lines: [{ name: "Prato da foto 01", quantity: 2, price: 25 }], subtotal: 50 }, "5521988678298");
    expect(url).toContain("https://api.whatsapp.com/send?phone=5521988678298&text=");
    expect(decodeURIComponent(url)).toContain("Pagamento: Pix pelo WhatsApp");
    expect(decodeURIComponent(url)).toContain("2x Prato da foto 01");
    expect(decodeURIComponent(url)).toContain("Subtotal: R$\u00a050,00");
  });
});
