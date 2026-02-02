import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';
import { getDbPool } from '../services/db';

export const db = drizzle(getDbPool(), { schema, mode: 'default' });
