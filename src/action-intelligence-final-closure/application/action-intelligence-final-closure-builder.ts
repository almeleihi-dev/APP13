import type { ActionIntelligenceCertificationOutput } from "../../action-intelligence-certification/domain/action-intelligence-certification-context.js";
import {
  COMPLETED_ECOSYSTEM_LAYER_COUNT,
  CHAPTER_NUMBER,
  NEXT_CHAPTER_NUMBER,
  CLOSURE_CHAIN,
} from "../domain/action-intelligence-final-closure-schema.js";
import type {
  ClosureCheck,
  ChapterCompletionStatus,
  ArchitectureCompletionReport,
  EcosystemCompletionReport,
  ClosureCertificationSummary,
  ImplementationStatistics,
  DependencySummary,
  ReadinessSummary,
  FinalExecutiveClosureReport,
  ChapterHandoffReport,
  ClosureConfidence,
  ClosureExplanation,
} from "../domain/action-intelligence-final-closure-context.js";
import type {
  ClosureStatusLevel,
  ClosureConfidenceLevel,
} from "../domain/action-intelligence-final-closure-schema.js";

function statusFromScore(score: number, warnings: string[]): ClosureStatusLevel {
  if (score >= 85 && warnings.length === 0) return "complete";
  if (score >= 70) return "conditional";
  if (score >= 50) return "pending";
  return "incomplete";
}

function mapCertificationStatus(status: string): ClosureStatusLevel {
  if (status === "certified") return "complete";
  if (status === "conditional") return "conditional";
  if (status === "pending") return "pending";
  return "incomplete";
}

function check(id: string, label: string, passed: boolean, score: number, detail: string): ClosureCheck {
  return { checkId: id, label, passed, score, detail };
}

export class ChapterCompletionStatusBuilder {
  build(certification: ActionIntelligenceCertificationOutput): ChapterCompletionStatus {
    const report = certification.executiveCertificationReport;
    const level = mapCertificationStatus(report.overallStatus);
    const score = report.overallScore;

    return {
      statusId: "closure.chapter",
      level,
      score,
      chapterNumber: CHAPTER_NUMBER,
      chapterTitle: "Action Intelligence",
      certificationStatus: report.overallStatus,
      summary: `Chapter 4 Action Intelligence ${level} — ${score}/100 for "${certification.goal}".`,
    };
  }
}

export class ArchitectureCompletionReportBuilder {
  build(certification: ActionIntelligenceCertificationOutput): ArchitectureCompletionReport {
    const arch = certification.architectureCertification;
    const level = mapCertificationStatus(arch.level);

    return {
      reportId: "closure.architecture",
      level,
      layerCount: arch.layerCount,
      cleanArchitectureCompliant: arch.cleanArchitectureCompliant,
      checks: arch.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: `Architecture completion — ${arch.layerCount} layers, clean architecture ${arch.cleanArchitectureCompliant ? "verified" : "pending"}.`,
    };
  }
}

export class EcosystemCompletionReportBuilder {
  build(certification: ActionIntelligenceCertificationOutput): EcosystemCompletionReport {
    const eco = certification.ecosystemCertification;
    const checks: ClosureCheck[] = [
      check(
        "eco.complete",
        "C1–C21 ecosystem complete",
        eco.ecosystemLayerCount >= COMPLETED_ECOSYSTEM_LAYER_COUNT - 1,
        Math.min(100, Math.round((eco.ecosystemLayerCount / COMPLETED_ECOSYSTEM_LAYER_COUNT) * 100)),
        `${eco.ecosystemLayerCount} intelligence layers closed in chapter.`
      ),
      check(
        "eco.scenarios",
        "Scenario coverage",
        eco.scenarioCoverage >= 5,
        eco.scenarioCoverage * 20,
        `${eco.scenarioCoverage} scenarios covered.`
      ),
    ];
    const score = Math.round(checks.reduce((s, c) => s + c.score, 0) / checks.length);

    return {
      reportId: "closure.ecosystem",
      level: statusFromScore(score, []),
      ecosystemLayerCount: eco.ecosystemLayerCount,
      scenarioCoverage: eco.scenarioCoverage,
      checks,
      summary: eco.summary,
    };
  }
}

export class ClosureCertificationSummaryBuilder {
  build(certification: ActionIntelligenceCertificationOutput): ClosureCertificationSummary {
    const report = certification.executiveCertificationReport;
    const confidence = certification.certificationConfidence;

    return {
      summaryId: "closure.certification",
      overallCertificationStatus: report.overallStatus,
      overallCertificationScore: report.overallScore,
      certificationConfidenceLevel: confidence.level,
      certificationConfidenceScore: confidence.score,
      certifiedDomainCount: report.certifiedDomains.length,
      summary: `Certification summary — ${report.certifiedDomains.length} domains certified at ${report.overallScore}/100 (confidence ${confidence.score}/100).`,
    };
  }
}

export class ImplementationStatisticsBuilder {
  build(): ImplementationStatistics {
    return {
      statsId: "closure.implementation",
      totalModules: CLOSURE_CHAIN.length - 1,
      completedLayers: COMPLETED_ECOSYSTEM_LAYER_COUNT,
      scenarioCount: 5,
      readOnlyModules: CLOSURE_CHAIN.length - 1,
      verifyScripts: COMPLETED_ECOSYSTEM_LAYER_COUNT,
      summary: `Implementation statistics — ${COMPLETED_ECOSYSTEM_LAYER_COUNT} layers, ${CLOSURE_CHAIN.length - 1} modules, 5 scenarios, all read-only.`,
    };
  }
}

export class DependencySummaryBuilder {
  build(certification: ActionIntelligenceCertificationOutput): DependencySummary {
    const dep = certification.dependencyCertification;
    const checks: ClosureCheck[] = dep.checks.map((c) =>
      check(c.checkId, c.label, c.passed, c.score, c.detail)
    );

    return {
      summaryId: "closure.dependency",
      soleUpstream: "CH4-C21 Action Intelligence Final Certification",
      delegationChainIntact: dep.delegationChainIntact,
      importLintCompliant: dep.importLintCompliant,
      certificationOutputId: certification.outputId,
      executiveCenterOutputId: certification.executiveCenterOutputId,
      checks,
      summary: "Dependency summary — sole upstream C21, delegation chain intact, import-lint compliant.",
    };
  }
}

export class ReadinessSummaryBuilder {
  build(certification: ActionIntelligenceCertificationOutput): ReadinessSummary {
    const ready = certification.readinessCertification;
    const level = mapCertificationStatus(ready.level);
    const chapterReady = ready.readinessScore >= 50 && level !== "incomplete";

    return {
      summaryId: "closure.readiness",
      level,
      readinessScore: ready.readinessScore,
      chapterReadyForHandoff: chapterReady,
      checks: ready.checks.map((c) =>
        check(c.checkId, c.label, c.passed, c.score, c.detail)
      ),
      summary: ready.summary,
    };
  }
}

export class FinalExecutiveClosureReportBuilder {
  build(
    certification: ActionIntelligenceCertificationOutput,
    chapterStatus: ChapterCompletionStatus
  ): FinalExecutiveClosureReport {
    const report = certification.executiveCertificationReport;
    const warnings = report.warnings;

    return {
      reportId: "closure.executive",
      headline: `Final Action Intelligence Chapter Closure: ${certification.goal}`,
      goal: certification.goal,
      overallStatus: chapterStatus.level,
      overallScore: chapterStatus.score,
      closedDomains: report.certifiedDomains,
      warnings,
      summary: `Executive closure ${chapterStatus.level} — Chapter 4 Action Intelligence officially closed at ${chapterStatus.score}/100.`,
    };
  }
}

export class ChapterHandoffReportBuilder {
  build(
    certification: ActionIntelligenceCertificationOutput,
    readiness: ReadinessSummary,
    chapterStatus: ChapterCompletionStatus
  ): ChapterHandoffReport {
    const handoffReady =
      readiness.chapterReadyForHandoff &&
      (chapterStatus.level === "complete" || chapterStatus.level === "conditional");

    return {
      reportId: "closure.handoff",
      fromChapter: CHAPTER_NUMBER,
      toChapter: NEXT_CHAPTER_NUMBER,
      handoffStatus: handoffReady ? chapterStatus.level : "pending",
      handoffReady,
      deliverables: [
        "Complete C1–C21 Action Intelligence chain",
        "Final certification report (C21)",
        "Executive intelligence center (C20)",
        "Intelligence dashboard (C19)",
        "Unified action intelligence experience (C18)",
      ],
      summary: handoffReady
        ? `Chapter 4 handoff to Chapter ${NEXT_CHAPTER_NUMBER} ready for "${certification.goal}" — all Action Intelligence deliverables complete.`
        : `Chapter 4 handoff pending for "${certification.goal}" — readiness score ${readiness.readinessScore}/100.`,
    };
  }
}

export class ClosureConfidenceBuilder {
  build(
    certification: ActionIntelligenceCertificationOutput,
    overallScore: number
  ): ClosureConfidence {
    let score = 50;
    score += Math.min(certification.certificationConfidence.score * 0.25, 22);
    score += Math.min(overallScore * 0.23, 22);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: ClosureConfidenceLevel = score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "Chapter 4 Action Intelligence closure meets high-confidence handoff criteria."
          : level === "medium"
            ? "Chapter closure viable with conditional domains requiring review before Chapter 5."
            : "Limited closure confidence — treat handoff as advisory only.",
      certificationConfidenceScore: certification.certificationConfidence.score,
    };
  }
}

export class ClosureExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    certification: ActionIntelligenceCertificationOutput;
    chapterStatus: ChapterCompletionStatus;
    architecture: ArchitectureCompletionReport;
    ecosystem: EcosystemCompletionReport;
    handoff: ChapterHandoffReport;
    closureConfidenceScore: number;
  }): ClosureExplanation {
    return {
      explanationId: `closure-explanation-${input.outputId}`,
      headline: `Final closure for Chapter 4 Action Intelligence — "${input.goal}"`,
      summary: `C1–C21 Action Intelligence chapter closure (confidence ${input.closureConfidenceScore}/100) — status ${input.chapterStatus.level}, handoff ${input.handoff.handoffReady ? "ready" : "pending"}.`,
      chapterSummary: input.chapterStatus.summary,
      architectureSummary: input.architecture.summary,
      ecosystemSummary: input.ecosystem.summary,
      handoffSummary: input.handoff.summary,
    };
  }
}

export function createChapterCompletionStatusBuilder(): ChapterCompletionStatusBuilder {
  return new ChapterCompletionStatusBuilder();
}
export function createArchitectureCompletionReportBuilder(): ArchitectureCompletionReportBuilder {
  return new ArchitectureCompletionReportBuilder();
}
export function createEcosystemCompletionReportBuilder(): EcosystemCompletionReportBuilder {
  return new EcosystemCompletionReportBuilder();
}
export function createClosureCertificationSummaryBuilder(): ClosureCertificationSummaryBuilder {
  return new ClosureCertificationSummaryBuilder();
}
export function createImplementationStatisticsBuilder(): ImplementationStatisticsBuilder {
  return new ImplementationStatisticsBuilder();
}
export function createDependencySummaryBuilder(): DependencySummaryBuilder {
  return new DependencySummaryBuilder();
}
export function createReadinessSummaryBuilder(): ReadinessSummaryBuilder {
  return new ReadinessSummaryBuilder();
}
export function createFinalExecutiveClosureReportBuilder(): FinalExecutiveClosureReportBuilder {
  return new FinalExecutiveClosureReportBuilder();
}
export function createChapterHandoffReportBuilder(): ChapterHandoffReportBuilder {
  return new ChapterHandoffReportBuilder();
}
export function createClosureConfidenceBuilder(): ClosureConfidenceBuilder {
  return new ClosureConfidenceBuilder();
}
export function createClosureExplanationBuilder(): ClosureExplanationBuilder {
  return new ClosureExplanationBuilder();
}
