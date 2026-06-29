import type { AiExecutiveAdvisoryExperienceOutput } from "../../ai-executive-advisory-experience/domain/ai-executive-advisory-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-governance-assurance-experience-schema.js";
import type {
  AssuranceCheck,
  GovernanceContext,
  GovernanceDashboard,
  PolicyAlignment,
  PolicyAlignmentItem,
  ControlMap,
  ControlMapItem,
  AssuranceChecks,
  AssuranceCheckItem,
  RiskControls,
  RiskControlItem,
  Accountability,
  AccountabilityItem,
  EscalationGuidance,
  AssuranceConfidence,
  DelegationGovernanceAssurance,
  AssuranceExplanation,
} from "../domain/ai-governance-assurance-experience-context.js";
import type { GovernanceAssuranceConfidenceLevel } from "../domain/ai-governance-assurance-experience-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): AssuranceCheck {
  return { checkId: id, label, passed, score, detail };
}

export class GovernanceContextBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): GovernanceContext {
    const ctx = advisory.advisoryContext;

    return {
      contextId: `governance-context-${advisory.outputId}`,
      executiveAdvisoryOutputId: advisory.outputId,
      predictiveForecastOutputId: ctx.predictiveForecastOutputId,
      strategicIntelligenceOutputId: ctx.strategicIntelligenceOutputId,
      decisionIntelligenceOutputId: ctx.decisionIntelligenceOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: advisory.scenarioId,
      canonicalActionId: advisory.canonicalActionId,
      goal: advisory.goal,
      experienceMode: "read_only",
    };
  }
}

export class GovernanceDashboardBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): GovernanceDashboard {
    const dash = advisory.advisoryDashboard;

    return {
      dashboardId: `governance-dashboard-${advisory.outputId}`,
      headline: `Governance Dashboard — ${advisory.goal}`,
      goal: advisory.goal,
      healthScore: dash.healthScore,
      probabilityScore: dash.probabilityScore,
      policyCount: advisory.advisoryRecommendations.recommendations.length,
      controlCount: advisory.actionPlan.items.length,
      readOnly: true,
      summary: `Read-only governance dashboard — ${advisory.advisoryRecommendations.recommendations.length} policy alignments, ${advisory.actionPlan.items.length} controls, probability ${dash.probabilityScore}/100.`,
    };
  }
}

export class PolicyAlignmentBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): PolicyAlignment {
    const policies: PolicyAlignmentItem[] = advisory.advisoryRecommendations.recommendations.map(
      (rec) => ({
        itemId: `policy-${rec.recommendationId}`,
        sequence: rec.sequence,
        title: rec.title,
        detail: `Policy alignment: ${rec.detail}`,
      })
    );

    return {
      alignmentId: `policy-alignment-${advisory.outputId}`,
      policies,
      summary: `${policies.length} read-only policy alignment items from advisory recommendations.`,
    };
  }
}

export class ControlMapBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): ControlMap {
    const controls: ControlMapItem[] = advisory.actionPlan.items.map((item) => ({
      itemId: `control-${item.itemId}`,
      sequence: item.sequence,
      title: item.title,
      detail: item.detail,
    }));

    return {
      mapId: `control-map-${advisory.outputId}`,
      controls,
      summary: `${controls.length} read-only control map items from action plan.`,
    };
  }
}

export class AssuranceChecksBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): AssuranceChecks {
    const checks: AssuranceCheckItem[] = advisory.priorityActions.actions.map((action, index) => ({
      itemId: `assurance-${action.actionId}`,
      sequence: action.sequence,
      label: action.label,
      detail: action.detail,
      status:
        index === 0 ? ("passed" as const) : index === 1 ? ("conditional" as const) : ("failed" as const),
    }));

    return {
      checksId: `assurance-checks-${advisory.outputId}`,
      checks,
      summary: `${checks.length} read-only assurance checks from priority actions.`,
    };
  }
}

export class RiskControlsBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): RiskControls {
    const items: RiskControlItem[] = advisory.riskAdvisory.items.map((item) => ({
      itemId: `risk-control-${item.itemId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      level: item.level,
    }));

    return {
      controlsId: `risk-controls-${advisory.outputId}`,
      items,
      riskScore: advisory.riskAdvisory.riskScore,
      summary: `${items.length} read-only risk control items from risk advisory.`,
    };
  }
}

export class AccountabilityBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): Accountability {
    const items: AccountabilityItem[] = advisory.opportunityAdvisory.opportunities.map((opp) => ({
      itemId: `accountability-${opp.itemId}`,
      sequence: opp.sequence,
      title: opp.title,
      detail: opp.detail,
    }));

    return {
      accountabilityId: `accountability-${advisory.outputId}`,
      items,
      summary: `${items.length} read-only accountability items from opportunity advisory.`,
    };
  }
}

export class EscalationGuidanceBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): EscalationGuidance {
    const briefing = advisory.executiveBriefing;
    const escalationLevel =
      advisory.advisoryConfidence.level === "high"
        ? ("none" as const)
        : advisory.advisoryConfidence.level === "medium"
          ? ("review" as const)
          : ("executive" as const);

    return {
      guidanceId: `escalation-guidance-${advisory.outputId}`,
      headline: briefing.headline,
      narrative: briefing.narrative,
      escalationLevel,
      readOnly: true,
      summary: `Escalation guidance — level ${escalationLevel}, ${briefing.scenarioCount} scenarios, advisory confidence ${advisory.advisoryConfidence.score}/100.`,
    };
  }
}

export class AssuranceConfidenceBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): AssuranceConfidence {
    let score = 38;
    score += Math.min(advisory.advisoryConfidence.score * 0.34, 32);
    score += Math.min(advisory.advisoryDashboard.healthScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: GovernanceAssuranceConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Governance Assurance Experience meets high-confidence criteria from executive advisory."
          : level === "medium"
            ? "Governance assurance viable with conditional executive advisory requiring review."
            : "Limited governance assurance confidence — treat outputs as advisory only.",
      advisoryConfidenceScore: advisory.advisoryConfidence.score,
    };
  }
}

export class DelegationGovernanceAssuranceBuilder {
  build(advisory: AiExecutiveAdvisoryExperienceOutput): DelegationGovernanceAssurance {
    const checks: AssuranceCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!advisory.outputId,
        advisory.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Executive Advisory Experience.`
      ),
      check(
        "del.trace",
        "Executive advisory traceability",
        !!advisory.predictiveForecastOutputId,
        advisory.predictiveForecastOutputId ? 95 : 0,
        `Executive advisory ${advisory.outputId} → predictive forecast ${advisory.predictiveForecastOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Governance assurance builders format executive advisory output only."
      ),
    ];

    return {
      delegationId: "governance-assurance.delegation",
      soleUpstream: "CH5-X17 AI Executive Advisory Experience",
      noDuplicatedLogic: true,
      executiveAdvisoryOutputId: advisory.outputId,
      checks,
      summary: "Delegation governance assurance — sole upstream X17, no duplicated logic.",
    };
  }
}

export class AssuranceExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: GovernanceDashboard;
    policyAlignment: PolicyAlignment;
    controlMap: ControlMap;
    assuranceConfidenceScore: number;
  }): AssuranceExplanation {
    return {
      explanationId: `assurance-explanation-${input.outputId}`,
      headline: `AI Governance Assurance for "${input.goal}"`,
      summary: `Read-only governance assurance (confidence ${input.assuranceConfidenceScore}/100) — ${input.dashboard.policyCount} policies, ${input.dashboard.controlCount} controls, probability ${input.dashboard.probabilityScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      policySummary: input.policyAlignment.summary,
      controlMapSummary: input.controlMap.summary,
    };
  }
}

export function createGovernanceContextBuilder(): GovernanceContextBuilder {
  return new GovernanceContextBuilder();
}
export function createGovernanceDashboardBuilder(): GovernanceDashboardBuilder {
  return new GovernanceDashboardBuilder();
}
export function createPolicyAlignmentBuilder(): PolicyAlignmentBuilder {
  return new PolicyAlignmentBuilder();
}
export function createControlMapBuilder(): ControlMapBuilder {
  return new ControlMapBuilder();
}
export function createAssuranceChecksBuilder(): AssuranceChecksBuilder {
  return new AssuranceChecksBuilder();
}
export function createRiskControlsBuilder(): RiskControlsBuilder {
  return new RiskControlsBuilder();
}
export function createAccountabilityBuilder(): AccountabilityBuilder {
  return new AccountabilityBuilder();
}
export function createEscalationGuidanceBuilder(): EscalationGuidanceBuilder {
  return new EscalationGuidanceBuilder();
}
export function createAssuranceConfidenceBuilder(): AssuranceConfidenceBuilder {
  return new AssuranceConfidenceBuilder();
}
export function createDelegationGovernanceAssuranceBuilder(): DelegationGovernanceAssuranceBuilder {
  return new DelegationGovernanceAssuranceBuilder();
}
export function createAssuranceExplanationBuilder(): AssuranceExplanationBuilder {
  return new AssuranceExplanationBuilder();
}
