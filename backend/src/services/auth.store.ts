import { USERS } from '../mocks/users.data';
import { UserRecord } from './auth.types';
import { getDbPool } from './db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export type SessionRecord = {
  id: string;
  userId: string;
  expiresAt: Date;
};

export interface AuthStore {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(user: UserRecord): Promise<void>;
  createSession(session: SessionRecord): Promise<void>;
  findSession(sessionId: string): Promise<SessionRecord | null>;
  deleteSession(sessionId: string): Promise<void>;
  deleteExpiredSessions(): Promise<number>;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export class InMemoryAuthStore implements AuthStore {
  private readonly users: UserRecord[];
  private readonly sessions = new Map<string, SessionRecord>();

  constructor(seedUsers: UserRecord[] = USERS) {
    this.users = [...seedUsers];
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const normalized = normalizeEmail(email);
    return (
      this.users.find(
        (record) => normalizeEmail(record.email) === normalized,
      ) ?? null
    );
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    return this.users.find((record) => record.id === id) ?? null;
  }

  async createUser(user: UserRecord): Promise<void> {
    this.users.push(user);
  }

  async createSession(session: SessionRecord): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findSession(sessionId: string): Promise<SessionRecord | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = Date.now();
    let removed = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt.getTime() <= now) {
        this.sessions.delete(id);
        removed += 1;
      }
    }
    return removed;
  }
}

type UserRow = RowDataPacket & {
  id: string;
  email: string;
  name: string;
  password_hash: string;
};

type SessionRow = RowDataPacket & {
  id: string;
  user_id: string;
  expires_at: Date;
};

const mapUserRow = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  name: row.name,
  passwordHash: row.password_hash,
});

export class MysqlAuthStore implements AuthStore {
  private readonly pool = getDbPool();

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await this.pool.query<UserRow[]>(
      'SELECT id, email, name, password_hash FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    const row = rows[0];
    return row ? mapUserRow(row) : null;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const [rows] = await this.pool.query<UserRow[]>(
      'SELECT id, email, name, password_hash FROM users WHERE id = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    return row ? mapUserRow(row) : null;
  }

  async createUser(user: UserRecord): Promise<void> {
    await this.pool.execute(
      'INSERT INTO users (id, email, name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [user.id, user.email, user.name, user.passwordHash],
    );
  }

  async createSession(session: SessionRecord): Promise<void> {
    await this.pool.execute(
      'INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, NOW())',
      [session.id, session.userId, session.expiresAt],
    );
  }

  async findSession(sessionId: string): Promise<SessionRecord | null> {
    const [rows] = await this.pool.query<SessionRow[]>(
      'SELECT id, user_id, expires_at FROM sessions WHERE id = ? LIMIT 1',
      [sessionId],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.user_id,
      expiresAt: new Date(row.expires_at),
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.pool.execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }

  async deleteExpiredSessions(): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'DELETE FROM sessions WHERE expires_at < NOW()',
    );
    return result.affectedRows ?? 0;
  }
}
