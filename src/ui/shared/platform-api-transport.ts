import type { PlatformExperienceSource } from "../platform/types.js";
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

export type PlatformExperienceApiResult = ApiResult<PlatformExperienceSource>;

export function createPlatformApiTransport(config: GovernanceApiTransportConfig): RequestExecutor {
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
  query?: Record<string, string | undefined>,
  authToken?: string
): Promise<ApiResult<T>> {
  try {
    return await transport.get<T>(path, { query, authToken });
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

export async function fetchPlatformHome(
  transport: RequestExecutor,
  options: { platformId?: string; authToken?: string } = {}
): Promise<PlatformExperienceApiResult> {
  const path = "/platform/home";
  return executeGet<PlatformExperienceSource>(
    transport,
    path,
    { platform_id: options.platformId },
    options.authToken
  );
}

export async function fetchPlatformOverview(
  transport: RequestExecutor,
  options: { platformId?: string; authToken?: string } = {}
): Promise<PlatformExperienceApiResult> {
  const path = "/platform/overview";
  return executeGet<PlatformExperienceSource>(
    transport,
    path,
    { platform_id: options.platformId },
    options.authToken
  );
}

export function createPlatformTransportClientError<
  T extends { status: number; code?: string; message: string },
>(
  ErrorClass: new (status: number, message: string, code?: string) => T,
  result: PlatformExperienceApiResult,
  fallbackMessage: string
): T {
  return new ErrorClass(
    result.meta.status,
    result.response.error?.message ?? fallbackMessage,
    result.response.error?.code
  );
}

export function unwrapPlatformExperienceSource(
  result: PlatformExperienceApiResult
): PlatformExperienceSource {
  if (!result.response.success || !result.response.data) {
    throw new Error(result.response.error?.message ?? "Platform request failed");
  }

  return result.response.data;
}
