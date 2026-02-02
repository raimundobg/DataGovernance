export class ApiError extends Error {
  public readonly code: string;
  public readonly requestId: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(options: {
    code: string;
    message: string;
    requestId: string;
    statusCode?: number;
    details?: unknown;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.code = options.code;
    this.requestId = options.requestId;
    this.statusCode = options.statusCode || 500;
    this.details = options.details;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromResponse(response: {
    error: { code: string; message: string; details?: unknown };
    requestId: string;
  }, statusCode: number): ApiError {
    return new ApiError({
      code: response.error.code,
      message: response.error.message,
      requestId: response.requestId,
      statusCode,
      details: response.error.details,
    });
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      requestId: this.requestId,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
