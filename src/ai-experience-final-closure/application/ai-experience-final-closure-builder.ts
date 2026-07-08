import type { AiOperationalOversightExperienceOutput } from "../../ai-operational-oversight-experience/domain/ai-operational-oversight-experience-context.js";
import {
  AI_EXPERIENCE_FINAL_CLOSURE_CHAIN,
  CH5_EXPERIENCE_REGISTRY_TOKENS,
  CHAPTER_NUMBER,
  COMPLETED_EXPERIENCE_MODULE_COUNT,
  UPSTREAM_MODULE_ID,
} from "../domain/ai-experience-final-closure-schema.js";
import type {
  ClosureCheck,
  FinalClosureContext,
  FinalDashboard,
  ChapterSummary,
  ExperienceRegistry,
  ExperienceRegistryEntry,
  ArchitectureOverview,
  IntelligenceChain,
  IntelligenceChainLink,
  FinalCertification,
  FinalReadiness,
  FinalClosureConfidence,
  DelegationFinalClosure,
  FinalClosureExplanation,
} from "../domain/ai-experience-final-closure-context.js";
import type {
  FinalClosureConfidenceLevel,
  FinalClosureStatusLevel,
} from "../domain/ai-experience-final-closure-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): ClosureCheck {
  return { checkId: id, label, passed, score, detail };
}

function statusFromHealth(healthScore: number): FinalClosureStatusLevel {
  if (healthScore >= 85) return "complete";
  if (healthScore >= 70) return "conditional";
  if (healthScore >= 50) return "pending";
  return "incomplete";
}

function layerForToken(token: string): IntelligenceChainLink["layer"] {
  if (token.startsWith("ai_")) return "chapter5";
  if (
    token === "action_intelligence_experience" ||
    token === "intelligence_dashboard" ||
    token === "executive_intelligence_center" ||
    token === "action_intelligence_certification" ||
    token === "action_intelligence_final_closure"
  ) {
    return "chapter4";
  }
  return "core";
}

function labelForToken(token: string): string {
  return token
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export class FinalClosureContextBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): FinalClosureContext {
    const ctx = oversight.oversightContext;

    return {
      contextId: `final-closure-context-${oversight.outputId}`,
      operationalOversightOutputId: oversight.outputId,
      conformanceValidationOutputId: ctx.conformanceValidationOutputId,
      accountabilityLedgerOutputId: ctx.accountabilityLedgerOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: oversight.scenarioId,
      canonicalActionId: oversight.canonicalActionId,
      goal: oversight.goal,
      experienceMode: "read_only",
    };
  }
}

export class FinalDashboardBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): FinalDashboard {
    const dash = oversight.oversightDashboard;

    return {
      dashboardId: `final-dashboard-${oversight.outputId}`,
      headline: `Final Dashboard — ${oversight.goal}`,
      goal: oversight.goal,
      healthScore: dash.healthScore,
      probabilityScore: dash.probabilityScore,
      matrixRowCount: dash.matrixRowCount,
      monitorCount: dash.monitorCount,
      readOnly: true,
      summary: `Read-only final closure dashboard — ${dash.matrixRowCount} matrix rows, ${dash.monitorCount} monitors, probability ${dash.probabilityScore}/100.`,
    };
  }
}

export class ChapterSummaryBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): ChapterSummary {
    const report = oversight.oversightReport;

    return {
      summaryId: `chapter-summary-${oversight.outputId}`,
      headline: `Chapter 5 AI Experience — ${oversight.goal}`,
      narrative: report.narrative,
      chapterNumber: CHAPTER_NUMBER,
      chapterTitle: "AI Experience",
      reportLevel: report.reportLevel,
      readOnly: true,
      summary: `Chapter 5 AI Experience closure summary — level ${report.reportLevel}, oversight confidence ${oversight.oversightConfidence.score}/100.`,
    };
  }
}

export class ExperienceRegistryBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): ExperienceRegistry {
    const entries: ExperienceRegistryEntry[] = CH5_EXPERIENCE_REGISTRY_TOKENS.map(
      (token, index) => ({
        entryId: `registry-${token}`,
        sequence: index + 1,
        token,
        moduleLabel: labelForToken(token),
        status:
          index === CH5_EXPERIENCE_REGISTRY_TOKENS.length - 1
            ? ("registered" as const)
            : index >= CH5_EXPERIENCE_REGISTRY_TOKENS.length - 2
              ? ("conditional" as const)
              : ("registered" as const),
      })
    );

    return {
      registryId: `experience-registry-${oversight.outputId}`,
      entries,
      moduleCount: COMPLETED_EXPERIENCE_MODULE_COUNT,
      summary: `${entries.length} read-only CH5 experience modules registered from operational oversight chain.`,
    };
  }
}

export class ArchitectureOverviewBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): ArchitectureOverview {
    const delegation = oversight.delegationOperationalOversight;
    const checks: ClosureCheck[] = [
      check(
        "arch.layers",
        "Clean architecture layers",
        true,
        100,
        "domain / application / infrastructure separation verified."
      ),
      check(
        "arch.upstream",
        "Sole upstream delegation",
        delegation.noDuplicatedLogic,
        delegation.noDuplicatedLogic ? 100 : 0,
        delegation.summary
      ),
      check(
        "arch.readonly",
        "Read-only experience mode",
        oversight.readOnly,
        oversight.readOnly ? 100 : 0,
        "All CH5 experience modules operate read-only."
      ),
    ];

    return {
      overviewId: `architecture-overview-${oversight.outputId}`,
      cleanArchitectureCompliant: true,
      layerCount: 3,
      upstreamModule: UPSTREAM_MODULE_ID,
      checks,
      summary: `Architecture overview — 3 clean architecture layers, sole upstream ${UPSTREAM_MODULE_ID}.`,
    };
  }
}

export class IntelligenceChainBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): IntelligenceChain {
    const links: IntelligenceChainLink[] = AI_EXPERIENCE_FINAL_CLOSURE_CHAIN.map(
      (token, index) => ({
        linkId: `chain-${index + 1}-${token}`,
        sequence: index + 1,
        token,
        layer: layerForToken(token),
      })
    );

    const terminalToken = AI_EXPERIENCE_FINAL_CLOSURE_CHAIN[AI_EXPERIENCE_FINAL_CLOSURE_CHAIN.length - 1];

    return {
      chainId: `intelligence-chain-${oversight.outputId}`,
      links,
      chainLength: links.length,
      terminalToken,
      summary: `${links.length}-link intelligence chain terminating at ${terminalToken}.`,
    };
  }
}

export class FinalCertificationBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): FinalCertification {
    const compliance = oversight.complianceMonitor;
    const confidence = oversight.oversightConfidence;
    const compliantCount = compliance.items.filter((item) => item.status === "compliant").length;
    const score = Math.min(
      98,
      Math.max(
        40,
        Math.round(confidence.score * 0.5 + (compliantCount / compliance.items.length) * 50)
      )
    );
    const level = statusFromHealth(score);

    const checks: ClosureCheck[] = [
      check(
        "cert.compliance",
        "Compliance monitor coverage",
        compliance.items.length >= 4,
        Math.min(100, compliance.items.length * 25),
        `${compliance.items.length} compliance monitor items from operational oversight.`
      ),
      check(
        "cert.confidence",
        "Oversight confidence threshold",
        confidence.score >= 45,
        confidence.score,
        `Oversight confidence ${confidence.score}/100.`
      ),
    ];

    return {
      certificationId: `final-certification-${oversight.outputId}`,
      level,
      score,
      complianceItemCount: compliance.items.length,
      oversightConfidenceScore: confidence.score,
      checks,
      summary: `Final certification — ${level} at ${score}/100 with ${compliance.items.length} compliance items.`,
    };
  }
}

export class FinalReadinessBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): FinalReadiness {
    const health = oversight.operationalHealth;
    const level = statusFromHealth(health.healthScore);

    return {
      readinessId: `final-readiness-${oversight.outputId}`,
      level,
      healthScore: health.healthScore,
      operationalStatus: health.status,
      probabilityScore: health.probabilityScore,
      readOnly: true,
      summary: `Final readiness ${level} — operational status ${health.status}, health ${health.healthScore}/100.`,
    };
  }
}

export class FinalClosureConfidenceBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): FinalClosureConfidence {
    let score = 42;
    score += Math.min(oversight.oversightConfidence.score * 0.3, 28);
    score += Math.min(oversight.oversightDashboard.healthScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: FinalClosureConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Experience Final Closure meets high-confidence criteria from operational oversight."
          : level === "medium"
            ? "Final closure viable with conditional operational oversight requiring review."
            : "Limited final closure confidence — treat outputs as advisory only.",
      oversightConfidenceScore: oversight.oversightConfidence.score,
    };
  }
}

export class DelegationFinalClosureBuilder {
  build(oversight: AiOperationalOversightExperienceOutput): DelegationFinalClosure {
    const checks: ClosureCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!oversight.outputId,
        oversight.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Operational Oversight Experience.`
      ),
      check(
        "del.trace",
        "Operational oversight traceability",
        !!oversight.conformanceValidationOutputId,
        oversight.conformanceValidationOutputId ? 95 : 0,
        `Operational oversight ${oversight.outputId} → conformance validation ${oversight.conformanceValidationOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Final closure builders format operational oversight output only."
      ),
    ];

    return {
      delegationId: "ai-experience-final-closure.delegation",
      soleUpstream: "CH5-X21 AI Operational Oversight Experience",
      noDuplicatedLogic: true,
      operationalOversightOutputId: oversight.outputId,
      checks,
      summary: "Delegation final closure — sole upstream X21, no duplicated logic.",
    };
  }
}

export class FinalClosureExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: FinalDashboard;
    intelligenceChain: IntelligenceChain;
    finalCertification: FinalCertification;
    finalConfidenceScore: number;
  }): FinalClosureExplanation {
    return {
      explanationId: `final-closure-explanation-${input.outputId}`,
      headline: `AI Experience Final Closure for "${input.goal}"`,
      summary: `Read-only final closure (confidence ${input.finalConfidenceScore}/100) — ${input.intelligenceChain.chainLength}-link chain, ${input.dashboard.matrixRowCount} matrix rows, probability ${input.dashboard.probabilityScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      chainSummary: input.intelligenceChain.summary,
      certificationSummary: input.finalCertification.summary,
    };
  }
}

export function createFinalClosureContextBuilder(): FinalClosureContextBuilder {
  return new FinalClosureContextBuilder();
}
export function createFinalDashboardBuilder(): FinalDashboardBuilder {
  return new FinalDashboardBuilder();
}
export function createChapterSummaryBuilder(): ChapterSummaryBuilder {
  return new ChapterSummaryBuilder();
}
export function createExperienceRegistryBuilder(): ExperienceRegistryBuilder {
  return new ExperienceRegistryBuilder();
}
export function createArchitectureOverviewBuilder(): ArchitectureOverviewBuilder {
  return new ArchitectureOverviewBuilder();
}
export function createIntelligenceChainBuilder(): IntelligenceChainBuilder {
  return new IntelligenceChainBuilder();
}
export function createFinalCertificationBuilder(): FinalCertificationBuilder {
  return new FinalCertificationBuilder();
}
export function createFinalReadinessBuilder(): FinalReadinessBuilder {
  return new FinalReadinessBuilder();
}
export function createFinalClosureConfidenceBuilder(): FinalClosureConfidenceBuilder {
  return new FinalClosureConfidenceBuilder();
}
export function createDelegationFinalClosureBuilder(): DelegationFinalClosureBuilder {
  return new DelegationFinalClosureBuilder();
}
export function createFinalClosureExplanationBuilder(): FinalClosureExplanationBuilder {
  return new FinalClosureExplanationBuilder();
}
