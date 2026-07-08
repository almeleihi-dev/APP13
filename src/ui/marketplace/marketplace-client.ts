import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type { ApiResult } from "../../integration/api-response.js";
import { buildMarketplaceWorkflowPayload } from "./marketplace-payload.js";
import {
  createTransportClientError,
  createWorkflowApiTransport,
  executeWorkflowAnalyze,
  unwrapWorkflowAnalyzeResult,
  type WorkflowAnalyzeApiResult,
} from "../shared/workflow-api-transport.js";
import type {
  MarketplaceClientOptions,
  MarketplaceSearchInput,
  MarketplaceWorkflowExecutor,
} from "./types.js";

export type { WorkflowAnalyzeApiResult };

export class MarketplaceClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "MarketplaceClientError";
    this.status = status;
    this.code = code;
  }
}

export class MarketplaceClient {
  private readonly authToken?: string;
  private readonly executor?: MarketplaceWorkflowExecutor;
  private readonly transport;

  constructor(options: MarketplaceClientOptions) {
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

  async analyzeAndFindProviders(input: MarketplaceSearchInput): Promise<WorkflowAnalyzeResult> {
    const payload = buildMarketplaceWorkflowPayload(input);

    if (this.executor) {
      return this.executor(payload);
    }

    return this.postWorkflowAnalyze(payload);
  }

  async analyzeAndFindProvidersWithApiResult(
    input: MarketplaceSearchInput
  ): Promise<WorkflowAnalyzeApiResult> {
    const payload = buildMarketplaceWorkflowPayload(input);

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
        MarketplaceClientError,
        result,
        "Marketplace workflow analyze request failed"
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

export function createMarketplaceClient(options: MarketplaceClientOptions): MarketplaceClient {
  return new MarketplaceClient(options);
}

export function isMarketplaceAnalyzeApiResult(value: unknown): value is ApiResult<WorkflowAnalyzeResult> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as ApiResult<WorkflowAnalyzeResult>;
  return typeof record.response?.success === "boolean" && typeof record.meta?.status === "number";
}
