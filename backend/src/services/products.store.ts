import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import type { Product } from '@org/shared';
import { getDbPool } from './db';
import { PRODUCTS } from '../mocks/products.data';

export type ProductWithStock = RowDataPacket & {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  stock: number;
  category: string | null;
  image_url: string | null;
};

const toProduct = (row: ProductWithStock): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  priceCents: row.price_cents,
  imageUrl: row.image_url ?? undefined,
});

class MysqlProductsStore {
  private readonly pool = getDbPool();

  async ensureSeeded(): Promise<void> {
    const [rows] = await this.pool.query<Array<RowDataPacket & { count: number }>>(
      'SELECT COUNT(*) as count FROM products',
    );
    const count = rows[0]?.count ?? 0;
    if (count > 0) {
      return;
    }

    const now = new Date();
    const rowsToInsert = PRODUCTS.map((product) => [
      product.id,
      product.name,
      product.description ?? '',
      product.priceCents,
      20,
      null,
      product.imageUrl ?? null,
      now,
      now,
    ]);
    await this.pool.query<ResultSetHeader>(
      'INSERT INTO products (id, name, description, price_cents, stock, category, image_url, created_at, updated_at) VALUES ?',
      [rowsToInsert],
    );
  }

  async listProducts(): Promise<Product[]> {
    const [rows] = await this.pool.query<ProductWithStock[]>(
      'SELECT id, name, description, price_cents, image_url, stock, category FROM products ORDER BY name ASC',
    );
    return rows.map(toProduct);
  }

  async getProductById(productId: string): Promise<Product | null> {
    const [rows] = await this.pool.query<ProductWithStock[]>(
      'SELECT id, name, description, price_cents, image_url, stock, category FROM products WHERE id = ? LIMIT 1',
      [productId],
    );
    const row = rows[0];
    return row ? toProduct(row) : null;
  }

  async getProductsByIds(productIds: string[]): Promise<ProductWithStock[]> {
    if (productIds.length === 0) {
      return [];
    }
    const placeholders = productIds.map(() => '?').join(',');
    const [rows] = await this.pool.query<ProductWithStock[]>(
      `SELECT id, name, description, price_cents, image_url, stock, category FROM products WHERE id IN (${placeholders})`,
      productIds,
    );
    return rows;
  }
}

export const productsStore = new MysqlProductsStore();
