export type CartItem = { id: string; price: number; quantity: number };

export function addCartItem(items: CartItem[], item: Omit<CartItem, "quantity">) {
  const existing = items.find((line) => line.id === item.id);
  return existing ? items.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line) : [...items, { ...item, quantity: 1 }];
}

export function changeCartQuantity(items: CartItem[], id: string, delta: number) {
  return items.flatMap((line) => line.id !== id ? [line] : line.quantity + delta <= 0 ? [] : [{ ...line, quantity: line.quantity + delta }]);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
