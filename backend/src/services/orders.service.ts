import { randomUUID } from 'node:crypto';
import {
  Order,
  OrderDetail,
  OrderLine,
  OrderStatus,
  ShippingAddress,
} from '@org/shared';
import { PRODUCTS } from '../mocks/products.data';
import { ordersStore } from './orders.store';

const buildOrderLine = (productId: string, qty: number): OrderLine | null => {
  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product) {
    return null;
  }

  const safeQty = Math.max(1, Math.floor(qty));
  const lineTotalCents = product.priceCents * safeQty;
  return {
    productId,
    name: product.name,
    unitPriceCents: product.priceCents,
    qty: safeQty,
    lineTotalCents,
  };
};

export const createOrder = async (
  userId: string,
  items: { productId: string; qty: number }[],
  shippingAddress: ShippingAddress,
): Promise<OrderDetail | null> => {
  const lines: OrderLine[] = [];
  for (const item of items) {
    const line = buildOrderLine(item.productId, item.qty);
    if (!line) {
      return null;
    }
    lines.push(line);
  }

  const totalCents = lines.reduce(
    (total, line) => total + line.lineTotalCents,
    0,
  );
  const createdAt = new Date();
  const order: OrderDetail = {
    id: `ord-${randomUUID()}`,
    totalCents,
    createdAt: createdAt.toISOString(),
    status: 'pending',
    items: lines,
    shippingAddress,
  };
  await ordersStore.createOrder({
    id: order.id,
    userId,
    totalCents: order.totalCents,
    status: order.status,
    createdAt,
    items: order.items,
    shippingAddress: order.shippingAddress,
  });
  return order;
};

export const listOrders = async (userId: string): Promise<Order[]> =>
  ordersStore.listOrdersByUser(userId);

export const getOrderById = async (
  userId: string,
  orderId: string,
): Promise<OrderDetail | null> => ordersStore.getOrderById(userId, orderId);

export const updateOrderStatus = async (
  userId: string,
  orderId: string,
  status: OrderStatus,
): Promise<boolean> => ordersStore.updateOrderStatus(orderId, userId, status);
