import type { ActionPlan } from "../../action-planning/domain/action-plan.js";
import type { CanonicalAction } from "../../action-ontology/domain/canonical-action.js";
import type {
  ContractClause,
  EscrowRecommendation,
  ExecutionTerms,
  PaymentRecommendation,
} from "../domain/contract-context.js";
import type { PricingRange } from "../../dynamic-pricing/domain/pricing-context.js";
import { getCategoryContractProfile } from "../domain/contract-reference-values.js";

export class ContractPaymentBuilder {
  build(input: {
    plan: ActionPlan;
    range: PricingRange;
    pricingRecommendationId: string;
    category: string;
  }): PaymentRecommendation {
    const profile = getCategoryContractProfile(input.category);

    return {
      structure: profile.paymentStructure,
      recommendedAmountMin: input.range.min,
      recommendedAmountMax: input.range.max,
      currency: input.range.currency,
      releaseTrigger:
        profile.paymentStructure === "deferred_matching"
          ? "Release deferred until provider matching and scope confirmation."
          : profile.paymentStructure === "milestone_release"
            ? "Release per milestone acceptance with evidence verification."
            : profile.paymentStructure === "deposit_balance"
              ? "Deposit on acceptance; balance on completion verification."
              : "Single release upon completion criteria satisfaction.",
      pricingRecommendationId: input.pricingRecommendationId,
      readOnlyNote:
        "Payment recommendation only — no payment execution, escrow funding, or contract creation.",
    };
  }
}

export class ContractEscrowBuilder {
  build(input: {
    plan: ActionPlan;
    canonicalAction: CanonicalAction;
    category: string;
    paymentMin: number;
  }): EscrowRecommendation {
    const profile = getCategoryContractProfile(input.category);
    const highRisk = input.canonicalAction.riskSignals.some((s) => s.severity === "high");

    let mode = profile.escrowMode;
    let holdPercentage = profile.escrowHoldPercentage;

    if (highRisk && mode !== "none") {
      holdPercentage = Math.min(100, holdPercentage + 15);
    }
    if (input.paymentMin === 0) {
      mode = "none";
      holdPercentage = 0;
    }

    const releaseConditions =
      mode === "none"
        ? ["No escrow hold — scope definition phase only."]
        : mode === "milestone_release"
          ? input.plan.stages.map((s) => `Release tranche after ${s.title} acceptance.`)
          : [
              "Funds held until completion criteria verified.",
              "Partial release allowed only with mutual approval.",
            ];

    return {
      mode,
      holdPercentage,
      releaseConditions,
      rationale:
        mode === "none"
          ? "Professional scope-definition agreements defer financial terms to provider matching."
          : `${holdPercentage}% escrow hold recommended for ${input.plan.category} category with ${input.canonicalAction.riskSignals.length} risk signals.`,
    };
  }
}

export class ContractClauseBuilder {
  build(input: {
    plan: ActionPlan;
    canonicalAction: CanonicalAction;
    category: string;
  }): {
    riskClauses: ContractClause[];
    cancellationClauses: ContractClause[];
    warrantySuggestions: ContractClause[];
  } {
    const profile = getCategoryContractProfile(input.category);

    const riskClauses: ContractClause[] = input.canonicalAction.riskSignals.map((signal) => ({
      clauseId: `clause.risk.${signal.signalId}`,
      clauseType: "risk",
      title: `Risk mitigation: ${signal.signalId}`,
      body: signal.description,
      severity: signal.severity,
    }));

    if (riskClauses.length === 0) {
      riskClauses.push({
        clauseId: "clause.risk.standard",
        clauseType: "risk",
        title: "Standard liability limitation",
        body: "Provider liability limited to direct damages up to contract value excluding force majeure.",
        severity: "low",
      });
    }

    riskClauses.push(
      ...input.canonicalAction.contractHints.map((hint, index) => ({
        clauseId: `clause.hint.${index}`,
        clauseType: "risk" as const,
        title: "Contract hint",
        body: hint,
        severity: "medium" as const,
      }))
    );

    const cancellationClauses: ContractClause[] = [
      {
        clauseId: "clause.cancel.notice",
        clauseType: "cancellation",
        title: "Cancellation notice period",
        body: `Either party may cancel with ${profile.cancellationNoticeHours} hours notice before scheduled start.`,
      },
      {
        clauseId: "clause.cancel.refund",
        clauseType: "cancellation",
        title: "Refund policy",
        body:
          profile.paymentStructure === "deferred_matching"
            ? "No funds collected during scope-definition phase."
            : "Pre-start cancellation: full escrow refund. Post-start: pro-rata for completed milestones only.",
      },
    ];

    const warrantySuggestions: ContractClause[] =
      profile.warrantyDays > 0
        ? [
            {
              clauseId: "clause.warranty.standard",
              clauseType: "warranty",
              title: "Service warranty",
              body: `Provider warrants workmanship for ${profile.warrantyDays} days after acceptance.`,
            },
            {
              clauseId: "clause.warranty.remedy",
              clauseType: "warranty",
              title: "Remedy",
              body: "Remedy limited to re-performance or credit at platform discretion within warranty window.",
            },
          ]
        : [
            {
              clauseId: "clause.warranty.none",
              clauseType: "warranty",
              title: "Warranty not applicable",
              body: "This engagement type does not include post-completion warranty beyond evidence verification.",
            },
          ];

    return { riskClauses, cancellationClauses, warrantySuggestions };
  }
}

export class ContractExecutionTermsBuilder {
  build(plan: ActionPlan): ExecutionTerms {
    return {
      estimatedMinHours: plan.timeline.minHours,
      estimatedMaxHours: plan.timeline.maxHours,
      startCondition: plan.decisionPoints.find((d) => d.gateType === "precondition")?.label ??
        "All preconditions satisfied and parties confirmed.",
      completionCondition:
        plan.completionCriteria.find((c) => c.mandatory)?.label ??
        "All mandatory acceptance criteria met with evidence submitted.",
      timelineSummary: plan.timeline.summary,
    };
  }
}

export function createContractPaymentBuilder(): ContractPaymentBuilder {
  return new ContractPaymentBuilder();
}
export function createContractEscrowBuilder(): ContractEscrowBuilder {
  return new ContractEscrowBuilder();
}
export function createContractClauseBuilder(): ContractClauseBuilder {
  return new ContractClauseBuilder();
}
export function createContractExecutionTermsBuilder(): ContractExecutionTermsBuilder {
  return new ContractExecutionTermsBuilder();
}
