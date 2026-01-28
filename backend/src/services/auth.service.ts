import { randomUUID } from 'node:crypto';
import { AuthUser } from '@org/shared';
import bcrypt from 'bcrypt';
import { createSessionId, SESSION_TTL_MS } from '../utils/cookies';
import { AuthStore, MysqlAuthStore } from './auth.store';
import { getEnv } from '../config/env';
import { UserRecord } from './auth.types';

export type AuthResult = {
  user: AuthUser;
  sessionId: string;
};

const toAuthUser = (user: UserRecord): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

const normalizeEmail = (email: string): string => email.trim().toLowerCase();
const isDuplicateError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: string }).code === 'ER_DUP_ENTRY';

export class AuthService {
  constructor(private readonly store: AuthStore) {}

  async login(email: string, password: string): Promise<AuthResult | null> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.store.findUserByEmail(normalizedEmail);
    if (!user) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return null;
    }

    const sessionId = createSessionId();
    await this.store.createSession({
      id: sessionId,
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
    return { user: toAuthUser(user), sessionId };
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult | { error: 'conflict' }> {
    const normalizedEmail = normalizeEmail(email);
    const exists = await this.store.findUserByEmail(normalizedEmail);
    if (exists) {
      return { error: 'conflict' };
    }

    const passwordHash = await bcrypt.hash(password, getEnv().bcryptCost);
    const user: UserRecord = {
      id: `user-${randomUUID()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    };
    try {
      await this.store.createUser(user);
    } catch (error) {
      if (isDuplicateError(error)) {
        return { error: 'conflict' };
      }
      throw error;
    }

    const sessionId = createSessionId();
    await this.store.createSession({
      id: sessionId,
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
    return { user: toAuthUser(user), sessionId };
  }

  async getUserBySession(sessionId: string): Promise<AuthUser | null> {
    const session = await this.store.findSession(sessionId);
    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.store.deleteSession(sessionId);
      return null;
    }

    const user = await this.store.findUserById(session.userId);
    return user ? toAuthUser(user) : null;
  }

  async clearSession(sessionId: string): Promise<void> {
    await this.store.deleteSession(sessionId);
  }
}

const store = new MysqlAuthStore();
export const authService = new AuthService(store);

export const createAuthService = (): AuthService =>
  new AuthService(new MysqlAuthStore());
