import { USERS } from '../mocks/users.data';
import { UserRecord } from './auth.types';
import { db } from '../db/client';
import { sessions, users } from '../db/schema';
import { eq, lt } from 'drizzle-orm';

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

export class MysqlAuthStore implements AuthStore {
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!row) return null;
    return row;
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!row) return null;
    return row;
  }

  async createUser(user: UserRecord): Promise<void> {
    await db.insert(users).values({
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async createSession(session: SessionRecord): Promise<void> {
    await db.insert(sessions).values({
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      createdAt: new Date(),
    });
  }

  async findSession(sessionId: string): Promise<SessionRecord | null> {
    const [row] = await db
      .select({
        id: sessions.id,
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      expiresAt: new Date(row.expiresAt),
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteExpiredSessions(): Promise<number> {
    const [result] = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()));
    return result.affectedRows;
  }
}
