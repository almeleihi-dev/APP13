import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import { buildWorkflowAnalyzePayload } from "./workflow-payload.js";
import type { CustomerRequestInput, WorkflowAnalyzeExecutor, WorkflowClientOptions } from "./types.js";

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
  private readonly baseUrl: string;
  private readonly authToken?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly executor?: WorkflowAnalyzeExecutor;

  constructor(options: WorkflowClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.authToken = options.authToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.executor = options.executor;
  }

  async analyzeRequest(input: CustomerRequestInput): Promise<WorkflowAnalyzeResult> {
    const payload = buildWorkflowAnalyzePayload(input);

    if (this.executor) {
      return this.executor(payload);
    }

    return this.postWorkflowAnalyze(payload);
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
      throw new WorkflowClientError(
        response.status,
        body.detail ?? body.title ?? "Workflow analyze request failed",
        body.code
      );
    }

    return body;
  }
}

export function createWorkflowClient(options: WorkflowClientOptions): WorkflowClient {
  return new WorkflowClient(options);
}
