import { createHash } from "node:crypto";
import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import type { RequirementIntelligenceService } from "../../action/intelligence/requirement/requirement-intelligence-service.js";
import type { ContractIntelligenceService } from "../../contract/intelligence/contract-intelligence-service.js";
import type { MatchingIntelligenceService } from "../../matching/intelligence/matching-intelligence-service.js";
import type { NegotiationIntelligenceService } from "../../negotiation/intelligence/negotiation-intelligence-service.js";
import type { PricingIntelligenceService } from "../../pricing/intelligence/pricing-intelligence-service.js";
import type { TrustIntelligenceService } from "../../trust/intelligence/trust-intelligence-service.js";
import type { ComplexityLevel, LocationTier } from "../../pricing/intelligence/types.js";
import type { RiskProfile as NegotiationRiskProfile } from "../../negotiation/intelligence/types.js";
import type { RiskLevel } from "../../contract/intelligence/types.js";
import type { TrustBehaviorMetrics } from "../../trust/intelligence/types.js";
import type { MatchingProvider } from "../../matching/intelligence/types.js";
import { createActionIntelligenceService } from "../../action/intelligence/action-intelligence-service.js";
import { createRequirementIntelligenceService } from "../../action/intelligence/requirement/requirement-intelligence-service.js";
import { createContractIntelligenceService } from "../../contract/intelligence/contract-intelligence-service.js";
import { createMatchingIntelligenceService } from "../../matching/intelligence/matching-intelligence-service.js";
import { createNegotiationIntelligenceService } from "../../negotiation/intelligence/negotiation-intelligence-service.js";
import { createPricingIntelligenceService } from "../../pricing/intelligence/pricing-intelligence-service.js";
import { createTrustIntelligenceService } from "../../trust/intelligence/trust-intelligence-service.js";
import type {
  ProviderCandidate,
  WorkflowAnalyzeInput,
  WorkflowAnalyzeResult,
  WorkflowStatus,
} from "./types.js";

const DEFAULT_MATCHING_BUDGET = 10000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STRONG_TRUST_METRICS: TrustBehaviorMetrics = {
  completed_contracts: 52,
  completion_rate: 0.96,
  average_rating: 4.8,
  refund_rate: 0.01,
  issue_rate: 0.03,
  evidence_quality_score: 0.9,
  identity_verification_level: "iron",
};

const MODERATE_TRUST_METRICS: TrustBehaviorMetrics = {
  completed_contracts: 20,
  completion_rate: 0.88,
  average_rating: 4.4,
  refund_rate: 0.03,
  issue_rate: 0.06,
  evidence_quality_score: 0.75,
  identity_verification_level: "gold",
};

const WEAK_TRUST_METRICS: TrustBehaviorMetrics = {
  completed_contracts: 5,
  completion_rate: 0.75,
  average_rating: 3.8,
  refund_rate: 0.08,
  issue_rate: 0.12,
  evidence_quality_score: 0.55,
  identity_verification_level: "bronze",
};

function validateInput(input: WorkflowAnalyzeInput): void {
  if (typeof input.requirement_text !== "string" || input.requirement_text.trim().length === 0) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "orchestrator",
        detail: "requirement_text is required",
      })
    );
  }

  if (!Array.isArray(input.providers)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "orchestrator",
        detail: "providers must be an array",
      })
    );
  }

  input.providers.forEach((provider, index) => {
    if (!provider?.provider_id?.trim()) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "orchestrator",
          detail: `providers[${index}].provider_id is required`,
        })
      );
    }

    if (!Array.isArray(provider.action_codes) || !Array.isArray(provider.skills)) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "orchestrator",
          detail: `providers[${index}] action_codes and skills must be arrays`,
        })
      );
    }

    for (const field of ["trust_score", "rating"] as const) {
      if (typeof provider[field] !== "number" || !Number.isFinite(provider[field])) {
        throw new AppError(
          problem({
            title: "Bad Request",
            status: 400,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "orchestrator",
            detail: `providers[${index}].${field} must be a finite number`,
          })
        );
      }
    }
  });
}

function resolveWorkflowStatus(
  requirementReadiness: WorkflowAnalyzeResult["requirement"]["contract_readiness"],
  providerCount: number
): WorkflowStatus {
  if (providerCount === 0) {
    return "no_provider_match";
  }

  if (requirementReadiness === "needs_clarification" || requirementReadiness === "unknown") {
    return "needs_clarification";
  }

  return "ready";
}

function toMatchingProvider(candidate: ProviderCandidate, priceEstimate: number): MatchingProvider {
  return {
    provider_id: candidate.provider_id,
    action_codes: candidate.action_codes,
    skills: candidate.skills,
    trust_score: candidate.trust_score,
    average_rating: candidate.rating,
    price_estimate: priceEstimate,
    available_now: true,
    ...(typeof candidate.latitude === "number" && typeof candidate.longitude === "number"
      ? { location: { lat: candidate.latitude, lng: candidate.longitude } }
      : {}),
  };
}

function resolveRequiredSkills(
  candidates: ProviderCandidate[],
  selectedProviderId: string | null
): string[] {
  const selected =
    candidates.find((candidate) => candidate.provider_id === selectedProviderId) ?? candidates[0];

  return selected?.skills.slice(0, 5) ?? [];
}

function resolveProfession(input: WorkflowAnalyzeInput): string {
  return input.profession?.trim() || "general";
}

function resolveEstimatedDays(
  input: WorkflowAnalyzeInput,
  selectedProvider: ProviderCandidate | undefined,
  milestoneCount: number
): number {
  if (typeof input.customer_days === "number" && input.customer_days > 0) {
    return input.customer_days;
  }

  if (typeof selectedProvider?.estimated_days === "number" && selectedProvider.estimated_days > 0) {
    return selectedProvider.estimated_days;
  }

  return Math.max(1, milestoneCount * 7);
}

function resolveComplexity(milestoneCount: number, deliverableCount: number): ComplexityLevel {
  const scopeSize = milestoneCount + deliverableCount;
  if (scopeSize <= 2) return "low";
  if (scopeSize <= 5) return "medium";
  return "high";
}

function resolveLocationTier(selectedProvider: ProviderCandidate | undefined): LocationTier {
  if (
    typeof selectedProvider?.latitude === "number" &&
    typeof selectedProvider?.longitude === "number"
  ) {
    return "metro";
  }

  return "standard";
}

function deriveNegotiationRisk(
  trustScore: number,
  contractValue: number,
  contractRisk: RiskLevel | null
): NegotiationRiskProfile {
  if (contractRisk) {
    return contractRisk;
  }

  if (trustScore >= 85 && contractValue <= 5000) {
    return "low";
  }

  if (trustScore < 60 || contractValue >= 20000) {
    return "high";
  }

  return "medium";
}

function deriveTrustMetrics(candidate: ProviderCandidate): TrustBehaviorMetrics {
  const base =
    candidate.trust_score >= 85
      ? STRONG_TRUST_METRICS
      : candidate.trust_score >= 70
        ? MODERATE_TRUST_METRICS
        : WEAK_TRUST_METRICS;

  return {
    ...base,
    average_rating: Math.max(0, Math.min(5, candidate.rating)),
  };
}

function resolveTrustProviderId(providerId: string): string {
  if (UUID_PATTERN.test(providerId)) {
    return providerId;
  }

  const hash = createHash("sha256").update(`app13-trust:${providerId}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export class WorkflowIntelligenceService {
  constructor(
    private readonly requirementIntelligence: RequirementIntelligenceService,
    private readonly matchingIntelligence: MatchingIntelligenceService,
    private readonly pricingIntelligence: PricingIntelligenceService,
    private readonly negotiationIntelligence: NegotiationIntelligenceService,
    private readonly contractIntelligence: ContractIntelligenceService,
    private readonly trustIntelligence: TrustIntelligenceService
  ) {}

  analyze(input: WorkflowAnalyzeInput): WorkflowAnalyzeResult {
    validateInput(input);

    const requirement = this.requirementIntelligence.extract({
      requirement_text: input.requirement_text,
      profession_hint: input.profession,
    });

    const workflow_status = resolveWorkflowStatus(
      requirement.contract_readiness,
      input.providers.length
    );

    if (workflow_status === "no_provider_match") {
      return {
        workflow_status,
        requirement,
        matching: { ranked_matches: [], selected_provider_id: null },
        pricing: null,
        negotiation: null,
        contract: null,
        trust: null,
        summary: {
          provider_id: null,
          recommended_price: null,
          trust_score: null,
          negotiation_state: null,
        },
      };
    }

    const actionCodes = requirement.suggested_actions.map((action) => action.action_code);
    const matchingBudget = input.customer_budget ?? DEFAULT_MATCHING_BUDGET;
    const matchingProviders = input.providers.map((candidate) =>
      toMatchingProvider(candidate, candidate.price_offer ?? matchingBudget)
    );

    const matchingResult = this.matchingIntelligence.rank({
      requirement: {
        required_action_codes: actionCodes,
        required_skills: resolveRequiredSkills(input.providers, null),
        budget: matchingBudget,
        currency: "SAR",
        urgent: false,
      },
      providers: matchingProviders,
    });

    const selectedProviderId = matchingResult.ranked_matches[0]?.provider_id ?? null;
    const selectedProvider = input.providers.find(
      (candidate) => candidate.provider_id === selectedProviderId
    );

    const pricing = this.pricingIntelligence.calculate({
      profession: resolveProfession(input),
      action_codes: actionCodes.length > 0 ? actionCodes : selectedProvider?.action_codes ?? [],
      trust_score: selectedProvider?.trust_score ?? matchingResult.ranked_matches[0]?.component_scores.trust ?? 0,
      complexity: resolveComplexity(requirement.milestones.length, requirement.deliverables.length),
      estimated_days: resolveEstimatedDays(input, selectedProvider, requirement.milestones.length),
      urgent: false,
      location_tier: resolveLocationTier(selectedProvider),
    });

    const customerOffer = input.customer_budget ?? pricing.price_range.minimum;
    const providerOffer =
      selectedProvider?.price_offer ?? pricing.price_range.recommended;

    const negotiation = this.negotiationIntelligence.analyze({
      customer_offer: customerOffer,
      provider_offer: providerOffer,
      customer_days: input.customer_days,
      provider_days: selectedProvider?.estimated_days,
      scope_items: requirement.deliverables.length + requirement.milestones.length,
      trust_score: selectedProvider?.trust_score,
      risk_profile: deriveNegotiationRisk(
        selectedProvider?.trust_score ?? 0,
        pricing.price_range.recommended,
        null
      ),
      contract_value: pricing.price_range.recommended,
    });

    const contract = this.contractIntelligence.generate({
      profession: resolveProfession(input),
      requirement_text: input.requirement_text,
      contract_value: pricing.price_range.recommended,
      currency: "SAR",
      ai2_result: requirement,
    });

    const trust = selectedProvider
      ? this.trustIntelligence.calculate({
          provider_id: resolveTrustProviderId(selectedProvider.provider_id),
          metrics: deriveTrustMetrics(selectedProvider),
        })
      : null;

    return {
      workflow_status,
      requirement,
      matching: {
        ...matchingResult,
        selected_provider_id: selectedProviderId,
      },
      pricing,
      negotiation,
      contract,
      trust,
      summary: {
        provider_id: selectedProviderId,
        recommended_price: negotiation.recommended_price,
        trust_score: trust?.trust_score ?? selectedProvider?.trust_score ?? null,
        negotiation_state: negotiation.negotiation_state,
      },
    };
  }
}

export function createWorkflowIntelligenceService(): WorkflowIntelligenceService {
  const actionIntelligence = createActionIntelligenceService();
  const requirementIntelligence = createRequirementIntelligenceService();

  return new WorkflowIntelligenceService(
    requirementIntelligence,
    createMatchingIntelligenceService(),
    createPricingIntelligenceService(),
    createNegotiationIntelligenceService(),
    createContractIntelligenceService(actionIntelligence, requirementIntelligence),
    createTrustIntelligenceService()
  );
}
