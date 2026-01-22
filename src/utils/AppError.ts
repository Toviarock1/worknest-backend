// src/utils/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message); // Sets the error message

    this.statusCode = statusCode;

    // Identifies "expected" errors (like validation or auth) from "bugs"
    this.isOperational = true;

    // Captures the stack trace while hiding this constructor from it
    Error.captureStackTrace(this, this.constructor);
  }
}
