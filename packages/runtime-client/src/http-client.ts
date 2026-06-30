import type { RuntimeClientConfig, RuntimeProblemDetails } from "./types.js";
import { RuntimeClientError } from "./types.js";

export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  query?: Record<string, string | undefined>;
  auth?: boolean;
}

export class HttpClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly config: RuntimeClientConfig) {
    this.fetchImpl = config.fetch ?? fetch;
  }

  async request<T>(path: string, options: HttpRequestOptions = {}): Promise<T> {
    const url = new URL(path, this.config.baseUrl);
    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, value);
        }
      }
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    if (options.auth !== false) {
      const token = this.config.getAccessToken?.();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await this.fetchImpl(url.toString(), {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401) {
      this.config.onUnauthorized?.();
      throw new RuntimeClientError("Unauthorized", undefined, 401);
    }

    if (!response.ok) {
      let problem: RuntimeProblemDetails | undefined;
      try {
        problem = (await response.json()) as RuntimeProblemDetails;
      } catch {
        problem = undefined;
      }
      throw new RuntimeClientError(
        problem?.detail ?? problem?.title ?? `HTTP ${response.status}`,
        problem,
        response.status
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(path: string, query?: Record<string, string | undefined>): Promise<T> {
    return this.request<T>(path, { method: "GET", query });
  }

  post<T>(path: string, body?: Record<string, unknown>, query?: Record<string, string | undefined>): Promise<T> {
    return this.request<T>(path, { method: "POST", body, query });
  }
}
