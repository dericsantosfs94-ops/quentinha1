export type MenuEvent = "view_item_list" | "add_to_cart" | "begin_checkout" | "purchase";

export function trackMenuEvent(event: MenuEvent, data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cantina:analytics", { detail: { event, ...data } }));
  if (import.meta.env.DEV) console.info(`[Cantina analytics] ${event}`, data);
}
