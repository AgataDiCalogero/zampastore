import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './backend/src/db/schema.ts',
  out: './backend/drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env['TIDB_HOST'] || '127.0.0.1',
    user: process.env['TIDB_USER'] || 'root',
    password: process.env['TIDB_PASSWORD'] || '',
    database: process.env['TIDB_DATABASE'] || 'zampastore',
    port: Number(process.env['TIDB_PORT']) || 4000,
    ssl: process.env['TIDB_CA']
      ? { ca: process.env['TIDB_CA'] }
      : { rejectUnauthorized: false },
  },
});
