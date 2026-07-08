import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import { createApiConfig } from "../../integration/api-config.js";
import { TimeoutError } from "../../integration/api-errors.js";
import type { ApiResult } from "../../integration/api-response.js";
import { createRequestExecutor, type RequestExecutor } from "../../integration/request-executor.js";

export const WORKFLOW_ANALYZE_PATH = "/ai/workflow/analyze";

export interface WorkflowApiTransportConfig {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type WorkflowAnalyzeApiResult = ApiResult<WorkflowAnalyzeResult>;

export function createWorkflowApiTransport(config: WorkflowApiTransportConfig): RequestExecutor {
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

export async function executeWorkflowAnalyze(
  payload: WorkflowAnalyzeInput,
  transport: RequestExecutor,
  authToken?: string
): Promise<WorkflowAnalyzeApiResult> {
  try {
    return await transport.post<WorkflowAnalyzeResult>(WORKFLOW_ANALYZE_PATH, payload, {
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
          path: WORKFLOW_ANALYZE_PATH,
          durationMs: 0,
        },
      };
    }

    throw error;
  }
}

export function createTransportClientError<T extends { status: number; code?: string; message: string }>(
  ErrorClass: new (status: number, message: string, code?: string) => T,
  result: WorkflowAnalyzeApiResult,
  fallbackMessage: string
): T {
  return new ErrorClass(
    result.meta.status,
    result.response.error?.message ?? fallbackMessage,
    result.response.error?.code
  );
}

export function unwrapWorkflowAnalyzeResult(result: WorkflowAnalyzeApiResult): WorkflowAnalyzeResult {
  if (!result.response.success || !result.response.data) {
    throw new Error(result.response.error?.message ?? "Workflow analyze request failed");
  }

  return result.response.data;
}
