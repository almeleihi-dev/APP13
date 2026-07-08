import { extractErrorBody } from "./api-response.js";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(400, code, message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Authentication required", code = "UNAUTHORIZED") {
    super(401, code, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Access forbidden", code = "FORBIDDEN") {
    super(403, code, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(404, code, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Resource conflict", code = "CONFLICT") {
    super(409, code, message);
    this.name = "ConflictError";
  }
}

export class TimeoutError extends ApiError {
  constructor(message = "Request timed out", code = "TIMEOUT") {
    super(408, code, message);
    this.name = "TimeoutError";
  }
}

export function mapHttpStatusToError(status: number, body?: unknown): ApiError {
  const extracted = extractErrorBody(body);

  switch (status) {
    case 400:
    case 422:
      return new ValidationError(extracted.message, extracted.code);
    case 401:
      return new UnauthorizedError(extracted.message, extracted.code);
    case 403:
      return new ForbiddenError(extracted.message, extracted.code);
    case 404:
      return new NotFoundError(extracted.message, extracted.code);
    case 408:
      return new TimeoutError(extracted.message, extracted.code);
    case 409:
      return new ConflictError(extracted.message, extracted.code);
    default:
      return new ApiError(status, extracted.code, extracted.message);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof ForbiddenError;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}
