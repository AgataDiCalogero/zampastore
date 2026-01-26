import { randomUUID } from 'node:crypto';
import { Order, OrderDetail, OrderLine, ShippingAddress } from '@org/shared';
import { PRODUCTS } from '../mocks/products.data';

type StoredOrder = OrderDetail & { userId: string };

const orders: StoredOrder[] = [];

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

export const createOrder = (
  userId: string,
  items: { productId: string; qty: number }[],
  shippingAddress: ShippingAddress,
): OrderDetail | null => {
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
  const order: StoredOrder = {
    id: `ord-${randomUUID()}`,
    totalCents,
    createdAt: new Date().toISOString(),
    status: 'pending',
    items: lines,
    shippingAddress,
    userId,
  };
  orders.unshift(order);
  return order;
};

export const listOrders = (userId: string): Order[] =>
  orders
    .filter((order) => order.userId === userId)
    .map((order) => ({
      id: order.id,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      status: order.status,
    }));

export const getOrderById = (
  userId: string,
  orderId: string,
): OrderDetail | null => {
  const order = orders.find(
    (entry) => entry.userId === userId && entry.id === orderId,
  );
  if (!order) {
    return null;
  }
  return {
    id: order.id,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    status: order.status,
    items: order.items,
    shippingAddress: order.shippingAddress,
  };
};
