import 'dotenv/config';
import { db } from './client';
import { products } from './schema';
import { eq } from 'drizzle-orm';

console.log('🖼️  Migrating images...');

void (async () => {
  try {
    const allProducts = await db.select().from(products);
    console.log(`Found ${allProducts.length} products to migrate.`);

    let updatedCount = 0;
    for (const product of allProducts) {
      // If images is null or empty, populate it with legacy imageUrl + placeholder
      if (!product.images || product.images.length === 0) {
        if (product.imageUrl) {
          // Use main image + colored placeholder for verification
          const secondImg = `https://placehold.co/600x600/f2c14b/5d4000?text=Anteprima+Foto+2`;
          const newImages = [product.imageUrl, secondImg];

          await db
            .update(products)
            .set({ images: newImages })
            .where(eq(products.id, product.id));

          updatedCount++;
        }
      }
    }

    console.log(`✅ Migration complete. Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
})();
