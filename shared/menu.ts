export type MenuOption = { id: number; priceDelta: number | string; available: boolean };
export type MenuProduct = { id: string | number; price: number | string; available: boolean; featuredOfDay: boolean; options?: MenuOption[] };

export function getFeaturedProducts<T extends MenuProduct>(products: T[]) {
  return products.filter((product) => product.available && product.featuredOfDay);
}

export function calculateMenuPrice(product: MenuProduct, selectedOptionIds: number[] = []) {
  const base = Number(product.price);
  const options = (product.options ?? []).filter((option) => option.available && selectedOptionIds.includes(option.id));
  return base + options.reduce((sum, option) => sum + Number(option.priceDelta), 0);
}
