import { CartItem } from './cart';
import { ShippingAddress } from './order';

export interface CreateCheckoutSessionRequest {
  items: CartItem[];
  shippingAddress: ShippingAddress;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  orderId: string;
}
