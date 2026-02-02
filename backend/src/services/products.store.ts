import { eq, inArray, sql } from 'drizzle-orm';
import type { Product } from '@org/shared';
import { db } from '../db/client';
import { products } from '../db/schema';
import { PRODUCTS } from '../mocks/products.data';

export type ProductWithStock = Product & { stock: number };

class MysqlProductsStore {
  async ensureSeeded(): Promise<void> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    if (result && result.count > 0) {
      return;
    }

    const now = new Date();
    await db.insert(products).values(
      PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        priceCents: p.priceCents,
        stock: 20,
        category: null,
        imageUrl: p.imageUrl ?? null,
        createdAt: now,
        updatedAt: now,
      })),
    );
  }

  async listProducts(): Promise<Product[]> {
    const rows = await db.select().from(products).orderBy(products.name);
    return rows.map((row) => ({
      ...row,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? undefined,
      category: row.category ?? undefined,
    }));
  }

  async getProductById(productId: string): Promise<Product | null> {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!row) return null;

    return {
      ...row,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? undefined,
      category: row.category ?? undefined,
    };
  }

  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    if (productIds.length === 0) {
      return [];
    }
    const rows = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    return rows.map((row) => ({
      ...row,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? undefined,
      category: row.category ?? undefined,
    }));
  }

  async getProductsWithStock(
    productIds: string[],
  ): Promise<ProductWithStock[]> {
    if (productIds.length === 0) {
      return [];
    }
    const rows = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    return rows.map((row) => ({
      ...row,
      description: row.description ?? undefined,
      imageUrl: row.imageUrl ?? undefined,
      category: row.category ?? undefined,
    }));
  }
}

export const productsStore = new MysqlProductsStore();
