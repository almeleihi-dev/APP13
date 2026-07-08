import type { AiConformanceValidationExperienceOutput } from "../../ai-conformance-validation-experience/domain/ai-conformance-validation-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-operational-oversight-experience-schema.js";
import type {
  OversightCheck,
  OversightContext,
  OversightDashboard,
  OperationalHealth,
  OversightMatrix,
  OversightMatrixRow,
  ComplianceMonitor,
  ComplianceMonitorItem,
  ExceptionMonitor,
  ExceptionMonitorItem,
  InterventionPlan,
  InterventionPlanItem,
  OversightReport,
  OversightConfidence,
  DelegationOperationalOversight,
  OversightExplanation,
} from "../domain/ai-operational-oversight-experience-context.js";
import type { OperationalOversightConfidenceLevel } from "../domain/ai-operational-oversight-experience-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): OversightCheck {
  return { checkId: id, label, passed, score, detail };
}

export class OversightContextBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): OversightContext {
    const ctx = conformance.conformanceContext;

    return {
      contextId: `oversight-context-${conformance.outputId}`,
      conformanceValidationOutputId: conformance.outputId,
      accountabilityLedgerOutputId: ctx.accountabilityLedgerOutputId,
      governanceAssuranceOutputId: ctx.governanceAssuranceOutputId,
      executiveAdvisoryOutputId: ctx.executiveAdvisoryOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: conformance.scenarioId,
      canonicalActionId: conformance.canonicalActionId,
      goal: conformance.goal,
      experienceMode: "read_only",
    };
  }
}

export class OversightDashboardBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): OversightDashboard {
    const dash = conformance.conformanceDashboard;

    return {
      dashboardId: `oversight-dashboard-${conformance.outputId}`,
      headline: `Oversight Dashboard — ${conformance.goal}`,
      goal: conformance.goal,
      healthScore: dash.healthScore,
      probabilityScore: dash.probabilityScore,
      matrixRowCount: dash.matrixRowCount,
      monitorCount: conformance.complianceStatus.items.length,
      readOnly: true,
      summary: `Read-only operational oversight dashboard — ${dash.matrixRowCount} matrix rows, ${conformance.complianceStatus.items.length} compliance monitors, probability ${dash.probabilityScore}/100.`,
    };
  }
}

export class OperationalHealthBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): OperationalHealth {
    const dash = conformance.conformanceDashboard;
    const status: OperationalHealth["status"] =
      dash.healthScore >= 70 ? "healthy" : dash.healthScore >= 50 ? "degraded" : "critical";

    return {
      healthId: `operational-health-${conformance.outputId}`,
      headline: `Operational Health — ${conformance.goal}`,
      healthScore: dash.healthScore,
      probabilityScore: dash.probabilityScore,
      status,
      readOnly: true,
      summary: `Operational health ${status} — health score ${dash.healthScore}/100, probability ${dash.probabilityScore}/100.`,
    };
  }
}

export class OversightMatrixBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): OversightMatrix {
    const rows: OversightMatrixRow[] = conformance.validationMatrix.rows.map((row) => ({
      rowId: `oversight-${row.rowId}`,
      sequence: row.sequence,
      title: row.title,
      detail: `Oversight matrix row: ${row.detail}`,
    }));

    return {
      matrixId: `oversight-matrix-${conformance.outputId}`,
      rows,
      summary: `${rows.length} read-only oversight matrix rows from conformance validation matrix.`,
    };
  }
}

export class ComplianceMonitorBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): ComplianceMonitor {
    const items: ComplianceMonitorItem[] = conformance.complianceStatus.items.map((item) => ({
      itemId: `monitor-${item.itemId}`,
      sequence: item.sequence,
      title: item.title,
      detail: item.detail,
      status: item.status,
    }));

    return {
      monitorId: `compliance-monitor-${conformance.outputId}`,
      items,
      summary: `${items.length} read-only compliance monitor items from conformance compliance status.`,
    };
  }
}

export class ExceptionMonitorBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): ExceptionMonitor {
    const items: ExceptionMonitorItem[] = conformance.deviationAnalysis.items.map((item) => ({
      itemId: `exception-${item.itemId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      severity: item.severity,
    }));

    return {
      monitorId: `exception-monitor-${conformance.outputId}`,
      items,
      summary: `${items.length} read-only exception monitor items from conformance deviation analysis.`,
    };
  }
}

export class InterventionPlanBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): InterventionPlan {
    const items: InterventionPlanItem[] = conformance.correctiveActions.actions.map((action) => ({
      itemId: `intervention-${action.actionId}`,
      sequence: action.sequence,
      title: action.title,
      detail: action.detail,
    }));

    return {
      planId: `intervention-plan-${conformance.outputId}`,
      items,
      summary: `${items.length} read-only intervention plan items from conformance corrective actions.`,
    };
  }
}

export class OversightReportBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): OversightReport {
    const report = conformance.validationReport;

    return {
      reportId: `oversight-report-${conformance.outputId}`,
      headline: report.headline,
      narrative: report.narrative,
      reportLevel: report.reportLevel,
      readOnly: true,
      summary: `Oversight report — level ${report.reportLevel}, conformance confidence ${conformance.conformanceConfidence.score}/100.`,
    };
  }
}

export class OversightConfidenceBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): OversightConfidence {
    let score = 42;
    score += Math.min(conformance.conformanceConfidence.score * 0.3, 28);
    score += Math.min(conformance.conformanceDashboard.healthScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: OperationalOversightConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Operational Oversight Experience meets high-confidence criteria from conformance validation."
          : level === "medium"
            ? "Operational oversight viable with conditional conformance validation requiring review."
            : "Limited operational oversight confidence — treat outputs as advisory only.",
      conformanceConfidenceScore: conformance.conformanceConfidence.score,
    };
  }
}

export class DelegationOperationalOversightBuilder {
  build(conformance: AiConformanceValidationExperienceOutput): DelegationOperationalOversight {
    const checks: OversightCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!conformance.outputId,
        conformance.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Conformance Validation Experience.`
      ),
      check(
        "del.trace",
        "Conformance validation traceability",
        !!conformance.accountabilityLedgerOutputId,
        conformance.accountabilityLedgerOutputId ? 95 : 0,
        `Conformance validation ${conformance.outputId} → accountability ledger ${conformance.accountabilityLedgerOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Operational oversight builders format conformance validation output only."
      ),
    ];

    return {
      delegationId: "operational-oversight.delegation",
      soleUpstream: "CH5-X20 AI Conformance Validation Experience",
      noDuplicatedLogic: true,
      conformanceValidationOutputId: conformance.outputId,
      checks,
      summary: "Delegation operational oversight — sole upstream X20, no duplicated logic.",
    };
  }
}

export class OversightExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: OversightDashboard;
    oversightMatrix: OversightMatrix;
    complianceMonitor: ComplianceMonitor;
    oversightConfidenceScore: number;
  }): OversightExplanation {
    return {
      explanationId: `oversight-explanation-${input.outputId}`,
      headline: `AI Operational Oversight for "${input.goal}"`,
      summary: `Read-only operational oversight (confidence ${input.oversightConfidenceScore}/100) — ${input.dashboard.matrixRowCount} matrix rows, ${input.dashboard.monitorCount} compliance monitors, probability ${input.dashboard.probabilityScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      matrixSummary: input.oversightMatrix.summary,
      complianceSummary: input.complianceMonitor.summary,
    };
  }
}

export function createOversightContextBuilder(): OversightContextBuilder {
  return new OversightContextBuilder();
}
export function createOversightDashboardBuilder(): OversightDashboardBuilder {
  return new OversightDashboardBuilder();
}
export function createOperationalHealthBuilder(): OperationalHealthBuilder {
  return new OperationalHealthBuilder();
}
export function createOversightMatrixBuilder(): OversightMatrixBuilder {
  return new OversightMatrixBuilder();
}
export function createComplianceMonitorBuilder(): ComplianceMonitorBuilder {
  return new ComplianceMonitorBuilder();
}
export function createExceptionMonitorBuilder(): ExceptionMonitorBuilder {
  return new ExceptionMonitorBuilder();
}
export function createInterventionPlanBuilder(): InterventionPlanBuilder {
  return new InterventionPlanBuilder();
}
export function createOversightReportBuilder(): OversightReportBuilder {
  return new OversightReportBuilder();
}
export function createOversightConfidenceBuilder(): OversightConfidenceBuilder {
  return new OversightConfidenceBuilder();
}
export function createDelegationOperationalOversightBuilder(): DelegationOperationalOversightBuilder {
  return new DelegationOperationalOversightBuilder();
}
export function createOversightExplanationBuilder(): OversightExplanationBuilder {
  return new OversightExplanationBuilder();
}
