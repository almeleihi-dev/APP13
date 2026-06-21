export type { ApiConfig, ApiEnvironment } from "./api-config.js";
export {
  LOCAL_API_CONFIG,
  TEST_API_CONFIG,
  createApiConfig,
  normalizeBaseUrl,
  resolveApiConfig,
} from "./api-config.js";

export type { ApiErrorBody, ApiResponse, ApiResponseMeta, ApiResult } from "./api-response.js";
export {
  createErrorResponse,
  createSuccessResponse,
  createValidationResponse,
  extractErrorBody,
  isSuccessResponse,
  mapFetchToApiResponse,
} from "./api-response.js";

export {
  ApiError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
  UnauthorizedError,
  ValidationError,
  isApiError,
  isConflictError,
  isForbiddenError,
  isNotFoundError,
  isTimeoutError,
  isUnauthorizedError,
  isValidationError,
  mapHttpStatusToError,
} from "./api-errors.js";

export type {
  ApiClientOptions,
  ApiRawResponse,
  ApiRequestOptions,
  HttpMethod,
} from "./api-client.js";
export { ApiClient, createApiClient } from "./api-client.js";

export type { ExecuteRequestOptions, RequestExecutorOptions } from "./request-executor.js";
export {
  RequestExecutor,
  createRequestExecutor,
  mapResponseToResult,
} from "./request-executor.js";
