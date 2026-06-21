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
import type {
  AttestationTimelineRequest,
  AttestationTimelineResult,
  EvidenceClientOptions,
  EvidenceDetailsRequest,
  EvidenceDetailsResult,
  EvidenceExperienceSource,
  EvidenceOverviewRequest,
  EvidenceOverviewResult,
} from "./types.js";

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
  private readonly overviewExecutor?: EvidenceClientOptions["overviewExecutor"];
  private readonly detailsExecutor?: EvidenceClientOptions["detailsExecutor"];
  private readonly timelineExecutor?: EvidenceClientOptions["timelineExecutor"];

  constructor(options: EvidenceClientOptions = {}) {
    this.overviewExecutor = options.overviewExecutor;
    this.detailsExecutor = options.detailsExecutor;
    this.timelineExecutor = options.timelineExecutor;
  }

  async getEvidenceOverview(input: EvidenceOverviewRequest): Promise<EvidenceOverviewResult> {
    const validation = validateEvidenceOverviewRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = await this.resolveOverviewSource(input);
    return {
      source,
      view: buildEvidenceOverviewView(source),
    };
  }

  async getEvidenceDetails(input: EvidenceDetailsRequest): Promise<EvidenceDetailsResult> {
    const validation = validateEvidenceDetailsRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    const source = this.detailsExecutor
      ? await this.detailsExecutor({
          contract_id: input.contract_id.trim(),
          evidence_id: input.evidence_id.trim(),
        })
      : await this.resolveOverviewSource({ contract_id: input.contract_id.trim() });

    const view = buildEvidenceDetailsView(source, input.evidence_id.trim());
    if (!view) {
      throw new EvidenceClientError(404, `Evidence ${input.evidence_id} not found`);
    }

    return { source, view };
  }

  async getAttestationTimeline(input: AttestationTimelineRequest): Promise<AttestationTimelineResult> {
    const validation = validateAttestationTimelineRequest(input);
    if (!validation.valid) {
      throw new Error(validation.errors.map((error) => error.message).join("; "));
    }

    let source: EvidenceExperienceSource;

    if (this.timelineExecutor) {
      source = await this.timelineExecutor({
        contract_id: input.contract_id.trim(),
        milestone_id: input.milestone_id?.trim(),
        evidence_id: input.evidence_id?.trim(),
      });
    } else {
      source = await this.resolveOverviewSource({
        contract_id: input.contract_id.trim(),
        milestone_id: input.milestone_id?.trim(),
      });
    }

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

  private async resolveOverviewSource(input: EvidenceOverviewRequest): Promise<EvidenceExperienceSource> {
    if (this.overviewExecutor) {
      return this.overviewExecutor({
        contract_id: input.contract_id.trim(),
        milestone_id: input.milestone_id?.trim(),
        issue_id: input.issue_id?.trim(),
      });
    }

    const fixture = resolveEvidenceFixture(input.contract_id.trim());
    if (!fixture) {
      throw new EvidenceClientError(404, `Evidence contract ${input.contract_id} not found`);
    }

    return filterEvidenceSource(fixture, {
      milestoneId: input.milestone_id?.trim(),
      issueId: input.issue_id?.trim(),
    });
  }
}

export function createEvidenceClient(options: EvidenceClientOptions = {}): EvidenceClient {
  return new EvidenceClient(options);
}

export { findEvidenceItem };
