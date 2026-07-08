import {
  findDisputeSourceById,
  validateDisputeDashboardRequest,
  validateDisputeDetailsRequest,
  validateResolutionTimelineRequest,
} from "./dispute-payload.js";
import { buildDisputeDashboardView } from "../pages/dispute-dashboard.js";
import { buildDisputeDetailsView } from "../pages/dispute-details.js";
import { buildResolutionTimelineView } from "../pages/resolution-timeline.js";
import {
  createDisputeApiTransport,
  createDisputeTransportClientError,
  createSyntheticGetResult,
  fetchDisputeDashboard,
  fetchDisputeDetails,
  fetchDisputeTimeline,
  unwrapDisputeExperienceSource,
  type DisputeExperienceApiResult,
} from "../shared/dispute-api-transport.js";
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

export type { DisputeExperienceApiResult };

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
  private readonly authToken?: string;
  private readonly apiEnabled: boolean;
  private readonly dashboardExecutor?: DisputeClientOptions["dashboardExecutor"];
  private readonly detailsExecutor?: DisputeClientOptions["detailsExecutor"];
  private readonly timelineExecutor?: DisputeClientOptions["timelineExecutor"];
  private readonly transport;

  constructor(options: DisputeClientOptions = {}) {
    this.authToken = options.authToken;
    this.apiEnabled = Boolean(options.baseUrl?.trim());
    this.dashboardExecutor = options.dashboardExecutor;
    this.detailsExecutor = options.detailsExecutor;
    this.timelineExecutor = options.timelineExecutor;
    this.transport = createDisputeApiTransport({
      baseUrl: options.baseUrl ?? "http://localhost:3000",
      authToken: options.authToken,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      requestExecutor: options.requestExecutor,
    });
  }

  async getDisputeDashboard(input: DisputeDashboardRequest): Promise<DisputeDashboardResult> {
    const validation = validateDisputeDashboardRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getDisputeDashboardWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createDisputeTransportClientError(
        DisputeClientError,
        api,
        `Dispute ${input.dispute_id} not found`
      );
    }

    return this.projectDashboard(api.response.data);
  }

  async getDisputeDetails(input: DisputeDetailsRequest): Promise<DisputeDetailsResult> {
    const validation = validateDisputeDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getDisputeDetailsWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createDisputeTransportClientError(
        DisputeClientError,
        api,
        `Dispute ${input.dispute_id} not found`
      );
    }

    return this.projectDetails(api.response.data);
  }

  async getResolutionTimeline(input: ResolutionTimelineRequest): Promise<ResolutionTimelineResult> {
    const validation = validateResolutionTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getResolutionTimelineWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createDisputeTransportClientError(
        DisputeClientError,
        api,
        `Dispute ${input.dispute_id} not found`
      );
    }

    return this.projectTimeline(api.response.data, input.dispute_id.trim());
  }

  async getDisputeDashboardWithApiResult(
    input: DisputeDashboardRequest
  ): Promise<DisputeExperienceApiResult> {
    const validation = validateDisputeDashboardRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveDashboardApiResult(input);
  }

  async getDisputeDetailsWithApiResult(
    input: DisputeDetailsRequest
  ): Promise<DisputeExperienceApiResult> {
    const validation = validateDisputeDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveDetailsApiResult(input);
  }

  async getResolutionTimelineWithApiResult(
    input: ResolutionTimelineRequest
  ): Promise<DisputeExperienceApiResult> {
    const validation = validateResolutionTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveTimelineApiResult(input);
  }

  projectDashboard(source: DisputeExperienceSource): DisputeDashboardResult {
    return {
      source,
      view: buildDisputeDashboardView(source),
    };
  }

  projectDetails(source: DisputeExperienceSource): DisputeDetailsResult {
    return {
      source,
      view: buildDisputeDetailsView(source),
    };
  }

  projectTimeline(source: DisputeExperienceSource, disputeId: string): ResolutionTimelineResult {
    return {
      source,
      view: buildResolutionTimelineView(source, disputeId),
    };
  }

  private async resolveDashboardApiResult(
    input: DisputeDashboardRequest
  ): Promise<DisputeExperienceApiResult> {
    const disputeId = input.dispute_id.trim();
    const contractId = input.contract_id?.trim();
    const path = `/disputes/${disputeId}`;

    if (this.dashboardExecutor) {
      const source = await this.dashboardExecutor({
        dispute_id: disputeId,
        contract_id: contractId,
      });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchDisputeDashboard(disputeId, this.transport, {
        contractId,
        authToken: this.authToken,
      });
    }

    return this.resolveFixtureApiResult(path, disputeId, contractId);
  }

  private async resolveDetailsApiResult(
    input: DisputeDetailsRequest
  ): Promise<DisputeExperienceApiResult> {
    const disputeId = input.dispute_id.trim();
    const path = `/disputes/${disputeId}/details`;

    if (this.detailsExecutor) {
      const source = await this.detailsExecutor({ dispute_id: disputeId });
      return createSyntheticGetResult(path, source);
    }

    if (this.dashboardExecutor) {
      const source = await this.dashboardExecutor({ dispute_id: disputeId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchDisputeDetails(disputeId, this.transport, this.authToken);
    }

    return this.resolveFixtureApiResult(path, disputeId);
  }

  private async resolveTimelineApiResult(
    input: ResolutionTimelineRequest
  ): Promise<DisputeExperienceApiResult> {
    const disputeId = input.dispute_id.trim();
    const path = `/disputes/${disputeId}/timeline`;

    if (this.timelineExecutor) {
      const source = await this.timelineExecutor({ dispute_id: disputeId });
      return createSyntheticGetResult(path, source);
    }

    if (this.dashboardExecutor) {
      const source = await this.dashboardExecutor({ dispute_id: disputeId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchDisputeTimeline(disputeId, this.transport, this.authToken);
    }

    return this.resolveFixtureApiResult(path, disputeId);
  }

  private resolveFixtureApiResult(
    path: string,
    disputeId: string,
    contractId?: string
  ): DisputeExperienceApiResult {
    const fixture = findDisputeSourceById(disputeId);
    if (!fixture) {
      return {
        response: {
          success: false,
          error: { code: "NOT_FOUND", message: `Dispute ${disputeId} not found` },
        },
        meta: { status: 404, method: "GET", path, durationMs: 0 },
      };
    }

    if (contractId && fixture.summary.contractId !== contractId) {
      return {
        response: {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Dispute ${disputeId} not found for contract ${contractId}`,
          },
        },
        meta: { status: 404, method: "GET", path, durationMs: 0 },
      };
    }

    return createSyntheticGetResult(path, fixture);
  }
}

export function createDisputeClient(options: DisputeClientOptions = {}): DisputeClient {
  return new DisputeClient(options);
}

export { unwrapDisputeExperienceSource };
