import {
  findTrustSourceByProviderId,
  validateProviderTrustReportRequest,
  validateTrustCenterRequest,
  validateTrustTimelineRequest,
} from "./trust-payload.js";
import { buildTrustCenterView } from "../pages/trust-center.js";
import { buildProviderTrustReportView } from "../pages/provider-trust-report.js";
import { buildTrustTimelineView } from "../pages/trust-timeline.js";
import {
  createTrustApiTransport,
  createSyntheticGetResult,
  createTrustTransportClientError,
  fetchProviderTrustReport,
  fetchTrustCenter,
  fetchTrustTimeline,
  unwrapTrustExperienceSource,
  type TrustExperienceApiResult,
} from "../shared/trust-api-transport.js";
import type {
  ProviderTrustReportRequest,
  ProviderTrustReportResult,
  TrustCenterRequest,
  TrustCenterResult,
  TrustClientOptions,
  TrustExperienceSource,
  TrustTimelineRequest,
  TrustTimelineResult,
} from "./types.js";

export type { TrustExperienceApiResult };

export class TrustClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "TrustClientError";
    this.status = status;
    this.code = code;
  }
}

export class TrustClient {
  private readonly authToken?: string;
  private readonly apiEnabled: boolean;
  private readonly centerExecutor?: TrustClientOptions["centerExecutor"];
  private readonly reportExecutor?: TrustClientOptions["reportExecutor"];
  private readonly timelineExecutor?: TrustClientOptions["timelineExecutor"];
  private readonly transport;

  constructor(options: TrustClientOptions = {}) {
    this.authToken = options.authToken;
    this.apiEnabled = Boolean(options.baseUrl?.trim());
    this.centerExecutor = options.centerExecutor;
    this.reportExecutor = options.reportExecutor;
    this.timelineExecutor = options.timelineExecutor;
    this.transport = createTrustApiTransport({
      baseUrl: options.baseUrl ?? "http://localhost:3000",
      authToken: options.authToken,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      requestExecutor: options.requestExecutor,
    });
  }

  async getTrustCenter(input: TrustCenterRequest): Promise<TrustCenterResult> {
    const validation = validateTrustCenterRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getTrustCenterWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createTrustTransportClientError(
        TrustClientError,
        api,
        `Trust profile for provider ${input.provider_id} not found`
      );
    }

    return this.projectTrustCenter(api.response.data);
  }

  async getProviderTrustReport(input: ProviderTrustReportRequest): Promise<ProviderTrustReportResult> {
    const validation = validateProviderTrustReportRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getProviderTrustReportWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createTrustTransportClientError(
        TrustClientError,
        api,
        `Trust profile for provider ${input.provider_id} not found`
      );
    }

    return this.projectProviderTrustReport(api.response.data);
  }

  async getTrustTimeline(input: TrustTimelineRequest): Promise<TrustTimelineResult> {
    const validation = validateTrustTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getTrustTimelineWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createTrustTransportClientError(
        TrustClientError,
        api,
        `Trust profile for provider ${input.provider_id} not found`
      );
    }

    return this.projectTrustTimeline(api.response.data, input.provider_id.trim());
  }

  async getTrustCenterWithApiResult(input: TrustCenterRequest): Promise<TrustExperienceApiResult> {
    const validation = validateTrustCenterRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveCenterApiResult(input.provider_id.trim());
  }

  async getProviderTrustReportWithApiResult(
    input: ProviderTrustReportRequest
  ): Promise<TrustExperienceApiResult> {
    const validation = validateProviderTrustReportRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveReportApiResult(input.provider_id.trim());
  }

  async getTrustTimelineWithApiResult(input: TrustTimelineRequest): Promise<TrustExperienceApiResult> {
    const validation = validateTrustTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveTimelineApiResult(input.provider_id.trim());
  }

  projectTrustCenter(source: TrustExperienceSource): TrustCenterResult {
    return {
      source,
      view: buildTrustCenterView(source),
    };
  }

  projectProviderTrustReport(source: TrustExperienceSource): ProviderTrustReportResult {
    return {
      source,
      view: buildProviderTrustReportView(source),
    };
  }

  projectTrustTimeline(source: TrustExperienceSource, providerId: string): TrustTimelineResult {
    return {
      source,
      view: buildTrustTimelineView(source, providerId),
    };
  }

  private async resolveCenterApiResult(providerId: string): Promise<TrustExperienceApiResult> {
    const path = `/trust/${providerId}`;

    if (this.centerExecutor) {
      const source = await this.centerExecutor({ provider_id: providerId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchTrustCenter(providerId, this.transport, this.authToken);
    }

    return this.resolveFixtureApiResult(path, providerId);
  }

  private async resolveReportApiResult(providerId: string): Promise<TrustExperienceApiResult> {
    const path = `/trust/provider/${providerId}`;

    if (this.reportExecutor) {
      const source = await this.reportExecutor({ provider_id: providerId });
      return createSyntheticGetResult(path, source);
    }

    if (this.centerExecutor) {
      const source = await this.centerExecutor({ provider_id: providerId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchProviderTrustReport(providerId, this.transport, this.authToken);
    }

    return this.resolveFixtureApiResult(path, providerId);
  }

  private async resolveTimelineApiResult(providerId: string): Promise<TrustExperienceApiResult> {
    const path = `/trust/${providerId}/timeline`;

    if (this.timelineExecutor) {
      const source = await this.timelineExecutor({ provider_id: providerId });
      return createSyntheticGetResult(path, source);
    }

    if (this.centerExecutor) {
      const source = await this.centerExecutor({ provider_id: providerId });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchTrustTimeline(providerId, this.transport, this.authToken);
    }

    return this.resolveFixtureApiResult(path, providerId);
  }

  private resolveFixtureApiResult(path: string, providerId: string): TrustExperienceApiResult {
    const fixture = findTrustSourceByProviderId(providerId);
    if (!fixture) {
      return {
        response: {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Trust profile for provider ${providerId} not found`,
          },
        },
        meta: { status: 404, method: "GET", path, durationMs: 0 },
      };
    }

    return createSyntheticGetResult(path, fixture);
  }
}

export function createTrustClient(options: TrustClientOptions = {}): TrustClient {
  return new TrustClient(options);
}

export { unwrapTrustExperienceSource };
