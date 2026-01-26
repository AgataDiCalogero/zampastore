import { randomUUID } from 'node:crypto';
import { AuthUser } from '@org/shared';
import { USERS, UserRecord } from '../mocks/users.data';
import { createSessionId } from '../utils/cookies';

export type AuthResult = {
  user: AuthUser;
  sessionId: string;
};

const users: UserRecord[] = [...USERS];
const sessions = new Map<string, string>();

const toAuthUser = (user: UserRecord): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const login = (email: string, password: string): AuthResult | null => {
  const normalizedEmail = normalizeEmail(email);
  const user = users.find(
    (record) =>
      normalizeEmail(record.email) === normalizedEmail &&
      record.password === password,
  );
  if (!user) {
    return null;
  }

  const sessionId = createSessionId();
  sessions.set(sessionId, user.id);
  return { user: toAuthUser(user), sessionId };
};

export const register = (
  name: string,
  email: string,
  password: string,
): AuthResult | { error: 'conflict' } => {
  const normalizedEmail = normalizeEmail(email);
  const exists = users.some(
    (record) => normalizeEmail(record.email) === normalizedEmail,
  );
  if (exists) {
    return { error: 'conflict' };
  }

  const user: UserRecord = {
    id: `user-${randomUUID()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
  };
  users.push(user);

  const sessionId = createSessionId();
  sessions.set(sessionId, user.id);
  return { user: toAuthUser(user), sessionId };
};

export const getUserBySession = (sessionId: string): AuthUser | null => {
  const userId = sessions.get(sessionId);
  if (!userId) {
    return null;
  }
  const user = users.find((record) => record.id === userId);
  return user ? toAuthUser(user) : null;
};

export const clearSession = (sessionId: string): void => {
  sessions.delete(sessionId);
};
