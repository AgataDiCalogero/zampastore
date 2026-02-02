import { randomUUID } from 'node:crypto';
import {
  Order,
  OrderDetail,
  OrderLine,
  OrderStatus,
  ShippingAddress,
} from '@zampa/shared';
import { ordersStore, OutOfStockError } from './orders.store';
import { productsStore, type ProductWithStock } from './products.store';

export class OrderCreationError extends Error {
  constructor(public readonly code: 'invalid-products' | 'out-of-stock') {
    super(code);
    this.name = 'OrderCreationError';
  }
}

const buildOrderLines = (
  items: { productId: string; qty: number }[],
  products: Map<string, ProductWithStock>,
): OrderLine[] => {
  const lines: OrderLine[] = [];
  for (const item of items) {
    const product = products.get(item.productId);
    if (!product) {
      throw new OrderCreationError('invalid-products');
    }
    const safeQty = Math.max(1, Math.floor(item.qty));
    if (product.stock < safeQty) {
      throw new OrderCreationError('out-of-stock');
    }
    const unitPriceCents = product.priceCents;
    const lineTotalCents = unitPriceCents * safeQty;
    lines.push({
      productId: product.id,
      name: product.name,
      unitPriceCents,
      qty: safeQty,
      lineTotalCents,
    });
  }
  return lines;
};

export const createOrder = async (
  userId: string,
  items: { productId: string; qty: number }[],
  shippingAddress: ShippingAddress,
): Promise<OrderDetail> => {
  const ids = [...new Set(items.map((item) => item.productId))];
  const products = await productsStore.getProductsWithStock(ids);
  if (products.length !== ids.length) {
    throw new OrderCreationError('invalid-products');
  }
  const productMap = new Map(products.map((product) => [product.id, product]));
  const lines = buildOrderLines(items, productMap);

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
  try {
    await ordersStore.createOrder({
      id: order.id,
      userId,
      totalCents: order.totalCents,
      status: order.status,
      createdAt,
      items: order.items,
      shippingAddress: order.shippingAddress,
    });
  } catch (error) {
    if (error instanceof OutOfStockError) {
      throw new OrderCreationError('out-of-stock');
    }
    throw error;
  }
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
