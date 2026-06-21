import {
  findTrustSourceByProviderId,
  validateProviderTrustReportRequest,
  validateTrustCenterRequest,
  validateTrustTimelineRequest,
} from "./trust-payload.js";
import { buildTrustCenterView } from "../pages/trust-center.js";
import { buildProviderTrustReportView } from "../pages/provider-trust-report.js";
import { buildTrustTimelineView } from "../pages/trust-timeline.js";
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
  private readonly centerExecutor?: TrustClientOptions["centerExecutor"];
  private readonly reportExecutor?: TrustClientOptions["reportExecutor"];
  private readonly timelineExecutor?: TrustClientOptions["timelineExecutor"];

  constructor(options: TrustClientOptions = {}) {
    this.centerExecutor = options.centerExecutor;
    this.reportExecutor = options.reportExecutor;
    this.timelineExecutor = options.timelineExecutor;
  }

  async getTrustCenter(input: TrustCenterRequest): Promise<TrustCenterResult> {
    const validation = validateTrustCenterRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = await this.resolveSource(input.provider_id.trim());
    return {
      source,
      view: buildTrustCenterView(source),
    };
  }

  async getProviderTrustReport(input: ProviderTrustReportRequest): Promise<ProviderTrustReportResult> {
    const validation = validateProviderTrustReportRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = this.reportExecutor
      ? await this.reportExecutor({ provider_id: input.provider_id.trim() })
      : await this.resolveSource(input.provider_id.trim());

    return {
      source,
      view: buildProviderTrustReportView(source),
    };
  }

  async getTrustTimeline(input: TrustTimelineRequest): Promise<TrustTimelineResult> {
    const validation = validateTrustTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = this.timelineExecutor
      ? await this.timelineExecutor({ provider_id: input.provider_id.trim() })
      : await this.resolveSource(input.provider_id.trim());

    return {
      source,
      view: buildTrustTimelineView(source, input.provider_id.trim()),
    };
  }

  private async resolveSource(providerId: string): Promise<TrustExperienceSource> {
    if (this.centerExecutor) {
      return this.centerExecutor({ provider_id: providerId });
    }

    const fixture = findTrustSourceByProviderId(providerId);
    if (!fixture) {
      throw new TrustClientError(404, `Trust profile for provider ${providerId} not found`);
    }

    return fixture;
  }
}

export function createTrustClient(options: TrustClientOptions = {}): TrustClient {
  return new TrustClient(options);
}
