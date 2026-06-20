/** P0 platform error codes — API Architecture v1.1 / Backend §7.2 */
export const ErrorCodes = {
  IDEMPOTENCY_KEY_REQUIRED: "IDEMPOTENCY_KEY_REQUIRED",
  IDEMPOTENCY_KEY_REUSE: "IDEMPOTENCY_KEY_REUSE",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
  TIER_STALE: "TIER_STALE",
  ROLES_STALE: "ROLES_STALE",
  TIER_INSUFFICIENT: "TIER_INSUFFICIENT",
  TEKRR_DIMENSION_FORBIDDEN: "TEKRR_DIMENSION_FORBIDDEN",
  INVALID_TRANSITION: "INVALID_TRANSITION",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TEKRR_INCOMPLETE: "TEKRR_INCOMPLETE",
  CONTRACT_ALREADY_EXISTS: "CONTRACT_ALREADY_EXISTS",
  EXECUTION_BLOCKED: "EXECUTION_BLOCKED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export type EngineName =
  | "platform"
  | "identity"
  | "action"
  | "contract"
  | "execution"
  | "complaint"
  | "trust"
  | "financial";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: ErrorCode;
  engine?: EngineName;
  request_id?: string;
}

export class AppError extends Error {
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail ?? problem.title);
    this.name = "AppError";
    this.problem = problem;
  }
}

export function problem(
  partial: Omit<ProblemDetails, "type"> & { type?: string }
): ProblemDetails {
  const status = partial.status;
  return {
    type: partial.type ?? `https://app13.dev/problems/${partial.code ?? status}`,
    title: partial.title,
    status,
    detail: partial.detail,
    instance: partial.instance,
    code: partial.code,
    engine: partial.engine,
    request_id: partial.request_id,
  };
}

export function unauthorized(requestId?: string): AppError {
  return new AppError(
    problem({
      title: "Unauthorized",
      status: 401,
      code: ErrorCodes.UNAUTHORIZED,
      engine: "platform",
      detail: "Authentication required",
      request_id: requestId,
    })
  );
}

export function notFound(requestId?: string): AppError {
  return new AppError(
    problem({
      title: "Not Found",
      status: 404,
      code: ErrorCodes.NOT_FOUND,
      engine: "platform",
      detail: "Resource not found",
      request_id: requestId,
    })
  );
}

export function idempotencyKeyRequired(requestId?: string): AppError {
  return new AppError(
    problem({
      title: "Bad Request",
      status: 400,
      code: ErrorCodes.IDEMPOTENCY_KEY_REQUIRED,
      engine: "platform",
      detail: "Idempotency-Key header is required for this request",
      request_id: requestId,
    })
  );
}

export function idempotencyKeyReuse(requestId?: string): AppError {
  return new AppError(
    problem({
      title: "Conflict",
      status: 409,
      code: ErrorCodes.IDEMPOTENCY_KEY_REUSE,
      engine: "platform",
      detail: "Idempotency-Key was already used with a different request body",
      request_id: requestId,
    })
  );
}
