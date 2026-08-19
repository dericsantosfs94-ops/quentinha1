export type OrderLine = { name: string; quantity: number; price: number };
export type OrderDraft = { customerName: string; fulfillment: "delivery" | "pickup"; payment: "on_delivery" | "pix"; address?: string; notes?: string; lines: OrderLine[]; subtotal: number };

export function formatOrderMessage(order: OrderDraft) {
  const items = order.lines.map((line) => `• ${line.quantity}x ${line.name} — ${line.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`).join("\n");
  const destination = order.fulfillment === "delivery" ? `Entrega: ${order.address?.trim() ?? ""}` : "Retirada na loja";
  const payment = order.payment === "pix" ? "Pagamento: Pix pelo WhatsApp" : "Pagamento: na entrega/retirada";
  return `Olá, Cantina do Chalé!\n\nGostaria de fazer um pedido.\n\nNome: ${order.customerName.trim()}\n${destination}\n${payment}\n\n${items}\n\nSubtotal: ${order.subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}${order.notes?.trim() ? `\nObservações: ${order.notes.trim()}` : ""}`;
}

export function buildWhatsAppUrl(order: OrderDraft, phone: string) {
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(formatOrderMessage(order))}`;
}
