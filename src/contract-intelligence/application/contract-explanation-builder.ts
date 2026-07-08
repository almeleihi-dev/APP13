import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type {
  ContractConfidence,
  ContractExplanation,
  ContractIntelligenceRecommendation,
} from "../domain/contract-context.js";
import type { ContractType } from "../domain/contract-intelligence-schema.js";

export class ContractConfidenceBuilder {
  build(input: {
    plan: ActionPlan;
    pricingConfidenceScore: number;
    milestoneCount: number;
    evidenceCount: number;
  }): ContractConfidence {
    let score = 50;
    score += Math.min(input.pricingConfidenceScore * 0.3, 25);
    score += Math.min(input.milestoneCount * 3, 12);
    score += Math.min(input.evidenceCount * 2, 10);
    score += input.plan.completionCriteria.length >= 2 ? 5 : 0;
    score = Math.min(95, Math.max(40, Math.round(score)));

    const level = score >= 80 ? "high" : score >= 60 ? "medium" : "low";
    const planCompleteness = Math.min(
      100,
      input.plan.tasks.length * 5 +
        input.plan.stages.length * 8 +
        input.plan.completionCriteria.length * 10
    );

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Complete plan, pricing, and evidence mapping support a confident contract recommendation."
          : level === "medium"
            ? "Contract recommendation viable; confirm scope details before execution."
            : "Limited upstream data — treat as indicative contract intelligence only.",
      pricingConfidenceScore: input.pricingConfidenceScore,
      planCompletenessScore: planCompleteness,
    };
  }
}

export class ContractExplanationBuilder {
  build(input: {
    recommendationId: string;
    goal: string;
    milestones: ContractIntelligenceRecommendation["milestones"];
    parties: ContractIntelligenceRecommendation["parties"];
    paymentRecommendation: ContractIntelligenceRecommendation["paymentRecommendation"];
    escrowRecommendation: ContractIntelligenceRecommendation["escrowRecommendation"];
    riskClauses: ContractIntelligenceRecommendation["riskClauses"];
    executionTerms: ContractIntelligenceRecommendation["executionTerms"];
    canonicalAction: CanonicalAction;
    contractType: ContractType;
  }): ContractExplanation {
    const { canonicalAction, contractType } = input;

    return {
      explanationId: `explanation-${input.recommendationId}`,
      headline: `Contract recommendation for "${input.goal}"`,
      summary: `Recommends a ${contractType.replace(/_/g, " ")} with ${input.milestones.length} milestones, ${input.parties.length} parties, and ${input.paymentRecommendation.currency} ${input.paymentRecommendation.recommendedAmountMin}–${input.paymentRecommendation.recommendedAmountMax} payment range derived from CH4-C4 pricing.`,
      contractTypeRationale: `${contractType} selected for ${canonicalAction.category} category based on action type "${canonicalAction.actionType}" and ${canonicalAction.contractHints.length} contract hints from CH4-C2 ontology.`,
      paymentRationale: input.paymentRecommendation.releaseTrigger,
      escrowRationale: input.escrowRecommendation.rationale,
      riskSummary: `${input.riskClauses.length} risk clauses address ${canonicalAction.riskSignals.length} canonical risk signals and plan complexity.`,
      milestoneSummary: `${input.milestones.length} milestones align with ${input.executionTerms.estimatedMinHours}–${input.executionTerms.estimatedMaxHours} hour execution window from CH4-C3 plan.`,
    };
  }
}

export function createContractConfidenceBuilder(): ContractConfidenceBuilder {
  return new ContractConfidenceBuilder();
}
export function createContractExplanationBuilder(): ContractExplanationBuilder {
  return new ContractExplanationBuilder();
}
