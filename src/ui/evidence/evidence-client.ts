import {
  filterEvidenceSource,
  findEvidenceItem,
  resolveEvidenceFixture,
  validateAttestationTimelineRequest,
  validateEvidenceDetailsRequest,
  validateEvidenceOverviewRequest,
} from "./evidence-payload.js";
import { buildAttestationTimelineView } from "../pages/attestation-timeline.js";
import { buildEvidenceDetailsView } from "../pages/evidence-details.js";
import { buildEvidenceOverviewView } from "../pages/evidence-overview.js";
import {
  createEvidenceApiTransport,
  createEvidenceTransportClientError,
  createSyntheticGetResult,
  fetchEvidenceItemDetails,
  fetchEvidenceOverview,
  fetchEvidenceTimeline,
  unwrapEvidenceExperienceSource,
  type EvidenceExperienceApiResult,
} from "../shared/evidence-api-transport.js";
import type {
  AttestationTimelineRequest,
  AttestationTimelineResult,
  EvidenceClientOptions,
  EvidenceDetailsRequest,
  EvidenceDetailsResult,
  EvidenceOverviewRequest,
  EvidenceOverviewResult,
} from "./types.js";

export type { EvidenceExperienceApiResult };

export class EvidenceClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "EvidenceClientError";
    this.status = status;
    this.code = code;
  }
}

export class EvidenceClient {
  private readonly authToken?: string;
  private readonly apiEnabled: boolean;
  private readonly overviewExecutor?: EvidenceClientOptions["overviewExecutor"];
  private readonly detailsExecutor?: EvidenceClientOptions["detailsExecutor"];
  private readonly timelineExecutor?: EvidenceClientOptions["timelineExecutor"];
  private readonly transport;

  constructor(options: EvidenceClientOptions = {}) {
    this.authToken = options.authToken;
    this.apiEnabled = Boolean(options.baseUrl?.trim());
    this.overviewExecutor = options.overviewExecutor;
    this.detailsExecutor = options.detailsExecutor;
    this.timelineExecutor = options.timelineExecutor;
    this.transport = createEvidenceApiTransport({
      baseUrl: options.baseUrl ?? "http://localhost:3000",
      authToken: options.authToken,
      fetchImpl: options.fetchImpl,
      timeoutMs: options.timeoutMs,
      requestExecutor: options.requestExecutor,
    });
  }

  async getEvidenceOverview(input: EvidenceOverviewRequest): Promise<EvidenceOverviewResult> {
    const validation = validateEvidenceOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getEvidenceOverviewWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createEvidenceTransportClientError(
        EvidenceClientError,
        api,
        `Evidence contract ${input.contract_id} not found`
      );
    }

    return {
      source: api.response.data,
      view: buildEvidenceOverviewView(api.response.data),
    };
  }

  async getEvidenceDetails(input: EvidenceDetailsRequest): Promise<EvidenceDetailsResult> {
    const validation = validateEvidenceDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getEvidenceDetailsWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createEvidenceTransportClientError(
        EvidenceClientError,
        api,
        `Evidence ${input.evidence_id} not found`
      );
    }

    const view = buildEvidenceDetailsView(api.response.data, input.evidence_id.trim());
    if (!view) {
      throw new EvidenceClientError(404, `Evidence ${input.evidence_id} not found`);
    }

    return { source: api.response.data, view };
  }

  async getAttestationTimeline(input: AttestationTimelineRequest): Promise<AttestationTimelineResult> {
    const validation = validateAttestationTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const api = await this.getAttestationTimelineWithApiResult(input);
    if (!api.response.success || !api.response.data) {
      throw createEvidenceTransportClientError(
        EvidenceClientError,
        api,
        `Evidence contract ${input.contract_id} not found`
      );
    }

    let source = api.response.data;
    if (input.evidence_id?.trim()) {
      source = {
        ...source,
        attestationTimeline: source.attestationTimeline.filter(
          (event) => event.evidenceId === input.evidence_id?.trim()
        ),
      };
    }

    return {
      source,
      view: buildAttestationTimelineView(source, input.contract_id.trim()),
    };
  }

  async getEvidenceOverviewWithApiResult(
    input: EvidenceOverviewRequest
  ): Promise<EvidenceExperienceApiResult> {
    const validation = validateEvidenceOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveOverviewApiResult(input);
  }

  async getEvidenceDetailsWithApiResult(
    input: EvidenceDetailsRequest
  ): Promise<EvidenceExperienceApiResult> {
    const validation = validateEvidenceDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveDetailsApiResult(input);
  }

  async getAttestationTimelineWithApiResult(
    input: AttestationTimelineRequest
  ): Promise<EvidenceExperienceApiResult> {
    const validation = validateAttestationTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    return this.resolveTimelineApiResult(input);
  }

  private async resolveOverviewApiResult(
    input: EvidenceOverviewRequest
  ): Promise<EvidenceExperienceApiResult> {
    const contractId = input.contract_id.trim();
    const path = `/evidence/${contractId}`;

    if (this.overviewExecutor) {
      const source = await this.overviewExecutor({
        contract_id: contractId,
        milestone_id: input.milestone_id?.trim(),
        issue_id: input.issue_id?.trim(),
      });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      const api = await fetchEvidenceOverview(contractId, this.transport, {
        milestoneId: input.milestone_id?.trim(),
        issueId: input.issue_id?.trim(),
        authToken: this.authToken,
      });
      if (api.response.success && api.response.data && (input.milestone_id || input.issue_id)) {
        return {
          ...api,
          response: {
            success: true,
            data: filterEvidenceSource(api.response.data, {
              milestoneId: input.milestone_id?.trim(),
              issueId: input.issue_id?.trim(),
            }),
          },
        };
      }
      return api;
    }

    const fixture = resolveEvidenceFixture(contractId);
    if (fixture) {
      const source = filterEvidenceSource(fixture, {
        milestoneId: input.milestone_id?.trim(),
        issueId: input.issue_id?.trim(),
      });
      return createSyntheticGetResult(path, source);
    }

    return {
      response: {
        success: false,
        error: { code: "NOT_FOUND", message: `Evidence contract ${contractId} not found` },
      },
      meta: { status: 404, method: "GET", path, durationMs: 0 },
    };
  }

  private async resolveDetailsApiResult(
    input: EvidenceDetailsRequest
  ): Promise<EvidenceExperienceApiResult> {
    const contractId = input.contract_id.trim();
    const evidenceId = input.evidence_id.trim();
    const path = `/evidence/item/${evidenceId}`;

    if (this.detailsExecutor) {
      const source = await this.detailsExecutor({
        contract_id: contractId,
        evidence_id: evidenceId,
      });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      return fetchEvidenceItemDetails(evidenceId, this.transport, {
        contractId,
        authToken: this.authToken,
      });
    }

    const fixture = resolveEvidenceFixture(contractId);
    if (fixture) {
      return createSyntheticGetResult(path, fixture);
    }

    return {
      response: {
        success: false,
        error: { code: "NOT_FOUND", message: `Evidence contract ${contractId} not found` },
      },
      meta: { status: 404, method: "GET", path, durationMs: 0 },
    };
  }

  private async resolveTimelineApiResult(
    input: AttestationTimelineRequest
  ): Promise<EvidenceExperienceApiResult> {
    const contractId = input.contract_id.trim();
    const path = `/evidence/${contractId}/timeline`;

    if (this.timelineExecutor) {
      const source = await this.timelineExecutor({
        contract_id: contractId,
        milestone_id: input.milestone_id?.trim(),
        evidence_id: input.evidence_id?.trim(),
      });
      return createSyntheticGetResult(path, source);
    }

    if (this.apiEnabled) {
      const api = await fetchEvidenceTimeline(contractId, this.transport, {
        milestoneId: input.milestone_id?.trim(),
        evidenceId: input.evidence_id?.trim(),
        authToken: this.authToken,
      });
      if (api.response.success && api.response.data && input.evidence_id?.trim()) {
        return {
          ...api,
          response: {
            success: true,
            data: {
              ...api.response.data,
              attestationTimeline: api.response.data.attestationTimeline.filter(
                (event) => event.evidenceId === input.evidence_id?.trim()
              ),
            },
          },
        };
      }
      return api;
    }

    const fixture = resolveEvidenceFixture(contractId);
    if (fixture) {
      let source = filterEvidenceSource(fixture, {
        milestoneId: input.milestone_id?.trim(),
      });
      if (input.evidence_id?.trim()) {
        source = {
          ...source,
          attestationTimeline: source.attestationTimeline.filter(
            (event) => event.evidenceId === input.evidence_id?.trim()
          ),
        };
      }
      return createSyntheticGetResult(path, source);
    }

    return {
      response: {
        success: false,
        error: { code: "NOT_FOUND", message: `Evidence contract ${contractId} not found` },
      },
      meta: { status: 404, method: "GET", path, durationMs: 0 },
    };
  }
}

export function createEvidenceClient(options: EvidenceClientOptions = {}): EvidenceClient {
  return new EvidenceClient(options);
}

export { findEvidenceItem, unwrapEvidenceExperienceSource };
