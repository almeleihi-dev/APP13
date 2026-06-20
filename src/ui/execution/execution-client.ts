import {
  resolveExecutionFixture,
  validateExecutionDashboardRequest,
  validateMilestoneDetailsRequest,
} from "./execution-payload.js";
import { buildExecutionDashboardView } from "../pages/execution-dashboard.js";
import { buildMilestoneDetailsView } from "../pages/milestone-details.js";
import type {
  ExecutionClientOptions,
  ExecutionDashboardRequest,
  ExecutionDashboardResult,
  MilestoneDetailsRequest,
  MilestoneDetailsResult,
} from "./types.js";

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
  private readonly dashboardExecutor?: ExecutionClientOptions["dashboardExecutor"];
  private readonly milestoneDetailsExecutor?: ExecutionClientOptions["milestoneDetailsExecutor"];

  constructor(options: ExecutionClientOptions = {}) {
    this.dashboardExecutor = options.dashboardExecutor;
    this.milestoneDetailsExecutor = options.milestoneDetailsExecutor;
  }

  async getExecutionDashboard(input: ExecutionDashboardRequest): Promise<ExecutionDashboardResult> {
    const validation = validateExecutionDashboardRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = await this.resolveDashboardSource(input);
    return {
      source,
      view: buildExecutionDashboardView(source),
    };
  }

  async getMilestoneDetails(input: MilestoneDetailsRequest): Promise<MilestoneDetailsResult> {
    const validation = validateMilestoneDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = this.milestoneDetailsExecutor
      ? await this.milestoneDetailsExecutor({
          contract_id: input.contract_id.trim(),
          milestone_id: input.milestone_id.trim(),
        })
      : await this.resolveDashboardSource({ contract_id: input.contract_id.trim() });

    const view = buildMilestoneDetailsView(source, input.milestone_id.trim());
    if (!view) {
      throw new ExecutionClientError(404, `Milestone ${input.milestone_id} not found`);
    }

    return { source, view };
  }

  projectDashboard(source: ExecutionDashboardResult["source"]): ExecutionDashboardResult {
    return {
      source,
      view: buildExecutionDashboardView(source),
    };
  }

  projectMilestoneDetails(
    source: MilestoneDetailsResult["source"],
    milestoneId: string
  ): MilestoneDetailsResult {
    const view = buildMilestoneDetailsView(source, milestoneId);
    if (!view) {
      throw new ExecutionClientError(404, `Milestone ${milestoneId} not found`);
    }

    return { source, view };
  }

  private async resolveDashboardSource(input: ExecutionDashboardRequest) {
    if (this.dashboardExecutor) {
      return this.dashboardExecutor({
        contract_id: input.contract_id.trim(),
      });
    }

    const fixture = resolveExecutionFixture(input.contract_id.trim());
    if (fixture) {
      return fixture;
    }

    throw new ExecutionClientError(404, `Execution contract ${input.contract_id} not found`);
  }
}

export function createExecutionClient(options: ExecutionClientOptions = {}): ExecutionClient {
  return new ExecutionClient(options);
}
