import { randomUUID } from 'node:crypto';
import type { Product } from '@org/shared';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getDbPool } from './db';

export type CartItem = { product: Product; qty: number };

type CartRow = RowDataPacket & {
  product_id: string;
  quantity: number;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
};

const toCartItem = (row: CartRow): CartItem => ({
  product: {
    id: row.product_id,
    name: row.name,
    description: row.description ?? undefined,
    priceCents: row.price_cents,
    imageUrl: row.image_url ?? undefined,
  },
  qty: row.quantity,
});

class MysqlCartStore {
  private readonly pool = getDbPool();

  async listCart(userId: string): Promise<CartItem[]> {
    const [rows] = await this.pool.query<CartRow[]>(
      `SELECT ci.product_id, ci.quantity, p.name, p.description, p.price_cents, p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [userId],
    );
    return rows.map(toCartItem);
  }

  async addItem(userId: string, productId: string, qty: number): Promise<void> {
    const now = new Date();
    await this.pool.execute<ResultSetHeader>(
      `INSERT INTO cart_items (id, user_id, product_id, quantity, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = VALUES(updated_at)`,
      [randomUUID(), userId, productId, qty, now, now],
    );
  }

  async setItem(userId: string, productId: string, qty: number): Promise<boolean> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'UPDATE cart_items SET quantity = ?, updated_at = ? WHERE user_id = ? AND product_id = ?',
      [qty, new Date(), userId, productId],
    );
    return result.affectedRows > 0;
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    await this.pool.execute<ResultSetHeader>(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId],
    );
  }

  async clearCart(userId: string): Promise<void> {
    await this.pool.execute<ResultSetHeader>(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId],
    );
  }

  async mergeItems(
    userId: string,
    items: { productId: string; qty: number }[],
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const now = new Date();
    const rows = items.map((item) => [
      randomUUID(),
      userId,
      item.productId,
      item.qty,
      now,
      now,
    ]);
    await this.pool.query<ResultSetHeader>(
      `INSERT INTO cart_items (id, user_id, product_id, quantity, created_at, updated_at)
       VALUES ?
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = VALUES(updated_at)`,
      [rows],
    );
  }
}

export const cartStore = new MysqlCartStore();
