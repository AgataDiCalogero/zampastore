import 'dotenv/config';
import { db } from './client';
import { sql } from 'drizzle-orm';

console.log('🗑️  Dropping all tables...');
void (async () => {
  try {
    // Disable Foreign Key Checks to allow dropping tables in any order
    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);

    const tables = [
      'shipping_addresses',
      'order_items',
      'orders',
      'cart_items',
      'products',
      'sessions',
      'users',
      'stripe_events',
      '__drizzle_migrations', // Clean drizzle history too if present
    ];

    for (const table of tables) {
      await db.execute(sql.raw(`DROP TABLE IF EXISTS ${table}`));
      console.log(`- Dropped ${table}`);
    }

    await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
    console.log('✅ Database reset complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  }
})();
