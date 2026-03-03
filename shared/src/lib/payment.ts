import type { CartItemDto } from './cart';
import type { ShippingAddress } from './order';

export interface CreateCheckoutSessionRequest {
  items: CartItemDto[];
  shippingAddress: ShippingAddress;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  orderId: string;
}
