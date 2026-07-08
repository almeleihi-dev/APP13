import type { DisputeExperienceSource } from "../dispute/types.js";
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

export type DisputeExperienceApiResult = ApiResult<DisputeExperienceSource>;

export function createDisputeApiTransport(config: GovernanceApiTransportConfig): RequestExecutor {
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

export async function fetchDisputeDashboard(
  disputeId: string,
  transport: RequestExecutor,
  options: { contractId?: string; authToken?: string } = {}
): Promise<DisputeExperienceApiResult> {
  const path = `/disputes/${disputeId}`;
  return executeGet<DisputeExperienceSource>(
    transport,
    path,
    { contract_id: options.contractId },
    options.authToken
  );
}

export async function fetchDisputeDetails(
  disputeId: string,
  transport: RequestExecutor,
  authToken?: string
): Promise<DisputeExperienceApiResult> {
  const path = `/disputes/${disputeId}/details`;
  return executeGet<DisputeExperienceSource>(transport, path, undefined, authToken);
}

export async function fetchDisputeTimeline(
  disputeId: string,
  transport: RequestExecutor,
  authToken?: string
): Promise<DisputeExperienceApiResult> {
  const path = `/disputes/${disputeId}/timeline`;
  return executeGet<DisputeExperienceSource>(transport, path, undefined, authToken);
}

export function createDisputeTransportClientError<
  T extends { status: number; code?: string; message: string },
>(
  ErrorClass: new (status: number, message: string, code?: string) => T,
  result: DisputeExperienceApiResult,
  fallbackMessage: string
): T {
  return new ErrorClass(
    result.meta.status,
    result.response.error?.message ?? fallbackMessage,
    result.response.error?.code
  );
}

export function unwrapDisputeExperienceSource(result: DisputeExperienceApiResult): DisputeExperienceSource {
  if (!result.response.success || !result.response.data) {
    throw new Error(result.response.error?.message ?? "Dispute request failed");
  }

  return result.response.data;
}
