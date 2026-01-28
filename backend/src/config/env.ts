import fs from 'node:fs';

type TidbEnv = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ca: Buffer;
  poolSize: number;
};

export type AppEnv = {
  port: number;
  clientUrl: string;
  stripeSecretKey?: string;
  bcryptCost: number;
  tidb: TidbEnv;
};

const required = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};

const optional = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
};

const parseNumber = (key: string, fallback?: number): number => {
  const raw = process.env[key];
  if (!raw || raw.trim().length === 0) {
    if (fallback === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return fallback;
  }
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid number for environment variable: ${key}`);
  }
  return value;
};

const loadCa = (): Buffer => {
  const base64 = optional('TIDB_CA_BASE64');
  if (base64) {
    try {
      return Buffer.from(base64, 'base64');
    } catch {
      throw new Error('Invalid base64 value for TIDB_CA_BASE64');
    }
  }

  const caPath = optional('TIDB_CA_PATH');
  if (caPath) {
    try {
      return fs.readFileSync(caPath);
    } catch {
      throw new Error(`Unable to read CA file at path: ${caPath}`);
    }
  }

  throw new Error(
    'Missing TLS CA for TiDB. Provide TIDB_CA_BASE64 or TIDB_CA_PATH.',
  );
};

const env: AppEnv = {
  port: parseNumber('PORT', 3333),
  clientUrl: required('CLIENT_URL'),
  stripeSecretKey: optional('STRIPE_SECRET_KEY'),
  bcryptCost: parseNumber('BCRYPT_COST'),
  tidb: {
    host: required('TIDB_HOST'),
    port: parseNumber('TIDB_PORT'),
    user: required('TIDB_USER'),
    password: required('TIDB_PASSWORD'),
    database: required('TIDB_DATABASE'),
    ca: loadCa(),
    poolSize: parseNumber('TIDB_POOL_SIZE', 10),
  },
};

export const getEnv = (): AppEnv => env;
