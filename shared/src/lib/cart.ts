export interface CartItem {
  productId: string;
  qty: number;
}
export interface Cart {
  items: CartItem[];
}
