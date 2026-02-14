import { randomUUID } from 'node:crypto';
import type {
  Order,
  OrderDetail,
  OrderLine,
  OrderStatus,
  ShippingAddress,
} from '@zampa/shared';
import { db } from '../db/client';
import { orderItems, orders, products, shippingAddresses } from '../db/schema';
import { and, asc, desc, eq, gte, sql } from 'drizzle-orm';

export type CreateOrderInput = {
  id: string;
  userId: string;
  totalCents: number;
  status: OrderStatus;
  createdAt: Date;
  items: OrderLine[];
  shippingAddress: ShippingAddress;
};

export interface OrdersStore {
  createOrder(input: CreateOrderInput): Promise<void>;
  listOrdersByUser(userId: string): Promise<Order[]>;
  getOrderById(userId: string, orderId: string): Promise<OrderDetail | null>;
  updateOrderStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
  ): Promise<boolean>;
}

export class OutOfStockError extends Error {
  constructor(public readonly productId?: string) {
    super('OUT_OF_STOCK');
    this.name = 'OutOfStockError';
  }
}

const toIsoString = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

class MysqlOrdersStore implements OrdersStore {
  async createOrder(input: CreateOrderInput): Promise<void> {
    await db.transaction(async (tx) => {
      // Sort items by productId to prevent deadlocks (deterministic locking order)
      input.items.sort((a, b) => a.productId.localeCompare(b.productId));

      const createdAt = input.createdAt;

      for (const item of input.items) {
        const [result] = await tx
          .update(products)
          .set({ stock: sql`stock - ${item.qty}` })
          .where(
            and(eq(products.id, item.productId), gte(products.stock, item.qty)),
          );
        if (result.affectedRows === 0) {
          throw new OutOfStockError(item.productId);
        }
      }

      await tx.insert(orders).values({
        id: input.id,
        userId: input.userId,
        totalCents: input.totalCents,
        status: input.status,
        createdAt,
        updatedAt: createdAt,
      });

      if (input.items.length > 0) {
        await tx.insert(orderItems).values(
          input.items.map((item) => ({
            id: `oli-${randomUUID()}`,
            orderId: input.id,
            productId: item.productId,
            name: item.name,
            unitPriceCents: item.unitPriceCents,
            qty: item.qty,
            lineTotalCents: item.lineTotalCents,
            createdAt,
          })),
        );
      }

      const shipping = input.shippingAddress;
      await tx.insert(shippingAddresses).values({
        orderId: input.id,
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        address: shipping.address,
        city: shipping.city,
        postalCode: shipping.postalCode,
        country: shipping.country,
        createdAt,
        updatedAt: createdAt,
      });
    });
  }

  async listOrdersByUser(userId: string): Promise<Order[]> {
    const rows = await db
      .select({
        id: orders.id,
        totalCents: orders.totalCents,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    return rows.map((row) => ({
      id: row.id,
      totalCents: row.totalCents,
      createdAt: toIsoString(row.createdAt),
      status: row.status as OrderStatus,
    }));
  }

  async getOrderById(
    userId: string,
    orderId: string,
  ): Promise<OrderDetail | null> {
    const [order] = await db
      .select({
        id: orders.id,
        totalCents: orders.totalCents,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) {
      return null;
    }

    const items = await db
      .select({
        productId: orderItems.productId,
        name: orderItems.name,
        imageUrl: products.imageUrl,
        unitPriceCents: orderItems.unitPriceCents,
        qty: orderItems.qty,
        lineTotalCents: orderItems.lineTotalCents,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId))
      .orderBy(asc(orderItems.createdAt));

    const [shipping] = await db
      .select({
        firstName: shippingAddresses.firstName,
        lastName: shippingAddresses.lastName,
        address: shippingAddresses.address,
        city: shippingAddresses.city,
        postalCode: shippingAddresses.postalCode,
        country: shippingAddresses.country,
      })
      .from(shippingAddresses)
      .where(eq(shippingAddresses.orderId, orderId))
      .limit(1);

    if (!shipping) {
      return null;
    }

    return {
      id: order.id,
      totalCents: order.totalCents,
      createdAt: toIsoString(order.createdAt),
      status: order.status as OrderStatus,
      items: items.map((item) => ({
        ...item,
        imageUrl: item.imageUrl ?? undefined,
      })),
      shippingAddress: {
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        address: shipping.address,
        city: shipping.city,
        postalCode: shipping.postalCode,
        country: shipping.country,
      },
    };
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
  ): Promise<boolean> {
    const [result] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));
    return result.affectedRows > 0;
  }
}

export const ordersStore: OrdersStore = new MysqlOrdersStore();
