export interface ApiErrorBody {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorBody;
}

export interface ApiResponseMeta {
  status: number;
  method: string;
  path: string;
  durationMs: number;
  requestId?: string;
}

export interface ApiResult<T> {
  response: ApiResponse<T>;
  meta: ApiResponseMeta;
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function createErrorResponse(code: string, message: string): ApiResponse<never> {
  return {
    success: false,
    error: { code, message },
  };
}

export function createValidationResponse(
  message: string,
  code = "VALIDATION_ERROR"
): ApiResponse<never> {
  return createErrorResponse(code, message);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function extractErrorBody(body: unknown): ApiErrorBody {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const code =
      readString(record.code) ??
      readString(record.error) ??
      readString(record.title) ??
      "API_ERROR";
    const message =
      readString(record.message) ??
      readString(record.detail) ??
      readString(record.title) ??
      "Request failed";

    return { code, message };
  }

  return { code: "API_ERROR", message: "Request failed" };
}

export function mapFetchToApiResponse<T>(status: number, body: unknown): ApiResponse<T> {
  if (status >= 200 && status < 300) {
    return createSuccessResponse(body as T);
  }

  const error = extractErrorBody(body);
  return createErrorResponse(error.code, error.message);
}

export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & {
  success: true;
  data: T;
} {
  return response.success === true && response.data !== undefined;
}
