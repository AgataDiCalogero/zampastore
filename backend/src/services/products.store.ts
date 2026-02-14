import { eq, inArray, sql } from 'drizzle-orm';
import type { Product } from '@zampa/shared';
import { db } from '../db/client';
import { products } from '../db/schema';
import { PRODUCTS } from '../mocks/products.data';

export type ProductWithStock = Product & { stock: number };

class MysqlProductsStore {
  async ensureSeeded(): Promise<void> {
    await this.seedProducts();
  }

  async forceSeed(): Promise<void> {
    await this.seedProducts();
  }

  private async seedProducts(): Promise<void> {
    const now = new Date();
    // Use upsert to update existing or insert new
    await db
      .insert(products)
      .values(
        PRODUCTS.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description ?? '',
          priceCents: p.priceCents,
          stock: 20,
          category: p.category ?? null,
          imageUrl: p.imageUrl ?? null,
          images: p.images ?? null,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .onDuplicateKeyUpdate({
        set: {
          name: sql`VALUES(name)`,
          description: sql`VALUES(description)`,
          priceCents: sql`VALUES(price_cents)`,
          category: sql`VALUES(category)`,
          imageUrl: sql`VALUES(image_url)`,
          images: sql`VALUES(images)`,
          updatedAt: now,
        },
      });
  }

  async listProducts(category?: string): Promise<Product[]> {
    const query = category
      ? db
          .select()
          .from(products)
          .where(eq(products.category, category))
          .orderBy(products.name)
      : db.select().from(products).orderBy(products.name);

    const rows = await query;
    return rows.map((row) => ({
      ...this.mapRowToProduct(row), // Reusing private helper to reduce code
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
      images: row.images ?? undefined,
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

    return rows.map((row) => this.mapRowToProduct(row));
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
      ...this.mapRowToProduct(row),
      stock: row.stock,
    }));
  }

  private mapRowToProduct(row: typeof products.$inferSelect): Product {
    return {
      ...row,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? undefined,
      images: row.images ?? undefined,
      category: row.category ?? undefined,
    };
  }
}

export const productsStore = new MysqlProductsStore();
