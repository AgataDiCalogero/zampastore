export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  totalCents: number;
  createdAt: string;
  status: OrderStatus;
}

export interface OrderLine {
  productId: string;
  name: string;
  imageUrl?: string;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderDetail extends Order {
  items: OrderLine[];
  shippingAddress: ShippingAddress;
}
