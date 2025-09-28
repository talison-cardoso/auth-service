export class AppError extends Error {
  public readonly statusCode: number;
  public readonly originalError?: unknown;

  constructor(message: string, statusCode = 400, originalError?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.originalError = originalError;
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "AppError";
  }
}
