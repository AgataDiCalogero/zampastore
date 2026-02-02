export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
