import { LoginRequest, RegisterRequest } from '@org/shared';

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const MIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 2;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const parseLoginRequest = (payload: unknown): ValidationResult<LoginRequest> => {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: 'Email e password sono richieste.' };
  }

  const { email, password } = payload as Partial<LoginRequest>;
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return { ok: false, message: 'Email e password sono richieste.' };
  }

  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { ok: false, message: 'Email non valida.' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`,
    };
  }

  return { ok: true, data: { email: normalizedEmail, password } };
};

export const parseRegisterRequest = (
  payload: unknown,
): ValidationResult<RegisterRequest> => {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: 'Nome, email e password sono richiesti.' };
  }

  const { username, email, password } = payload as Partial<RegisterRequest>;
  if (
    !isNonEmptyString(username) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password)
  ) {
    return { ok: false, message: 'Nome, email e password sono richiesti.' };
  }

  if (username.trim().length < MIN_USERNAME_LENGTH) {
    return {
      ok: false,
      message: `Il nome deve avere almeno ${MIN_USERNAME_LENGTH} caratteri.`,
    };
  }

  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { ok: false, message: 'Email non valida.' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`,
    };
  }

  return {
    ok: true,
    data: { username: username.trim(), email: normalizedEmail, password },
  };
};
