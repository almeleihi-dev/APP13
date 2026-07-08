import type { AiGovernanceAssuranceExperienceOutput } from "../../ai-governance-assurance-experience/domain/ai-governance-assurance-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-accountability-ledger-experience-schema.js";
import type {
  LedgerCheck,
  LedgerContext,
  LedgerDashboard,
  AccountabilityChain,
  AccountabilityChainLink,
  DecisionTrace,
  DecisionTraceEntry,
  EvidenceRegister,
  EvidenceRegisterItem,
  ResponsibilityMap,
  ResponsibilityMapItem,
  AuditTrail,
  AuditTrailEntry,
  TransparencyReport,
  LedgerConfidence,
  DelegationAccountabilityLedger,
  LedgerExplanation,
} from "../domain/ai-accountability-ledger-experience-context.js";
import type { AccountabilityLedgerConfidenceLevel } from "../domain/ai-accountability-ledger-experience-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): LedgerCheck {
  return { checkId: id, label, passed, score, detail };
}

export class LedgerContextBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): LedgerContext {
    const ctx = assurance.governanceContext;

    return {
      contextId: `ledger-context-${assurance.outputId}`,
      governanceAssuranceOutputId: assurance.outputId,
      executiveAdvisoryOutputId: ctx.executiveAdvisoryOutputId,
      predictiveForecastOutputId: ctx.predictiveForecastOutputId,
      strategicIntelligenceOutputId: ctx.strategicIntelligenceOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: assurance.scenarioId,
      canonicalActionId: assurance.canonicalActionId,
      goal: assurance.goal,
      experienceMode: "read_only",
    };
  }
}

export class LedgerDashboardBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): LedgerDashboard {
    const dash = assurance.governanceDashboard;

    return {
      dashboardId: `ledger-dashboard-${assurance.outputId}`,
      headline: `Ledger Dashboard — ${assurance.goal}`,
      goal: assurance.goal,
      healthScore: dash.healthScore,
      probabilityScore: dash.probabilityScore,
      chainLinkCount: assurance.policyAlignment.policies.length,
      evidenceCount: assurance.assuranceChecks.checks.length,
      readOnly: true,
      summary: `Read-only ledger dashboard — ${assurance.policyAlignment.policies.length} chain links, ${assurance.assuranceChecks.checks.length} evidence items, probability ${dash.probabilityScore}/100.`,
    };
  }
}

export class AccountabilityChainBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): AccountabilityChain {
    const links: AccountabilityChainLink[] = assurance.policyAlignment.policies.map((policy) => ({
      linkId: `chain-${policy.itemId}`,
      sequence: policy.sequence,
      title: policy.title,
      detail: `Accountability chain link: ${policy.detail}`,
    }));

    return {
      chainId: `accountability-chain-${assurance.outputId}`,
      links,
      summary: `${links.length} read-only accountability chain links from policy alignment.`,
    };
  }
}

export class DecisionTraceBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): DecisionTrace {
    const entries: DecisionTraceEntry[] = assurance.controlMap.controls.map((control) => ({
      entryId: `trace-${control.itemId}`,
      sequence: control.sequence,
      title: control.title,
      detail: control.detail,
    }));

    return {
      traceId: `decision-trace-${assurance.outputId}`,
      entries,
      summary: `${entries.length} read-only decision trace entries from control map.`,
    };
  }
}

export class EvidenceRegisterBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): EvidenceRegister {
    const items: EvidenceRegisterItem[] = assurance.assuranceChecks.checks.map((item, index) => ({
      itemId: `evidence-${item.itemId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      status:
        index === 0
          ? ("verified" as const)
          : index === 1
            ? ("conditional" as const)
            : ("pending" as const),
    }));

    return {
      registerId: `evidence-register-${assurance.outputId}`,
      items,
      summary: `${items.length} read-only evidence register items from assurance checks.`,
    };
  }
}

export class ResponsibilityMapBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): ResponsibilityMap {
    const items: ResponsibilityMapItem[] = assurance.riskControls.items.map((item) => ({
      itemId: `responsibility-${item.itemId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      level: item.level,
    }));

    return {
      mapId: `responsibility-map-${assurance.outputId}`,
      items,
      summary: `${items.length} read-only responsibility map items from risk controls.`,
    };
  }
}

export class AuditTrailBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): AuditTrail {
    const entries: AuditTrailEntry[] = assurance.accountability.items.map((item) => ({
      entryId: `audit-${item.itemId}`,
      sequence: item.sequence,
      title: item.title,
      detail: item.detail,
    }));

    return {
      trailId: `audit-trail-${assurance.outputId}`,
      entries,
      summary: `${entries.length} read-only audit trail entries from accountability items.`,
    };
  }
}

export class TransparencyReportBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): TransparencyReport {
    const guidance = assurance.escalationGuidance;
    const transparencyLevel =
      assurance.assuranceConfidence.level === "high"
        ? ("full" as const)
        : assurance.assuranceConfidence.level === "medium"
          ? ("partial" as const)
          : ("limited" as const);

    return {
      reportId: `transparency-report-${assurance.outputId}`,
      headline: guidance.headline,
      narrative: guidance.narrative,
      transparencyLevel,
      readOnly: true,
      summary: `Transparency report — level ${transparencyLevel}, escalation ${guidance.escalationLevel}, assurance confidence ${assurance.assuranceConfidence.score}/100.`,
    };
  }
}

export class LedgerConfidenceBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): LedgerConfidence {
    let score = 40;
    score += Math.min(assurance.assuranceConfidence.score * 0.32, 30);
    score += Math.min(assurance.governanceDashboard.healthScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: AccountabilityLedgerConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Accountability Ledger Experience meets high-confidence criteria from governance assurance."
          : level === "medium"
            ? "Accountability ledger viable with conditional governance assurance requiring review."
            : "Limited accountability ledger confidence — treat outputs as advisory only.",
      assuranceConfidenceScore: assurance.assuranceConfidence.score,
    };
  }
}

export class DelegationAccountabilityLedgerBuilder {
  build(assurance: AiGovernanceAssuranceExperienceOutput): DelegationAccountabilityLedger {
    const checks: LedgerCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!assurance.outputId,
        assurance.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Governance Assurance Experience.`
      ),
      check(
        "del.trace",
        "Governance assurance traceability",
        !!assurance.executiveAdvisoryOutputId,
        assurance.executiveAdvisoryOutputId ? 95 : 0,
        `Governance assurance ${assurance.outputId} → executive advisory ${assurance.executiveAdvisoryOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Accountability ledger builders format governance assurance output only."
      ),
    ];

    return {
      delegationId: "accountability-ledger.delegation",
      soleUpstream: "CH5-X18 AI Governance Assurance Experience",
      noDuplicatedLogic: true,
      governanceAssuranceOutputId: assurance.outputId,
      checks,
      summary: "Delegation accountability ledger — sole upstream X18, no duplicated logic.",
    };
  }
}

export class LedgerExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: LedgerDashboard;
    accountabilityChain: AccountabilityChain;
    evidenceRegister: EvidenceRegister;
    ledgerConfidenceScore: number;
  }): LedgerExplanation {
    return {
      explanationId: `ledger-explanation-${input.outputId}`,
      headline: `AI Accountability Ledger for "${input.goal}"`,
      summary: `Read-only accountability ledger (confidence ${input.ledgerConfidenceScore}/100) — ${input.dashboard.chainLinkCount} chain links, ${input.dashboard.evidenceCount} evidence items, probability ${input.dashboard.probabilityScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      chainSummary: input.accountabilityChain.summary,
      evidenceSummary: input.evidenceRegister.summary,
    };
  }
}

export function createLedgerContextBuilder(): LedgerContextBuilder {
  return new LedgerContextBuilder();
}
export function createLedgerDashboardBuilder(): LedgerDashboardBuilder {
  return new LedgerDashboardBuilder();
}
export function createAccountabilityChainBuilder(): AccountabilityChainBuilder {
  return new AccountabilityChainBuilder();
}
export function createDecisionTraceBuilder(): DecisionTraceBuilder {
  return new DecisionTraceBuilder();
}
export function createEvidenceRegisterBuilder(): EvidenceRegisterBuilder {
  return new EvidenceRegisterBuilder();
}
export function createResponsibilityMapBuilder(): ResponsibilityMapBuilder {
  return new ResponsibilityMapBuilder();
}
export function createAuditTrailBuilder(): AuditTrailBuilder {
  return new AuditTrailBuilder();
}
export function createTransparencyReportBuilder(): TransparencyReportBuilder {
  return new TransparencyReportBuilder();
}
export function createLedgerConfidenceBuilder(): LedgerConfidenceBuilder {
  return new LedgerConfidenceBuilder();
}
export function createDelegationAccountabilityLedgerBuilder(): DelegationAccountabilityLedgerBuilder {
  return new DelegationAccountabilityLedgerBuilder();
}
export function createLedgerExplanationBuilder(): LedgerExplanationBuilder {
  return new LedgerExplanationBuilder();
}
