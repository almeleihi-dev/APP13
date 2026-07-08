import { MVP_DISPUTE_ID } from "../dispute/dispute-payload.js";
import { MVP_EXECUTION_CONTRACT_ID } from "../execution/execution-payload.js";
import { MVP_ESCROW_ID } from "../escrow/escrow-payload.js";
import { MVP_MARKETPLACE_SEARCH } from "../marketplace/marketplace-payload.js";
import { MVP_DEMO_PROVIDER_PROFILE } from "../provider/provider-payload.js";
import { MVP_TRUST_PROVIDER_ID } from "../trust/trust-payload.js";
import type {
  PlatformExperienceSource,
  PlatformHomeRequest,
  PlatformOverviewRequest,
  PlatformRequestValidationResult,
} from "./types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MVP_PLATFORM_ID = "000e8400-e29b-41d4-a716-446655440001";
export const MVP_PLATFORM_EMPTY_ID = "000e8400-e29b-41d4-a716-446655440099";

/** Unified platform home with aggregated P1–P9 snapshot summaries (integration fixture). */
export const MVP_PLATFORM_HOME_SOURCE: PlatformExperienceSource = {
  platformId: MVP_PLATFORM_ID,
  requestActivity: {
    summary: "ready",
    fields: [
      { label: "Active Requests", value: "3" },
      { label: "Workflow Status", value: "ready" },
      { label: "Latest Category", value: MVP_MARKETPLACE_SEARCH.category ?? "software_developer" },
      { label: "Contract Readiness", value: "ready" },
    ],
  },
  marketplaceActivity: {
    summary: "2 matches",
    fields: [
      { label: "Search Results", value: "2" },
      { label: "Top Match Score", value: "92" },
      { label: "Category", value: "software_developer" },
      { label: "Budget Range", value: "15,000 SAR" },
    ],
  },
  providerActivity: {
    summary: MVP_DEMO_PROVIDER_PROFILE.profession ?? "software_developer",
    fields: [
      { label: "Active Providers", value: "2" },
      { label: "Featured Provider", value: MVP_TRUST_PROVIDER_ID },
      { label: "Profession", value: MVP_DEMO_PROVIDER_PROFILE.profession ?? "—" },
      { label: "Availability", value: "available" },
    ],
  },
  contractStatus: {
    summary: "active",
    fields: [
      { label: "Active Contracts", value: "1" },
      { label: "Primary Contract", value: MVP_EXECUTION_CONTRACT_ID },
      { label: "Status", value: "active" },
      { label: "Readiness", value: "ready" },
    ],
  },
  escrowStatus: {
    summary: "held",
    fields: [
      { label: "Active Escrows", value: "1" },
      { label: "Primary Escrow", value: MVP_ESCROW_ID },
      { label: "Status", value: "held" },
      { label: "Held Amount", value: "13,500.00 SAR" },
    ],
  },
  executionStatus: {
    summary: "in_progress",
    fields: [
      { label: "Active Projects", value: "1" },
      { label: "Contract", value: MVP_EXECUTION_CONTRACT_ID },
      { label: "Progress", value: "25%" },
      { label: "Current Milestone", value: "Work In Progress" },
    ],
  },
  evidenceStatus: {
    summary: "3 items",
    fields: [
      { label: "Total Evidence", value: "3" },
      { label: "Verified", value: "2" },
      { label: "Pending", value: "1" },
      { label: "Evidence Health", value: "partial" },
    ],
  },
  disputeStatus: {
    summary: "mediation",
    fields: [
      { label: "Open Disputes", value: "1" },
      { label: "Primary Dispute", value: MVP_DISPUTE_ID },
      { label: "Status", value: "mediation" },
      { label: "Escrow Impact", value: "frozen" },
    ],
  },
  trustStatus: {
    summary: "emerald",
    fields: [
      { label: "Featured Trust Score", value: "92" },
      { label: "Trust Tier", value: "emerald" },
      { label: "Provider", value: MVP_TRUST_PROVIDER_ID },
      { label: "Dispute Impact", value: "conditional" },
    ],
  },
  platformSummary: {
    summary: "operational",
    fields: [
      { label: "Active Workflows", value: "3" },
      { label: "Active Contracts", value: "1" },
      { label: "Open Disputes", value: "1" },
      { label: "Platform Health", value: "operational" },
    ],
  },
  overview: {
    activeRequests: {
      title: "Active Requests",
      summary: "3 open",
      items: [
        "REQ-2026-001 — software_developer — ready",
        "REQ-2026-002 — cleaning — needs_clarification",
        "REQ-2026-003 — software_developer — ready",
      ],
    },
    activeProviders: {
      title: "Active Providers",
      summary: "2 online",
      items: [
        `${MVP_TRUST_PROVIDER_ID} — software_developer — emerald`,
        "550e8400-e29b-41d4-a716-446655440002 — cleaning — gold",
      ],
    },
    activeContracts: {
      title: "Active Contracts",
      summary: "1 active",
      items: [`${MVP_EXECUTION_CONTRACT_ID} — Software Delivery Contract — active`],
    },
    activeEscrows: {
      title: "Active Escrows",
      summary: "1 held",
      items: [`${MVP_ESCROW_ID} — held — 13,500.00 SAR`],
    },
    activeProjects: {
      title: "Active Projects",
      summary: "1 in progress",
      items: [`${MVP_EXECUTION_CONTRACT_ID} — 25% complete — M-WIP in progress`],
    },
    evidenceOverview: {
      title: "Evidence Overview",
      summary: "3 total",
      items: ["2 verified", "1 pending", "Evidence health: partial"],
    },
    openDisputes: {
      title: "Open Disputes",
      summary: "1 open",
      items: [`${MVP_DISPUTE_ID} — mediation — escrow frozen`],
    },
    trustSnapshot: {
      title: "Trust Snapshot",
      summary: "emerald tier",
      items: [
        `Provider ${MVP_TRUST_PROVIDER_ID} — score 92 — emerald`,
        "Platform trust posture: conditional",
      ],
    },
  },
};

/** Empty platform state (integration fixture). */
export const MVP_PLATFORM_EMPTY_SOURCE: PlatformExperienceSource = {
  platformId: MVP_PLATFORM_EMPTY_ID,
  requestActivity: {
    summary: "none",
    fields: [
      { label: "Active Requests", value: "0" },
      { label: "Workflow Status", value: "—" },
      { label: "Latest Category", value: "—" },
      { label: "Contract Readiness", value: "—" },
    ],
  },
  marketplaceActivity: {
    summary: "0 matches",
    fields: [
      { label: "Search Results", value: "0" },
      { label: "Top Match Score", value: "—" },
      { label: "Category", value: "—" },
      { label: "Budget Range", value: "—" },
    ],
  },
  providerActivity: {
    summary: "none",
    fields: [
      { label: "Active Providers", value: "0" },
      { label: "Featured Provider", value: "—" },
      { label: "Profession", value: "—" },
      { label: "Availability", value: "—" },
    ],
  },
  contractStatus: {
    summary: "none",
    fields: [
      { label: "Active Contracts", value: "0" },
      { label: "Primary Contract", value: "—" },
      { label: "Status", value: "—" },
      { label: "Readiness", value: "—" },
    ],
  },
  escrowStatus: {
    summary: "none",
    fields: [
      { label: "Active Escrows", value: "0" },
      { label: "Primary Escrow", value: "—" },
      { label: "Status", value: "—" },
      { label: "Held Amount", value: "—" },
    ],
  },
  executionStatus: {
    summary: "none",
    fields: [
      { label: "Active Projects", value: "0" },
      { label: "Contract", value: "—" },
      { label: "Progress", value: "—" },
      { label: "Current Milestone", value: "—" },
    ],
  },
  evidenceStatus: {
    summary: "0 items",
    fields: [
      { label: "Total Evidence", value: "0" },
      { label: "Verified", value: "0" },
      { label: "Pending", value: "0" },
      { label: "Evidence Health", value: "none" },
    ],
  },
  disputeStatus: {
    summary: "none",
    fields: [
      { label: "Open Disputes", value: "0" },
      { label: "Primary Dispute", value: "—" },
      { label: "Status", value: "—" },
      { label: "Escrow Impact", value: "—" },
    ],
  },
  trustStatus: {
    summary: "—",
    fields: [
      { label: "Featured Trust Score", value: "—" },
      { label: "Trust Tier", value: "—" },
      { label: "Provider", value: "—" },
      { label: "Dispute Impact", value: "—" },
    ],
  },
  platformSummary: {
    summary: "idle",
    fields: [
      { label: "Active Workflows", value: "0" },
      { label: "Active Contracts", value: "0" },
      { label: "Open Disputes", value: "0" },
      { label: "Platform Health", value: "idle" },
    ],
  },
  overview: {
    activeRequests: { title: "Active Requests", summary: "0 open", items: [] },
    activeProviders: { title: "Active Providers", summary: "0 online", items: [] },
    activeContracts: { title: "Active Contracts", summary: "0 active", items: [] },
    activeEscrows: { title: "Active Escrows", summary: "0 held", items: [] },
    activeProjects: { title: "Active Projects", summary: "0 in progress", items: [] },
    evidenceOverview: { title: "Evidence Overview", summary: "0 total", items: [] },
    openDisputes: { title: "Open Disputes", summary: "0 open", items: [] },
    trustSnapshot: { title: "Trust Snapshot", summary: "—", items: [] },
  },
};

function validateOptionalUuid(
  field: string,
  value: string | undefined
): PlatformRequestValidationResult["errors"] {
  const errors: PlatformRequestValidationResult["errors"] = [];
  const trimmed = value?.trim() ?? "";

  if (trimmed.length > 0 && !UUID_PATTERN.test(trimmed)) {
    errors.push({ field, message: `${field} must be a valid UUID` });
  }

  return errors;
}

export function validatePlatformHomeRequest(input: PlatformHomeRequest): PlatformRequestValidationResult {
  const errors = validateOptionalUuid("platform_id", input.platform_id);
  return { valid: errors.length === 0, errors };
}

export function validatePlatformOverviewRequest(
  input: PlatformOverviewRequest
): PlatformRequestValidationResult {
  return validatePlatformHomeRequest({ platform_id: input.platform_id });
}

export function resolvePlatformFixture(platformId?: string): PlatformExperienceSource {
  const trimmed = platformId?.trim();

  if (trimmed === MVP_PLATFORM_EMPTY_ID) {
    return MVP_PLATFORM_EMPTY_SOURCE;
  }

  return MVP_PLATFORM_HOME_SOURCE;
}

export function findPlatformSource(platformId?: string): PlatformExperienceSource {
  return resolvePlatformFixture(platformId);
}
