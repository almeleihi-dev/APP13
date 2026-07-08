import type { WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type {
  EscrowExperienceSource,
  EscrowHistoryRequest,
  EscrowOverviewRequest,
  EscrowReleaseStrategyDisplay,
  EscrowRequestValidationResult,
  EscrowStatusHistorySnapshot,
} from "./types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MVP_ESCROW_ID = "770e8400-e29b-41d4-a716-446655440001";
export const MVP_CONTRACT_ID = "880e8400-e29b-41d4-a716-446655440001";

const BASE_TRUST: EscrowExperienceSource["trust"] = {
  providerTrustScore: "92",
  providerTrustTier: "emerald",
  riskLevel: "low",
};

const BASE_CONTRACT: EscrowExperienceSource["contract"] = {
  category: "software_developer",
  duration: "14 days",
  readiness: "ready",
};

function historyEntry(
  timestamp: string,
  fromStatus: EscrowStatusHistorySnapshot["fromStatus"],
  toStatus: EscrowStatusHistorySnapshot["toStatus"],
  amountMinor?: number,
  reason?: string
): EscrowStatusHistorySnapshot {
  return { timestamp, fromStatus, toStatus, amountMinor, reason };
}

/** Milestone-based escrow held with partial release progress (integration fixture). */
export const MVP_MILESTONE_ESCROW_SOURCE: EscrowExperienceSource = {
  escrow: {
    id: MVP_ESCROW_ID,
    contractId: MVP_CONTRACT_ID,
    status: "held",
    grossAmountMinor: 1_350_000,
    platformFeeMinor: 135_000,
    currencyCode: "SAR",
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  financial: {
    contractValueMinor: 1_350_000,
    heldAmountMinor: 1_350_000,
    releasedAmountMinor: 337_500,
    refundedAmountMinor: 0,
    remainingAmountMinor: 1_012_500,
    currencyCode: "SAR",
  },
  history: [
    historyEntry("2026-06-01T10:00:00.000Z", null, "pending_funding"),
    historyEntry("2026-06-01T10:15:00.000Z", "pending_funding", "funded", 1_350_000),
    historyEntry("2026-06-01T10:20:00.000Z", "funded", "held", 1_350_000),
    historyEntry("2026-06-15T14:00:00.000Z", "held", "held", 337_500, "milestone_release_m1"),
  ],
  releaseStrategy: "milestone_based",
  milestones: {
    total: 4,
    completed: 1,
    pending: 3,
    releaseAllocation: "Kickoff: 25%; Build: 25%; Verify: 25%; Acceptance: 25%",
  },
  trust: BASE_TRUST,
  contract: BASE_CONTRACT,
};

/** Single-release escrow fully released (integration fixture). */
export const MVP_SINGLE_RELEASE_ESCROW_SOURCE: EscrowExperienceSource = {
  escrow: {
    id: "770e8400-e29b-41d4-a716-446655440002",
    contractId: "880e8400-e29b-41d4-a716-446655440002",
    status: "released",
    grossAmountMinor: 400_000,
    platformFeeMinor: 40_000,
    currencyCode: "SAR",
    createdAt: "2026-06-02T08:00:00.000Z",
  },
  financial: {
    contractValueMinor: 400_000,
    heldAmountMinor: 0,
    releasedAmountMinor: 400_000,
    refundedAmountMinor: 0,
    remainingAmountMinor: 0,
    currencyCode: "SAR",
  },
  history: [
    historyEntry("2026-06-02T08:00:00.000Z", null, "pending_funding"),
    historyEntry("2026-06-02T08:10:00.000Z", "pending_funding", "funded", 400_000),
    historyEntry("2026-06-02T08:12:00.000Z", "funded", "held", 400_000),
    historyEntry("2026-06-10T16:00:00.000Z", "held", "released", 400_000),
  ],
  releaseStrategy: "single_release",
  milestones: {
    total: 1,
    completed: 1,
    pending: 0,
    releaseAllocation: "Single release: 100%",
  },
  trust: {
    providerTrustScore: "80",
    providerTrustTier: "gold",
    riskLevel: "medium",
  },
  contract: {
    category: "cleaning",
    duration: "7 days",
    readiness: "ready",
  },
};

/** Refunded escrow scenario (integration fixture). */
export const MVP_REFUND_ESCROW_SOURCE: EscrowExperienceSource = {
  escrow: {
    id: "770e8400-e29b-41d4-a716-446655440003",
    contractId: "880e8400-e29b-41d4-a716-446655440003",
    status: "refunded",
    grossAmountMinor: 900_000,
    platformFeeMinor: 90_000,
    currencyCode: "SAR",
    createdAt: "2026-06-03T09:00:00.000Z",
  },
  financial: {
    contractValueMinor: 900_000,
    heldAmountMinor: 0,
    releasedAmountMinor: 0,
    refundedAmountMinor: 900_000,
    remainingAmountMinor: 0,
    currencyCode: "SAR",
  },
  history: [
    historyEntry("2026-06-03T09:00:00.000Z", null, "pending_funding"),
    historyEntry("2026-06-03T09:05:00.000Z", "pending_funding", "funded", 900_000),
    historyEntry("2026-06-03T09:08:00.000Z", "funded", "held", 900_000),
    historyEntry("2026-06-04T11:00:00.000Z", "held", "frozen"),
    historyEntry("2026-06-05T15:00:00.000Z", "frozen", "held"),
    historyEntry("2026-06-06T12:00:00.000Z", "held", "refunded", 900_000),
  ],
  releaseStrategy: "two_stage",
  milestones: {
    total: 2,
    completed: 0,
    pending: 2,
    releaseAllocation: "Stage 1: 50%; Stage 2: 50%",
  },
  trust: {
    providerTrustScore: "65",
    providerTrustTier: "silver",
    riskLevel: "high",
  },
  contract: {
    category: "consulting",
    duration: "21 days",
    readiness: "needs_clarification",
  },
};

/** Empty history edge-case fixture. */
export const MVP_EMPTY_HISTORY_ESCROW_SOURCE: EscrowExperienceSource = {
  ...MVP_MILESTONE_ESCROW_SOURCE,
  escrow: {
    ...MVP_MILESTONE_ESCROW_SOURCE.escrow,
    id: "770e8400-e29b-41d4-a716-446655440004",
    status: "pending_funding",
  },
  financial: {
    contractValueMinor: 1_350_000,
    heldAmountMinor: 0,
    releasedAmountMinor: 0,
    refundedAmountMinor: 0,
    remainingAmountMinor: 1_350_000,
    currencyCode: "SAR",
  },
  history: [],
};

export function resolveReleaseStrategyDisplay(
  strategy: string,
  stageCount?: number
): EscrowReleaseStrategyDisplay {
  if (strategy === "multi_stage") {
    if (stageCount === 2) return "two_stage";
    if (stageCount === 4) return "four_stage";
    return "multi_stage";
  }

  if (
    strategy === "single_release" ||
    strategy === "milestone_based" ||
    strategy === "two_stage" ||
    strategy === "four_stage"
  ) {
    return strategy;
  }

  return "milestone_based";
}

export function buildContractContextFromWorkflow(
  workflow: WorkflowAnalyzeResult,
  category?: string,
  durationDays?: number
): EscrowExperienceSource["contract"] {
  return {
    category: category?.trim() || workflow.requirement.suggested_actions[0]?.action_code?.split(".")[0] || "general",
    duration:
      typeof durationDays === "number"
        ? `${durationDays} days`
        : typeof workflow.negotiation?.recommended_days === "number"
          ? `${workflow.negotiation.recommended_days} days`
          : "—",
    readiness: workflow.contract?.contract_readiness ?? workflow.requirement.contract_readiness,
  };
}

export function buildTrustContextFromWorkflow(
  workflow: WorkflowAnalyzeResult
): EscrowExperienceSource["trust"] {
  return {
    providerTrustScore: workflow.trust ? String(workflow.trust.trust_score) : "—",
    providerTrustTier: workflow.trust?.trust_tier ?? "—",
    riskLevel: workflow.contract?.risk_profile.risk_level ?? "—",
  };
}

export function buildMilestoneSnapshotFromWorkflow(
  workflow: WorkflowAnalyzeResult
): EscrowExperienceSource["milestones"] {
  const milestones = workflow.contract?.milestones ?? [];
  const releaseAllocation =
    workflow.contract?.escrow_plan.recommended_structure
      .map((stage) => `${stage.label}: ${stage.percentage}%`)
      .join("; ") ?? "—";

  return {
    total: milestones.length,
    completed: 0,
    pending: milestones.length,
    releaseAllocation,
  };
}

export function buildEscrowExperienceSourceFromWorkflow(
  workflow: WorkflowAnalyzeResult,
  overrides: Partial<EscrowExperienceSource> & {
    escrow: EscrowExperienceSource["escrow"];
    financial: EscrowExperienceSource["financial"];
    history: EscrowStatusHistorySnapshot[];
  }
): EscrowExperienceSource {
  const stageCount = workflow.contract?.escrow_plan.recommended_structure.length;

  return {
    releaseStrategy: resolveReleaseStrategyDisplay(
      workflow.contract?.escrow_plan.release_strategy ?? "milestone_based",
      stageCount
    ),
    milestones: buildMilestoneSnapshotFromWorkflow(workflow),
    trust: buildTrustContextFromWorkflow(workflow),
    contract: buildContractContextFromWorkflow(workflow),
    ...overrides,
  };
}

export function validateEscrowOverviewRequest(
  input: EscrowOverviewRequest
): EscrowRequestValidationResult {
  const errors: EscrowRequestValidationResult["errors"] = [];
  const escrowId = input.escrow_id?.trim() ?? "";

  if (!escrowId) {
    errors.push({ field: "escrow_id", message: "escrow_id is required" });
  } else if (!UUID_PATTERN.test(escrowId)) {
    errors.push({ field: "escrow_id", message: "escrow_id must be a valid UUID" });
  }

  if (input.contract_id !== undefined && input.contract_id.trim().length > 0) {
    if (!UUID_PATTERN.test(input.contract_id.trim())) {
      errors.push({ field: "contract_id", message: "contract_id must be a valid UUID when provided" });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateEscrowHistoryRequest(
  input: EscrowHistoryRequest
): EscrowRequestValidationResult {
  return validateEscrowOverviewRequest({ escrow_id: input.escrow_id });
}

export function resolveFixtureByEscrowId(escrowId: string): EscrowExperienceSource | null {
  const fixtures = [
    MVP_MILESTONE_ESCROW_SOURCE,
    MVP_SINGLE_RELEASE_ESCROW_SOURCE,
    MVP_REFUND_ESCROW_SOURCE,
    MVP_EMPTY_HISTORY_ESCROW_SOURCE,
  ];

  return fixtures.find((fixture) => fixture.escrow.id === escrowId) ?? null;
}
