import { createApiClient, type ApiClient, type ApiClientOptions, type ApiRequestOptions } from "./api-client.js";
import { mapFetchToApiResponse, type ApiResult } from "./api-response.js";
import { mapHttpStatusToError } from "./api-errors.js";

export interface RequestExecutorOptions extends ApiClientOptions {
  client?: ApiClient;
}

export interface ExecuteRequestOptions extends ApiRequestOptions {
  throwOnError?: boolean;
}

export class RequestExecutor {
  private readonly client: ApiClient;

  constructor(options: RequestExecutorOptions) {
    this.client = options.client ?? createApiClient(options);
  }

  async execute<T>(options: ExecuteRequestOptions): Promise<ApiResult<T>> {
    const startedAt = Date.now();
    const raw = await this.client.request<T>(options);
    const durationMs = Date.now() - startedAt;
    const response = mapFetchToApiResponse<T>(raw.status, raw.body);
    const meta = {
      status: raw.status,
      method: options.method,
      path: options.path,
      durationMs,
      requestId: options.requestId,
    };

    if (!response.success && options.throwOnError) {
      throw mapHttpStatusToError(raw.status, raw.body);
    }

    return { response, meta };
  }

  get<T>(path: string, options: Omit<ExecuteRequestOptions, "path" | "method" | "body"> = {}): Promise<ApiResult<T>> {
    return this.execute<T>({ ...options, path, method: "GET" });
  }

  post<T>(
    path: string,
    body?: unknown,
    options: Omit<ExecuteRequestOptions, "path" | "method" | "body"> = {}
  ): Promise<ApiResult<T>> {
    return this.execute<T>({ ...options, path, method: "POST", body });
  }

  put<T>(
    path: string,
    body?: unknown,
    options: Omit<ExecuteRequestOptions, "path" | "method" | "body"> = {}
  ): Promise<ApiResult<T>> {
    return this.execute<T>({ ...options, path, method: "PUT", body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    options: Omit<ExecuteRequestOptions, "path" | "method" | "body"> = {}
  ): Promise<ApiResult<T>> {
    return this.execute<T>({ ...options, path, method: "PATCH", body });
  }

  delete<T>(
    path: string,
    options: Omit<ExecuteRequestOptions, "path" | "method" | "body"> = {}
  ): Promise<ApiResult<T>> {
    return this.execute<T>({ ...options, path, method: "DELETE" });
  }
}

export function createRequestExecutor(options: RequestExecutorOptions): RequestExecutor {
  return new RequestExecutor(options);
}

export function mapResponseToResult<T>(
  status: number,
  method: string,
  path: string,
  body: unknown,
  durationMs = 0,
  requestId?: string
): ApiResult<T> {
  return {
    response: mapFetchToApiResponse<T>(status, body),
    meta: {
      status,
      method,
      path,
      durationMs,
      requestId,
    },
  };
}
