import type { Product } from './product';

export interface CartItemDto {
  productId: string;
  qty: number;
}

export interface CartDto {
  items: CartItemDto[];
}

export interface CartLineViewModel {
  product: Product;
  qty: number;
}

export interface CartViewModel {
  items: CartLineViewModel[];
}
