import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type { ApiResult } from "../../integration/api-response.js";
import {
  buildContractReviewContext,
  buildContractWorkflowPayload,
  validateContractReviewInput,
} from "./contract-payload.js";
import { buildContractSummaryView } from "../pages/contract-summary.js";
import {
  createTransportClientError,
  createWorkflowApiTransport,
  executeWorkflowAnalyze,
  unwrapWorkflowAnalyzeResult,
  type WorkflowAnalyzeApiResult,
} from "../shared/workflow-api-transport.js";
import type {
  AnalyzeContractReviewResult,
  ContractClientOptions,
  ContractReviewInput,
  ContractReviewResult,
  ContractWorkflowExecutor,
  ContractWorkflowInput,
} from "./types.js";

export type { WorkflowAnalyzeApiResult };

export class ContractClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ContractClientError";
    this.status = status;
    this.code = code;
  }
}

export class ContractClient {
  private readonly authToken?: string;
  private readonly executor?: ContractWorkflowExecutor;
  private readonly transport;

  constructor(options: ContractClientOptions) {
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

  reviewWorkflow(input: ContractReviewInput): ContractReviewResult {
    const validation = validateContractReviewInput(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const context: ContractReviewResult["context"] = {
      ...input.context,
      provider_id:
        input.context?.provider_id ??
        input.workflow.summary.provider_id ??
        input.workflow.matching.selected_provider_id ??
        undefined,
    };

    return {
      workflow: input.workflow,
      context,
      view: buildContractSummaryView(input.workflow, context),
    };
  }

  async analyzeContractReview(input: ContractWorkflowInput): Promise<AnalyzeContractReviewResult> {
    const payload = buildContractWorkflowPayload(input);
    const workflow = this.executor
      ? await this.executor(payload)
      : await this.postWorkflowAnalyze(payload);
    const context = buildContractReviewContext(input, workflow);

    const review = this.reviewWorkflow({ workflow, context });

    return {
      request: {
        request_text: input.request_text.trim(),
        budget: input.budget,
        preferred_days: input.preferred_days,
        category: input.category?.trim() || undefined,
        customer_id: input.customer_id,
        customer_label: input.customer_label,
      },
      ...review,
    };
  }

  async analyzeContractReviewWithApiResult(
    input: ContractWorkflowInput
  ): Promise<{ api: WorkflowAnalyzeApiResult; review?: AnalyzeContractReviewResult }> {
    const payload = buildContractWorkflowPayload(input);

    if (this.executor) {
      const workflow = await this.executor(payload);
      const review = await this.analyzeContractReviewFromWorkflow(input, workflow);
      return {
        api: {
          response: { success: true, data: workflow },
          meta: {
            status: 200,
            method: "POST",
            path: "/ai/workflow/analyze",
            durationMs: 0,
          },
        },
        review,
      };
    }

    const api = await this.postWorkflowAnalyzeWithApiResult(payload);
    if (!api.response.success || !api.response.data) {
      return { api };
    }

    const review = await this.analyzeContractReviewFromWorkflow(input, api.response.data);
    return { api, review };
  }

  async postWorkflowAnalyze(payload: WorkflowAnalyzeInput): Promise<WorkflowAnalyzeResult> {
    const result = await this.postWorkflowAnalyzeWithApiResult(payload);
    if (!result.response.success) {
      throw createTransportClientError(
        ContractClientError,
        result,
        "Contract workflow analyze request failed"
      );
    }

    return unwrapWorkflowAnalyzeResult(result);
  }

  async postWorkflowAnalyzeWithApiResult(
    payload: WorkflowAnalyzeInput
  ): Promise<WorkflowAnalyzeApiResult> {
    return executeWorkflowAnalyze(payload, this.transport, this.authToken);
  }

  private async analyzeContractReviewFromWorkflow(
    input: ContractWorkflowInput,
    workflow: WorkflowAnalyzeResult
  ): Promise<AnalyzeContractReviewResult> {
    const context = buildContractReviewContext(input, workflow);
    const review = this.reviewWorkflow({ workflow, context });

    return {
      request: {
        request_text: input.request_text.trim(),
        budget: input.budget,
        preferred_days: input.preferred_days,
        category: input.category?.trim() || undefined,
        customer_id: input.customer_id,
        customer_label: input.customer_label,
      },
      ...review,
    };
  }
}

export function createContractClient(options: ContractClientOptions): ContractClient {
  return new ContractClient(options);
}

export function isContractAnalyzeApiResult(value: unknown): value is ApiResult<WorkflowAnalyzeResult> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as ApiResult<WorkflowAnalyzeResult>;
  return typeof record.response?.success === "boolean" && typeof record.meta?.status === "number";
}
