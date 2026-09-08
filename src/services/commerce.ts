import { readLocal, writeLocal, useLocalState } from "./localState";

export interface CartItem { name: string; price: number; option: string; qty: number; restaurant?: string }
export const useCart = () => useLocalState<CartItem[]>("cart", []);
export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  if (!Number.isFinite(qty) || qty < 1 || !Number.isFinite(item.price) || item.price < 0) return;
  const items = readLocal<CartItem[]>("cart", []);
  const existing = items.findIndex(value => value.name === item.name && value.option === item.option && value.restaurant === item.restaurant);
  writeLocal("cart", existing === -1 ? [...items, { ...item, qty }] : items.map((value, index) => index === existing ? { ...value, qty: value.qty + qty } : value));
}
export function cartTotals(items: CartItem[], coupon = "", tip = 0) {
  const subtotal = items.reduce((total, item) => total + item.price * item.qty, 0);
  const delivery = items.length ? 2000 : 0;
  const discount = coupon === "HALAL3000" ? Math.min(3000, subtotal) : 0;
  return { subtotal, delivery, discount, total: subtotal + delivery - discount + tip };
}
export function changeMenuQuantity(item: Omit<CartItem, "qty">, delta: number) {
  if (delta > 0) { addToCart(item, delta); return; }
  const items = readLocal<CartItem[]>("cart", []);
  const index = items.findIndex(value => value.name === item.name && value.option === item.option && value.restaurant === item.restaurant);
  if (index < 0) return;
  writeLocal("cart", items.map((value, i) => i === index ? { ...value, qty: Math.max(0, value.qty + delta) } : value).filter(value => value.qty > 0));
}

export interface OrderPreview { items: CartItem[]; total: number; date?: string; payment?: string; tip?: number; coupon?: string }
export const useOrderPreview = () => useLocalState<OrderPreview | null>("last-order-preview", null);
