import { normalizeBaseUrl, type ApiConfig } from "./api-config.js";
import { TimeoutError } from "./api-errors.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  path: string;
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  authToken?: string;
  requestId?: string;
}

export interface ApiRawResponse<T = unknown> {
  ok: boolean;
  status: number;
  body: T;
  headers: Headers;
}

export interface ApiClientOptions {
  config: ApiConfig;
  fetchImpl?: typeof fetch;
  authToken?: string;
}

function buildUrl(baseUrl: string, path: string, query?: ApiRequestOptions["query"]): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizeBaseUrl(baseUrl)}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function buildHeaders(options: ApiRequestOptions, authToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = options.authToken ?? authToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.requestId) {
    headers["X-Request-Id"] = options.requestId;
  }

  return headers;
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException ||
    (error instanceof Error &&
      (error.name === "AbortError" || error.message.toLowerCase().includes("aborted")))
  );
}

async function parseJsonBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers?.get?.("content-type") ?? "";

  if (contentType.includes("application/json") || contentType.length === 0) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

export class ApiClient {
  private readonly config: ApiConfig;
  private readonly fetchImpl: typeof fetch;
  private readonly authToken?: string;

  constructor(options: ApiClientOptions) {
    this.config = options.config;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.authToken = options.authToken;
  }

  get<T>(path: string, options: Omit<ApiRequestOptions, "path" | "method" | "body"> = {}): Promise<ApiRawResponse<T>> {
    return this.request<T>({ ...options, path, method: "GET" });
  }

  post<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, "path" | "method" | "body"> = {}
  ): Promise<ApiRawResponse<T>> {
    return this.request<T>({ ...options, path, method: "POST", body });
  }

  put<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, "path" | "method" | "body"> = {}
  ): Promise<ApiRawResponse<T>> {
    return this.request<T>({ ...options, path, method: "PUT", body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, "path" | "method" | "body"> = {}
  ): Promise<ApiRawResponse<T>> {
    return this.request<T>({ ...options, path, method: "PATCH", body });
  }

  delete<T>(
    path: string,
    options: Omit<ApiRequestOptions, "path" | "method" | "body"> = {}
  ): Promise<ApiRawResponse<T>> {
    return this.request<T>({ ...options, path, method: "DELETE" });
  }

  async request<T>(options: ApiRequestOptions): Promise<ApiRawResponse<T>> {
    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs;
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.fetchImpl(buildUrl(this.config.baseUrl, options.path, options.query), {
        method: options.method,
        headers: buildHeaders(options, this.authToken),
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });

      const body = (await parseJsonBody(response)) as T;

      return {
        ok: response.ok,
        status: response.status,
        body,
        headers: response.headers,
      };
    } catch (error) {
      if (isAbortError(error)) {
        throw new TimeoutError();
      }

      throw error;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}
