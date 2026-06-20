import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import {
  buildContractReviewContext,
  buildContractWorkflowPayload,
  validateContractReviewInput,
} from "./contract-payload.js";
import { buildContractSummaryView } from "../pages/contract-summary.js";
import type {
  AnalyzeContractReviewResult,
  ContractClientOptions,
  ContractReviewInput,
  ContractReviewResult,
  ContractWorkflowExecutor,
  ContractWorkflowInput,
} from "./types.js";

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
  private readonly baseUrl: string;
  private readonly authToken?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly executor?: ContractWorkflowExecutor;

  constructor(options: ContractClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.authToken = options.authToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.executor = options.executor;
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

  async postWorkflowAnalyze(payload: WorkflowAnalyzeInput): Promise<WorkflowAnalyzeResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await this.fetchImpl(`${this.baseUrl}/ai/workflow/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as WorkflowAnalyzeResult & {
      code?: string;
      detail?: string;
      title?: string;
    };

    if (!response.ok) {
      throw new ContractClientError(
        response.status,
        body.detail ?? body.title ?? "Contract workflow analyze request failed",
        body.code
      );
    }

    return body;
  }
}

export function createContractClient(options: ContractClientOptions): ContractClient {
  return new ContractClient(options);
}
