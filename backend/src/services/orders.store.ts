import { randomUUID } from 'node:crypto';
import type {
  Order,
  OrderDetail,
  OrderLine,
  OrderStatus,
  ShippingAddress,
} from '@org/shared';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getDbPool } from './db';

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

type OrderRow = RowDataPacket & {
  id: string;
  total_cents: number;
  status: OrderStatus;
  created_at: Date | string;
};

type OrderItemRow = RowDataPacket & {
  product_id: string;
  name: string;
  unit_price_cents: number;
  qty: number;
  line_total_cents: number;
};

type ShippingRow = RowDataPacket & {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
};

const toIsoString = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

class MysqlOrdersStore implements OrdersStore {
  private readonly pool = getDbPool();

  async createOrder(input: CreateOrderInput): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const createdAt = input.createdAt;

      for (const item of input.items) {
        const [result] = await connection.execute<ResultSetHeader>(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.qty, item.productId, item.qty],
        );
        if (result.affectedRows === 0) {
          throw new OutOfStockError(item.productId);
        }
      }

      await connection.execute(
        'INSERT INTO orders (id, user_id, total_cents, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          input.id,
          input.userId,
          input.totalCents,
          input.status,
          createdAt,
          createdAt,
        ],
      );

      if (input.items.length > 0) {
        const rows = input.items.map((item) => [
          `oli-${randomUUID()}`,
          input.id,
          item.productId,
          item.name,
          item.unitPriceCents,
          item.qty,
          item.lineTotalCents,
          createdAt,
        ]);
        await connection.query(
          'INSERT INTO order_items (id, order_id, product_id, name, unit_price_cents, qty, line_total_cents, created_at) VALUES ?',
          [rows],
        );
      }

      const shipping = input.shippingAddress;
      await connection.execute(
        'INSERT INTO shipping_addresses (order_id, first_name, last_name, address, city, postal_code, country, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          input.id,
          shipping.firstName,
          shipping.lastName,
          shipping.address,
          shipping.city,
          shipping.postalCode,
          shipping.country,
          createdAt,
          createdAt,
        ],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listOrdersByUser(userId: string): Promise<Order[]> {
    const [rows] = await this.pool.query<OrderRow[]>(
      'SELECT id, total_cents, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
    );

    return rows.map((row) => ({
      id: row.id,
      totalCents: row.total_cents,
      createdAt: toIsoString(row.created_at),
      status: row.status,
    }));
  }

  async getOrderById(
    userId: string,
    orderId: string,
  ): Promise<OrderDetail | null> {
    const [orderRows] = await this.pool.query<OrderRow[]>(
      'SELECT id, total_cents, status, created_at FROM orders WHERE id = ? AND user_id = ? LIMIT 1',
      [orderId, userId],
    );
    const order = orderRows[0];
    if (!order) {
      return null;
    }

    const [itemRows] = await this.pool.query<OrderItemRow[]>(
      'SELECT product_id, name, unit_price_cents, qty, line_total_cents FROM order_items WHERE order_id = ? ORDER BY created_at ASC',
      [orderId],
    );

    const [shippingRows] = await this.pool.query<ShippingRow[]>(
      'SELECT first_name, last_name, address, city, postal_code, country FROM shipping_addresses WHERE order_id = ? LIMIT 1',
      [orderId],
    );
    const shipping = shippingRows[0];
    if (!shipping) {
      return null;
    }

    return {
      id: order.id,
      totalCents: order.total_cents,
      createdAt: toIsoString(order.created_at),
      status: order.status,
      items: itemRows.map((item) => ({
        productId: item.product_id,
        name: item.name,
        unitPriceCents: item.unit_price_cents,
        qty: item.qty,
        lineTotalCents: item.line_total_cents,
      })),
      shippingAddress: {
        firstName: shipping.first_name,
        lastName: shipping.last_name,
        address: shipping.address,
        city: shipping.city,
        postalCode: shipping.postal_code,
        country: shipping.country,
      },
    };
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    status: OrderStatus,
  ): Promise<boolean> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [status, new Date(), orderId, userId],
    );
    return result.affectedRows > 0;
  }
}

export const ordersStore: OrdersStore = new MysqlOrdersStore();
