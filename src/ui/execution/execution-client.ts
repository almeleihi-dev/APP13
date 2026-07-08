import {
  resolveExecutionFixture,
  validateExecutionDashboardRequest,
  validateMilestoneDetailsRequest,
} from "./execution-payload.js";
import { buildExecutionDashboardView } from "../pages/execution-dashboard.js";
import { buildMilestoneDetailsView } from "../pages/milestone-details.js";
import {
  createExecutionApiTransport,
  createExecutionTransportClientError,
  createSyntheticGetResult,
  fetchExecutionDashboard,
  fetchMilestoneDetails,
  unwrapExecutionExperienceSource,
  type ExecutionExperienceApiResult,
} from "../shared/execution-api-transport.js";
import type {
  ExecutionClientOptions,
  ExecutionDashboardRequest,
  ExecutionDashboardResult,
  ExecutionExperienceSource,
  MilestoneDetailsRequest,
  MilestoneDetailsResult,
} from "./types.js";

export type { ExecutionExperienceApiResult };

export class ExecutionClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ExecutionClientError";
    this.status = status;
    this.code = code;
  }
}

export class ExecutionClient {
  private readonly authToken?: string;
  private readonly apiEnabled: boolean;
  private readonly dashboardExecutor?: ExecutionClientOptions["dashboardExecutor"];
  private readonly milestoneDetailsExecutor?: ExecutionClientOptions["milestoneDetailsExecutor"];
  private readonly transport;

  constructor(options: ExecutionClientOptions = {}) {
    this.authToken = options.authToken;
    this.apiEnabled = Boolean(options.baseUrl?.trim());
    this.dashboardExecutor = options.dashboardExecutor;
    this.milestoneDetailsExecutor = options.milestoneDetailsExecutor;
    this.transport = createExecutionApiTransport({
      baseUrl: options.baseUrl ?? "http://localhost:3000",
      authToken: options.authToken,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      requestExecutor: options.requestExecutor,
    });
  }

  async getExecutionDashboard(input: ExecutionDashboardRequest): Promise<ExecutionDashboardResult> {
    const validation = validateExecutionDashboardRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getExecutionDashboardWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createExecutionTransportClientError(
        ExecutionClientError,
        api,
        `Execution contract ${input.contract_id} not found`
      );
    }

    return this.projectDashboard(api.response.data);
  }

  async getMilestoneDetails(input: MilestoneDetailsRequest): Promise<MilestoneDetailsResult> {
    const validation = validateMilestoneDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getMilestoneDetailsWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createExecutionTransportClientError(
        ExecutionClientError,
        api,
        `Milestone ${input.milestone_id} not found`
      );
    }

    const view = buildMilestoneDetailsView(api.response.data, input.milestone_id.trim());
    if (!view) {
      throw new ExecutionClientError(404, `Milestone ${input.milestone_id} not found`);
    }

    return { source: api.response.data, view };
  }

  async getExecutionDashboardWithApiResult(
    input: ExecutionDashboardRequest
  ): Promise<ExecutionExperienceApiResult> {
    const validation = validateExecutionDashboardRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveDashboardApiResult(input);
  }

  async getMilestoneDetailsWithApiResult(
    input: MilestoneDetailsRequest
  ): Promise<ExecutionExperienceApiResult> {
    const validation = validateMilestoneDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveMilestoneApiResult(input);
  }

  projectDashboard(source: ExecutionExperienceSource): ExecutionDashboardResult {
    return {
      source,
      view: buildExecutionDashboardView(source),
    };
  }

  projectMilestoneDetails(source: ExecutionExperienceSource, milestoneId: string): MilestoneDetailsResult {
    const view = buildMilestoneDetailsView(source, milestoneId);
    if (!view) {
      throw new ExecutionClientError(404, `Milestone ${milestoneId} not found`);
    }

    return { source, view };
  }

  private async resolveDashboardApiResult(
    input: ExecutionDashboardRequest
  ): Promise<ExecutionExperienceApiResult> {
    const contractId = input.contract_id.trim();
    const path = `/execution/${contractId}/dashboard`;

    if (this.dashboardExecutor) {
      const source = await this.dashboardExecutor({ contract_id: contractId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchExecutionDashboard(contractId, this.transport, this.authToken);
    }

    const fixture = resolveExecutionFixture(contractId);
    if (fixture) {
      return createSyntheticGetResult(path, fixture);
    }

    return {
      response: {
        success: false,
        error: { code: "NOT_FOUND", message: `Execution contract ${contractId} not found` },
      },
      meta: { status: 404, method: "GET", path, durationMs: 0 },
    };
  }

  private async resolveMilestoneApiResult(
    input: MilestoneDetailsRequest
  ): Promise<ExecutionExperienceApiResult> {
    const contractId = input.contract_id.trim();
    const milestoneId = input.milestone_id.trim();
    const path = `/execution/milestone/${milestoneId}`;

    if (this.milestoneDetailsExecutor) {
      const source = await this.milestoneDetailsExecutor({
        contract_id: contractId,
        milestone_id: milestoneId,
      });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchMilestoneDetails(milestoneId, this.transport, {
        contractId,
        authToken: this.authToken,
      });
    }

    const fixture = resolveExecutionFixture(contractId);
    if (fixture) {
      return createSyntheticGetResult(path, fixture);
    }

    return {
      response: {
        success: false,
        error: { code: "NOT_FOUND", message: `Execution contract ${contractId} not found` },
      },
      meta: { status: 404, method: "GET", path, durationMs: 0 },
    };
  }
}

export function createExecutionClient(options: ExecutionClientOptions = {}): ExecutionClient {
  return new ExecutionClient(options);
}

export { unwrapExecutionExperienceSource };
