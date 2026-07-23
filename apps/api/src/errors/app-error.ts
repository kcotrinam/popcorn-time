export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    readonly isOperational = true,
  ) { super(message); this.name = 'AppError'; }
}
