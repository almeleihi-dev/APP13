import type { ProviderProfileInput, ProviderProfileResult } from "../../provider/intelligence/types.js";
import { buildProviderProfilePayload } from "./provider-payload.js";
import type { ProviderProfileExecutor, ProviderProfileFormInput, ProviderClientOptions } from "./types.js";

export class ProviderClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ProviderClientError";
    this.status = status;
    this.code = code;
  }
}

export class ProviderClient {
  private readonly baseUrl: string;
  private readonly authToken?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly executor?: ProviderProfileExecutor;

  constructor(options: ProviderClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.authToken = options.authToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.executor = options.executor;
  }

  async analyzeProvider(input: ProviderProfileFormInput): Promise<ProviderProfileResult> {
    const payload = buildProviderProfilePayload(input);

    if (this.executor) {
      return this.executor(payload);
    }

    return this.postProviderProfile(payload);
  }

  async postProviderProfile(payload: ProviderProfileInput): Promise<ProviderProfileResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await this.fetchImpl(`${this.baseUrl}/ai/providers/profile`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as ProviderProfileResult & {
      code?: string;
      detail?: string;
      title?: string;
    };

    if (!response.ok) {
      throw new ProviderClientError(
        response.status,
        body.detail ?? body.title ?? "Provider profile request failed",
        body.code
      );
    }

    return body;
  }
}

export function createProviderClient(options: ProviderClientOptions): ProviderClient {
  return new ProviderClient(options);
}
