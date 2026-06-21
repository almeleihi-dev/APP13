import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type { ApiResult } from "../../integration/api-response.js";
import { buildWorkflowAnalyzePayload } from "./workflow-payload.js";
import {
  createTransportClientError,
  createWorkflowApiTransport,
  executeWorkflowAnalyze,
  unwrapWorkflowAnalyzeResult,
  type WorkflowAnalyzeApiResult,
} from "../shared/workflow-api-transport.js";
import type { CustomerRequestInput, WorkflowAnalyzeExecutor, WorkflowClientOptions } from "./types.js";

export type { WorkflowAnalyzeApiResult };

export class WorkflowClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "WorkflowClientError";
    this.status = status;
    this.code = code;
  }
}

export class WorkflowClient {
  private readonly authToken?: string;
  private readonly executor?: WorkflowAnalyzeExecutor;
  private readonly transport;

  constructor(options: WorkflowClientOptions) {
    this.authToken = options.authToken;
    this.executor = options.executor;
    this.transport = createWorkflowApiTransport({
      baseUrl: options.baseUrl,
      authToken: options.authToken,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      requestExecutor: options.requestExecutor,
    });
  }

  async analyzeRequest(input: CustomerRequestInput): Promise<WorkflowAnalyzeResult> {
    const payload = buildWorkflowAnalyzePayload(input);

    if (this.executor) {
      return this.executor(payload);
    }

    return this.postWorkflowAnalyze(payload);
  }

  async analyzeRequestWithApiResult(input: CustomerRequestInput): Promise<WorkflowAnalyzeApiResult> {
    const payload = buildWorkflowAnalyzePayload(input);

    if (this.executor) {
      const workflow = await this.executor(payload);
      return {
        response: { success: true, data: workflow },
        meta: {
          status: 200,
          method: "POST",
          path: "/ai/workflow/analyze",
          durationMs: 0,
        },
      };
    }

    return this.postWorkflowAnalyzeWithApiResult(payload);
  }

  async postWorkflowAnalyze(payload: WorkflowAnalyzeInput): Promise<WorkflowAnalyzeResult> {
    const result = await this.postWorkflowAnalyzeWithApiResult(payload);
    if (!result.response.success) {
      throw createTransportClientError(
        WorkflowClientError,
        result,
        "Workflow analyze request failed"
      );
    }

    return unwrapWorkflowAnalyzeResult(result);
  }

  async postWorkflowAnalyzeWithApiResult(
    payload: WorkflowAnalyzeInput
  ): Promise<WorkflowAnalyzeApiResult> {
    return executeWorkflowAnalyze(payload, this.transport, this.authToken);
  }
}

export function createWorkflowClient(options: WorkflowClientOptions): WorkflowClient {
  return new WorkflowClient(options);
}

export function isWorkflowAnalyzeApiResult(value: unknown): value is ApiResult<WorkflowAnalyzeResult> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as ApiResult<WorkflowAnalyzeResult>;
  return typeof record.response?.success === "boolean" && typeof record.meta?.status === "number";
}
