import 'dotenv/config';
import { db } from './client';
import { sql } from 'drizzle-orm';

/**
 * This script adds the 'images' column to the products table directly,
 * bypassing Drizzle Kit push which has issues with foreign key constraints.
 */

console.log('🔧 Adding images column to products table...');

async function addImagesColumn() {
  try {
    // Check if column already exists
    const result = await db.execute(sql`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'images'
    `);

    // Result is [rows, fields] - we only care about rows
    const rows = (result as unknown as [unknown[]])[0];
    if (rows && rows.length > 0) {
      console.log('✅ Column "images" already exists. Nothing to do.');
      process.exit(0);
    }

    // Add the column
    await db.execute(sql`
      ALTER TABLE products 
      ADD COLUMN images JSON DEFAULT NULL
    `);

    console.log('✅ Column "images" added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to add column:', err);
    process.exit(1);
  }
}

addImagesColumn();
