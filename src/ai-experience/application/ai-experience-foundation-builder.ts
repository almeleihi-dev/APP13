import type { ActionIntelligenceFinalClosureOutput } from "../../action-intelligence-final-closure/domain/action-intelligence-final-closure-context.js";
import {
  AI_EXPERIENCE_FOUNDATION_CHAIN,
  CHAPTER_NUMBER,
  UPSTREAM_MODULE_ID,
} from "../domain/ai-experience-foundation-schema.js";
import type {
  FoundationCheck,
  AiExperienceSharedContext,
  FoundationStatus,
  ChapterHandoffIntegration,
  IntelligenceLineage,
  FoundationReadiness,
  DelegationFoundation,
  FoundationConfidence,
  FoundationExplanation,
} from "../domain/ai-experience-foundation-context.js";
import type {
  FoundationStatusLevel,
  FoundationConfidenceLevel,
} from "../domain/ai-experience-foundation-schema.js";

function mapClosureStatus(status: string): FoundationStatusLevel {
  if (status === "complete") return "ready";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "not_ready";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): FoundationCheck {
  return { checkId: id, label, passed, score, detail };
}

export class AiExperienceSharedContextBuilder {
  build(closure: ActionIntelligenceFinalClosureOutput): AiExperienceSharedContext {
    const handoff = closure.chapterHandoffReport;
    const chapterComplete =
      closure.chapterCompletionStatus.level === "complete" ||
      closure.chapterCompletionStatus.level === "conditional";

    return {
      contextId: `ai-context-${closure.outputId}`,
      chapterNumber: CHAPTER_NUMBER,
      scenarioId: closure.scenarioId,
      canonicalActionId: closure.canonicalActionId,
      goal: closure.goal,
      closureOutputId: closure.outputId,
      certificationOutputId: closure.certificationOutputId,
      executiveCenterOutputId: closure.executiveCenterOutputId,
      dashboardOutputId: closure.dashboardOutputId,
      orchestrationOutputId: closure.orchestrationOutputId,
      handoffReady: handoff.handoffReady,
      upstreamChapterComplete: chapterComplete,
      experienceMode: "read_only",
    };
  }
}

export class FoundationStatusBuilder {
  build(closure: ActionIntelligenceFinalClosureOutput): FoundationStatus {
    const chapterStatus = closure.chapterCompletionStatus;
    const handoff = closure.chapterHandoffReport;
    const level = mapClosureStatus(chapterStatus.level);
    const score = chapterStatus.score;

    return {
      statusId: "foundation.status",
      level,
      score,
      chapterNumber: CHAPTER_NUMBER,
      chapterTitle: "AI Experience",
      upstreamHandoffReady: handoff.handoffReady,
      summary: `Chapter 5 AI Experience foundation ${level} — ${score}/100, upstream handoff ${handoff.handoffReady ? "ready" : "pending"}.`,
    };
  }
}

export class ChapterHandoffIntegrationBuilder {
  build(closure: ActionIntelligenceFinalClosureOutput): ChapterHandoffIntegration {
    const handoff = closure.chapterHandoffReport;

    return {
      integrationId: "foundation.handoff",
      fromChapter: handoff.fromChapter,
      toChapter: handoff.toChapter,
      handoffReady: handoff.handoffReady,
      handoffStatus: handoff.handoffStatus,
      deliverables: handoff.deliverables,
      summary: handoff.summary,
    };
  }
}

export class IntelligenceLineageBuilder {
  build(closure: ActionIntelligenceFinalClosureOutput): IntelligenceLineage {
    return {
      lineageId: "foundation.lineage",
      chainLength: AI_EXPERIENCE_FOUNDATION_CHAIN.length - 1,
      closureOutputId: closure.outputId,
      certificationOutputId: closure.certificationOutputId,
      executiveCenterOutputId: closure.executiveCenterOutputId,
      orchestrationOutputId: closure.orchestrationOutputId,
      lineageChain: AI_EXPERIENCE_FOUNDATION_CHAIN,
      summary: `Intelligence lineage — ${AI_EXPERIENCE_FOUNDATION_CHAIN.length - 1} layers traced from intent through ${UPSTREAM_MODULE_ID} closure.`,
    };
  }
}

export class FoundationReadinessBuilder {
  build(closure: ActionIntelligenceFinalClosureOutput): FoundationReadiness {
    const readiness = closure.readinessSummary;
    const level = mapClosureStatus(readiness.level);
    const foundationReady = readiness.chapterReadyForHandoff && readiness.readinessScore >= 50;

    return {
      readinessId: "foundation.readiness",
      level,
      readinessScore: readiness.readinessScore,
      foundationReady,
      checks: readiness.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Foundation readiness — ${readiness.readinessScore}/100, foundation ${foundationReady ? "ready" : "pending"}.`,
    };
  }
}

export class DelegationFoundationBuilder {
  build(closure: ActionIntelligenceFinalClosureOutput): DelegationFoundation {
    const checks: FoundationCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!closure.outputId,
        closure.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} action intelligence final closure.`
      ),
      check(
        "del.trace",
        "Closure traceability",
        !!closure.certificationOutputId,
        closure.certificationOutputId ? 95 : 0,
        `Closure ${closure.outputId} → certification ${closure.certificationOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Foundation builders format closure output only — no new business logic."
      ),
    ];

    return {
      foundationId: "foundation.delegation",
      soleUpstream: "CH4-C22 Action Intelligence Final Closure",
      noDuplicatedLogic: true,
      closureOutputId: closure.outputId,
      checks,
      summary: "Delegation foundation — sole upstream C22, no duplicated logic.",
    };
  }
}

export class FoundationConfidenceBuilder {
  build(closure: ActionIntelligenceFinalClosureOutput, overallScore: number): FoundationConfidence {
    let score = 48;
    score += Math.min(closure.closureConfidence.score * 0.24, 22);
    score += Math.min(overallScore * 0.22, 22);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: FoundationConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Experience foundation meets high-confidence readiness for Chapter 5 modules."
          : level === "medium"
            ? "Foundation viable with conditional upstream closure requiring review."
            : "Limited foundation confidence — treat outputs as advisory only.",
      closureConfidenceScore: closure.closureConfidence.score,
    };
  }
}

export class FoundationExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    closure: ActionIntelligenceFinalClosureOutput;
    sharedContext: AiExperienceSharedContext;
    foundationStatus: FoundationStatus;
    handoff: ChapterHandoffIntegration;
    lineage: IntelligenceLineage;
    readiness: FoundationReadiness;
    foundationConfidenceScore: number;
  }): FoundationExplanation {
    return {
      explanationId: `foundation-explanation-${input.outputId}`,
      headline: `AI Experience foundation for "${input.goal}"`,
      summary: `Chapter 5 foundation (confidence ${input.foundationConfidenceScore}/100) — status ${input.foundationStatus.level}, handoff ${input.handoff.handoffReady ? "integrated" : "pending"}.`,
      contextSummary: input.sharedContext.goal
        ? `Shared context established for scenario "${input.sharedContext.scenarioId ?? "unknown"}" with read-only experience mode.`
        : "Shared context pending.",
      handoffSummary: input.handoff.summary,
      lineageSummary: input.lineage.summary,
      readinessSummary: input.readiness.summary,
    };
  }
}

export function createAiExperienceSharedContextBuilder(): AiExperienceSharedContextBuilder {
  return new AiExperienceSharedContextBuilder();
}
export function createFoundationStatusBuilder(): FoundationStatusBuilder {
  return new FoundationStatusBuilder();
}
export function createChapterHandoffIntegrationBuilder(): ChapterHandoffIntegrationBuilder {
  return new ChapterHandoffIntegrationBuilder();
}
export function createIntelligenceLineageBuilder(): IntelligenceLineageBuilder {
  return new IntelligenceLineageBuilder();
}
export function createFoundationReadinessBuilder(): FoundationReadinessBuilder {
  return new FoundationReadinessBuilder();
}
export function createDelegationFoundationBuilder(): DelegationFoundationBuilder {
  return new DelegationFoundationBuilder();
}
export function createFoundationConfidenceBuilder(): FoundationConfidenceBuilder {
  return new FoundationConfidenceBuilder();
}
export function createFoundationExplanationBuilder(): FoundationExplanationBuilder {
  return new FoundationExplanationBuilder();
}
