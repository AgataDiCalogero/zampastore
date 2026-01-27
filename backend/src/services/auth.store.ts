import { USERS } from '../mocks/users.data';
import { UserRecord } from './auth.types';

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
}
