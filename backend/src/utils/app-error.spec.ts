import { describe, it, expect } from 'vitest';
import { AppError } from './app-error';

describe('AppError', () => {
  it('should create an error with message and default status 500', () => {
    const error = new AppError('Test error');

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('AppError');
    expect(error.code).toBeUndefined();
  });

  it('should create an error with custom status and code', () => {
    const error = new AppError('Not found', 404, 'NOT_FOUND');

    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });
});
