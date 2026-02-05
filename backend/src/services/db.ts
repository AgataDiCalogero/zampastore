import mysql from 'mysql2/promise';
import { getEnv } from '../config/env';

let pool: mysql.Pool | null = null;

export const getDbPool = (): mysql.Pool => {
  if (pool) {
    return pool;
  }

  const env = getEnv();
  const ssl =
    env.tidb.sslMode === 'disable' || !env.tidb.ca
      ? undefined
      : { ca: env.tidb.ca };

  pool = mysql.createPool({
    host: env.tidb.host,
    port: env.tidb.port,
    user: env.tidb.user,
    password: env.tidb.password,
    database: env.tidb.database,
    ...(ssl ? { ssl } : {}),
    waitForConnections: true,
    connectionLimit: env.tidb.poolSize,
    enableKeepAlive: true,
  });

  return pool;
};

export const dbPing = async (): Promise<{ latencyMs: number }> => {
  const start = Date.now();
  const pool = getDbPool();
  await pool.query('SELECT 1');
  return { latencyMs: Date.now() - start };
};
