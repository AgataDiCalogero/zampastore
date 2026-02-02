import { randomUUID } from 'node:crypto';
import type { Product } from '@zampa/shared';
import { db } from '../db/client';
import { cartItems, products } from '../db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export type CartItem = { product: Product; qty: number };

class MysqlCartStore {
  async listCart(userId: string): Promise<CartItem[]> {
    const rows = await db
      .select({
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        name: products.name,
        description: products.description,
        priceCents: products.priceCents,
        imageUrl: products.imageUrl,
        category: products.category,
      })
      .from(cartItems)
      .innerJoin(products, eq(products.id, cartItems.productId))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));

    return rows.map((row) => ({
      product: {
        id: row.productId,
        name: row.name,
        description: row.description ?? undefined,
        priceCents: row.priceCents,
        imageUrl: row.imageUrl ?? undefined,
        category: row.category ?? undefined,
      },
      qty: row.quantity,
    }));
  }

  async addItem(userId: string, productId: string, qty: number): Promise<void> {
    const now = new Date();
    await db
      .insert(cartItems)
      .values({
        id: randomUUID(),
        userId,
        productId,
        quantity: qty,
        createdAt: now,
        updatedAt: now,
      })
      .onDuplicateKeyUpdate({
        set: {
          quantity: sql`quantity + VALUES(quantity)`,
          updatedAt: sql`VALUES(updated_at)`,
        },
      });
  }

  async setItem(
    userId: string,
    productId: string,
    qty: number,
  ): Promise<boolean> {
    const [result] = await db
      .update(cartItems)
      .set({ quantity: qty, updatedAt: new Date() })
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
      );
    return result.affectedRows > 0;
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)),
      );
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  async mergeItems(
    userId: string,
    items: { productId: string; qty: number }[],
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const now = new Date();
    const values = items.map((item) => ({
      id: randomUUID(),
      userId,
      productId: item.productId,
      quantity: item.qty,
      createdAt: now,
      updatedAt: now,
    }));

    await db
      .insert(cartItems)
      .values(values)
      .onDuplicateKeyUpdate({
        set: {
          quantity: sql`quantity + VALUES(quantity)`,
          updatedAt: sql`VALUES(updated_at)`,
        },
      });
  }
}

export const cartStore = new MysqlCartStore();
