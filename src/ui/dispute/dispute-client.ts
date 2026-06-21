import {
  findDisputeSourceById,
  validateDisputeDashboardRequest,
  validateDisputeDetailsRequest,
  validateResolutionTimelineRequest,
} from "./dispute-payload.js";
import { buildDisputeDashboardView } from "../pages/dispute-dashboard.js";
import { buildDisputeDetailsView } from "../pages/dispute-details.js";
import { buildResolutionTimelineView } from "../pages/resolution-timeline.js";
import type {
  DisputeClientOptions,
  DisputeDashboardRequest,
  DisputeDashboardResult,
  DisputeDetailsRequest,
  DisputeDetailsResult,
  DisputeExperienceSource,
  ResolutionTimelineRequest,
  ResolutionTimelineResult,
} from "./types.js";

export class DisputeClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "DisputeClientError";
    this.status = status;
    this.code = code;
  }
}

export class DisputeClient {
  private readonly dashboardExecutor?: DisputeClientOptions["dashboardExecutor"];
  private readonly detailsExecutor?: DisputeClientOptions["detailsExecutor"];
  private readonly timelineExecutor?: DisputeClientOptions["timelineExecutor"];

  constructor(options: DisputeClientOptions = {}) {
    this.dashboardExecutor = options.dashboardExecutor;
    this.detailsExecutor = options.detailsExecutor;
    this.timelineExecutor = options.timelineExecutor;
  }

  async getDisputeDashboard(input: DisputeDashboardRequest): Promise<DisputeDashboardResult> {
    const validation = validateDisputeDashboardRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = await this.resolveDashboardSource(input);
    return {
      source,
      view: buildDisputeDashboardView(source),
    };
  }

  async getDisputeDetails(input: DisputeDetailsRequest): Promise<DisputeDetailsResult> {
    const validation = validateDisputeDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = this.detailsExecutor
      ? await this.detailsExecutor({ dispute_id: input.dispute_id.trim() })
      : await this.resolveDashboardSource({ dispute_id: input.dispute_id.trim() });

    return {
      source,
      view: buildDisputeDetailsView(source),
    };
  }

  async getResolutionTimeline(input: ResolutionTimelineRequest): Promise<ResolutionTimelineResult> {
    const validation = validateResolutionTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = this.timelineExecutor
      ? await this.timelineExecutor({ dispute_id: input.dispute_id.trim() })
      : await this.resolveDashboardSource({ dispute_id: input.dispute_id.trim() });

    return {
      source,
      view: buildResolutionTimelineView(source, input.dispute_id.trim()),
    };
  }

  private async resolveDashboardSource(input: DisputeDashboardRequest): Promise<DisputeExperienceSource> {
    if (this.dashboardExecutor) {
      return this.dashboardExecutor({
        dispute_id: input.dispute_id.trim(),
        contract_id: input.contract_id?.trim(),
      });
    }

    const fixture = findDisputeSourceById(input.dispute_id.trim());
    if (!fixture) {
      throw new DisputeClientError(404, `Dispute ${input.dispute_id} not found`);
    }

    if (input.contract_id?.trim() && fixture.summary.contractId !== input.contract_id.trim()) {
      throw new DisputeClientError(404, `Dispute ${input.dispute_id} not found for contract ${input.contract_id}`);
    }

    return fixture;
  }
}

export function createDisputeClient(options: DisputeClientOptions = {}): DisputeClient {
  return new DisputeClient(options);
}
