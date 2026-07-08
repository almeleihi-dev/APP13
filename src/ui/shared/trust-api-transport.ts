import type { TrustExperienceSource } from "../trust/types.js";
import { createApiConfig } from "../../integration/api-config.js";
import { TimeoutError } from "../../integration/api-errors.js";
import type { ApiResult } from "../../integration/api-response.js";
import { createRequestExecutor, type RequestExecutor } from "../../integration/request-executor.js";

export interface GovernanceApiTransportConfig {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type TrustExperienceApiResult = ApiResult<TrustExperienceSource>;

export function createTrustApiTransport(config: GovernanceApiTransportConfig): RequestExecutor {
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

export function createSyntheticGetResult<T>(path: string, data: T): ApiResult<T> {
  return {
    response: { success: true, data },
    meta: {
      status: 200,
      method: "GET",
      path,
      durationMs: 0,
    },
  };
}

async function executeGet<T>(
  transport: RequestExecutor,
  path: string,
  authToken?: string
): Promise<ApiResult<T>> {
  try {
    return await transport.get<T>(path, { authToken });
  } catch (error) {
    if (error instanceof TimeoutError) {
      return {
        response: {
          success: false,
          error: { code: error.code, message: error.message },
        },
        meta: {
          status: error.status,
          method: "GET",
          path,
          durationMs: 0,
        },
      };
    }

    throw error;
  }
}

export async function fetchTrustCenter(
  providerId: string,
  transport: RequestExecutor,
  authToken?: string
): Promise<TrustExperienceApiResult> {
  const path = `/trust/${providerId}`;
  return executeGet<TrustExperienceSource>(transport, path, authToken);
}

export async function fetchProviderTrustReport(
  providerId: string,
  transport: RequestExecutor,
  authToken?: string
): Promise<TrustExperienceApiResult> {
  const path = `/trust/provider/${providerId}`;
  return executeGet<TrustExperienceSource>(transport, path, authToken);
}

export async function fetchTrustTimeline(
  providerId: string,
  transport: RequestExecutor,
  authToken?: string
): Promise<TrustExperienceApiResult> {
  const path = `/trust/${providerId}/timeline`;
  return executeGet<TrustExperienceSource>(transport, path, authToken);
}

export function createTrustTransportClientError<
  T extends { status: number; code?: string; message: string },
>(
  ErrorClass: new (status: number, message: string, code?: string) => T,
  result: TrustExperienceApiResult,
  fallbackMessage: string
): T {
  return new ErrorClass(
    result.meta.status,
    result.response.error?.message ?? fallbackMessage,
    result.response.error?.code
  );
}

export function unwrapTrustExperienceSource(result: TrustExperienceApiResult): TrustExperienceSource {
  if (!result.response.success || !result.response.data) {
    throw new Error(result.response.error?.message ?? "Trust request failed");
  }

  return result.response.data;
}
