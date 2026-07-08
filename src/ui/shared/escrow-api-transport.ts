import type { EscrowExperienceSource } from "../escrow/types.js";
import { createApiConfig } from "../../integration/api-config.js";
import { TimeoutError } from "../../integration/api-errors.js";
import type { ApiResult } from "../../integration/api-response.js";
import { createRequestExecutor, type RequestExecutor } from "../../integration/request-executor.js";

export interface OperationalApiTransportConfig {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type EscrowExperienceApiResult = ApiResult<EscrowExperienceSource>;

export function createEscrowApiTransport(config: OperationalApiTransportConfig): RequestExecutor {
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

export async function fetchEscrowOverview(
  escrowId: string,
  transport: RequestExecutor,
  options: { contractId?: string; authToken?: string } = {}
): Promise<EscrowExperienceApiResult> {
  const path = `/escrow/${escrowId}`;
  return executeGet<EscrowExperienceSource>(transport, path, {
    contract_id: options.contractId,
  }, options.authToken);
}

export async function fetchEscrowHistory(
  escrowId: string,
  transport: RequestExecutor,
  authToken?: string
): Promise<EscrowExperienceApiResult> {
  const path = `/escrow/${escrowId}/history`;
  return executeGet<EscrowExperienceSource>(transport, path, undefined, authToken);
}

export function createEscrowTransportClientError<
  T extends { status: number; code?: string; message: string },
>(
  ErrorClass: new (status: number, message: string, code?: string) => T,
  result: EscrowExperienceApiResult,
  fallbackMessage: string
): T {
  return new ErrorClass(
    result.meta.status,
    result.response.error?.message ?? fallbackMessage,
    result.response.error?.code
  );
}

export function unwrapEscrowExperienceSource(result: EscrowExperienceApiResult): EscrowExperienceSource {
  if (!result.response.success || !result.response.data) {
    throw new Error(result.response.error?.message ?? "Escrow request failed");
  }

  return result.response.data;
}
