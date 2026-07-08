import type { ProviderProfileInput, ProviderProfileResult } from "../../provider/intelligence/types.js";
import type { ApiResult } from "../../integration/api-response.js";
import { buildProviderProfilePayload } from "./provider-payload.js";
import {
  createProviderApiTransport,
  createProviderTransportClientError,
  executeProviderProfile,
  unwrapProviderProfileResult,
  type ProviderProfileApiResult,
} from "../shared/provider-api-transport.js";
import type { ProviderProfileExecutor, ProviderProfileFormInput, ProviderClientOptions } from "./types.js";

export type { ProviderProfileApiResult };

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
  private readonly authToken?: string;
  private readonly executor?: ProviderProfileExecutor;
  private readonly transport;

  constructor(options: ProviderClientOptions) {
    this.authToken = options.authToken;
    this.executor = options.executor;
    this.transport = createProviderApiTransport({
      baseUrl: options.baseUrl,
      authToken: options.authToken,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      requestExecutor: options.requestExecutor,
    });
  }

  async analyzeProvider(input: ProviderProfileFormInput): Promise<ProviderProfileResult> {
    const payload = buildProviderProfilePayload(input);

    if (this.executor) {
      return this.executor(payload);
    }

    return this.postProviderProfile(payload);
  }

  async analyzeProviderWithApiResult(
    input: ProviderProfileFormInput
  ): Promise<ProviderProfileApiResult> {
    const payload = buildProviderProfilePayload(input);

    if (this.executor) {
      const profile = await this.executor(payload);
      return {
        response: { success: true, data: profile },
        meta: {
          status: 200,
          method: "POST",
          path: "/ai/providers/profile",
          durationMs: 0,
        },
      };
    }

    return this.postProviderProfileWithApiResult(payload);
  }

  async postProviderProfile(payload: ProviderProfileInput): Promise<ProviderProfileResult> {
    const result = await this.postProviderProfileWithApiResult(payload);
    if (!result.response.success) {
      throw createProviderTransportClientError(
        ProviderClientError,
        result,
        "Provider profile request failed"
      );
    }

    return unwrapProviderProfileResult(result);
  }

  async postProviderProfileWithApiResult(
    payload: ProviderProfileInput
  ): Promise<ProviderProfileApiResult> {
    return executeProviderProfile(payload, this.transport, this.authToken);
  }
}

export function createProviderClient(options: ProviderClientOptions): ProviderClient {
  return new ProviderClient(options);
}

export function isProviderProfileApiResult(value: unknown): value is ApiResult<ProviderProfileResult> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as ApiResult<ProviderProfileResult>;
  return typeof record.response?.success === "boolean" && typeof record.meta?.status === "number";
}
