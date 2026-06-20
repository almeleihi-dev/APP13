import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import { buildMarketplaceWorkflowPayload } from "./marketplace-payload.js";
import type {
  MarketplaceClientOptions,
  MarketplaceSearchInput,
  MarketplaceWorkflowExecutor,
} from "./types.js";

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
  private readonly baseUrl: string;
  private readonly authToken?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly executor?: MarketplaceWorkflowExecutor;

  constructor(options: MarketplaceClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.authToken = options.authToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.executor = options.executor;
  }

  async analyzeAndFindProviders(input: MarketplaceSearchInput): Promise<WorkflowAnalyzeResult> {
    const payload = buildMarketplaceWorkflowPayload(input);

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
      throw new MarketplaceClientError(
        response.status,
        body.detail ?? body.title ?? "Marketplace workflow analyze request failed",
        body.code
      );
    }

    return body;
  }
}

export function createMarketplaceClient(options: MarketplaceClientOptions): MarketplaceClient {
  return new MarketplaceClient(options);
}
