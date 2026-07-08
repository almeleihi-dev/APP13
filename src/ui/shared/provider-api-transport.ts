import type { ProviderProfileInput, ProviderProfileResult } from "../../provider/intelligence/types.js";
import { createApiConfig } from "../../integration/api-config.js";
import { TimeoutError } from "../../integration/api-errors.js";
import type { ApiResult } from "../../integration/api-response.js";
import { createRequestExecutor, type RequestExecutor } from "../../integration/request-executor.js";

export const PROVIDER_PROFILE_PATH = "/ai/providers/profile";

export interface ProviderApiTransportConfig {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type ProviderProfileApiResult = ApiResult<ProviderProfileResult>;

export function createProviderApiTransport(config: ProviderApiTransportConfig): RequestExecutor {
  if (config.requestExecutor) {
    return config.requestExecutor;
  }

  return createRequestExecutor({
    config: createApiConfig("local", {
      baseUrl: config.baseUrl,
      timeoutMs: config.timeoutMs,
    }),
    fetchImpl: config.fetchImpl,
    authToken: config.authToken,
  });
}

export async function executeProviderProfile(
  payload: ProviderProfileInput,
  transport: RequestExecutor,
  authToken?: string
): Promise<ProviderProfileApiResult> {
  try {
    return await transport.post<ProviderProfileResult>(PROVIDER_PROFILE_PATH, payload, {
      authToken,
    });
  } catch (error) {
    if (error instanceof TimeoutError) {
      return {
        response: {
          success: false,
          error: { code: error.code, message: error.message },
        },
        meta: {
          status: error.status,
          method: "POST",
          path: PROVIDER_PROFILE_PATH,
          durationMs: 0,
        },
      };
    }

    throw error;
  }
}

export function createProviderTransportClientError<
  T extends { status: number; code?: string; message: string },
>(
  ErrorClass: new (status: number, message: string, code?: string) => T,
  result: ProviderProfileApiResult,
  fallbackMessage: string
): T {
  return new ErrorClass(
    result.meta.status,
    result.response.error?.message ?? fallbackMessage,
    result.response.error?.code
  );
}

export function unwrapProviderProfileResult(result: ProviderProfileApiResult): ProviderProfileResult {
  if (!result.response.success || !result.response.data) {
    throw new Error(result.response.error?.message ?? "Provider profile request failed");
  }

  return result.response.data;
}
