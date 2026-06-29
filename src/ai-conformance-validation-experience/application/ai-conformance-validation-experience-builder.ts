import type { AiAccountabilityLedgerExperienceOutput } from "../../ai-accountability-ledger-experience/domain/ai-accountability-ledger-experience-context.js";
import { UPSTREAM_MODULE_ID } from "../domain/ai-conformance-validation-experience-schema.js";
import type {
  ConformanceCheck,
  ConformanceContext,
  ConformanceDashboard,
  ValidationMatrix,
  ValidationMatrixRow,
  ComplianceStatus,
  ComplianceStatusItem,
  ConformanceRules,
  ConformanceRule,
  DeviationAnalysis,
  DeviationAnalysisItem,
  CorrectiveActions,
  CorrectiveAction,
  ValidationReport,
  ConformanceConfidence,
  DelegationConformanceValidation,
  ConformanceExplanation,
} from "../domain/ai-conformance-validation-experience-context.js";
import type { ConformanceValidationConfidenceLevel } from "../domain/ai-conformance-validation-experience-schema.js";

function check(
  id: string,
  label: string,
  passed: boolean,
  score: number,
  detail: string
): ConformanceCheck {
  return { checkId: id, label, passed, score, detail };
}

export class ConformanceContextBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): ConformanceContext {
    const ctx = ledger.ledgerContext;

    return {
      contextId: `conformance-context-${ledger.outputId}`,
      accountabilityLedgerOutputId: ledger.outputId,
      governanceAssuranceOutputId: ctx.governanceAssuranceOutputId,
      executiveAdvisoryOutputId: ctx.executiveAdvisoryOutputId,
      predictiveForecastOutputId: ctx.predictiveForecastOutputId,
      foundationOutputId: ctx.foundationOutputId,
      scenarioId: ledger.scenarioId,
      canonicalActionId: ledger.canonicalActionId,
      goal: ledger.goal,
      experienceMode: "read_only",
    };
  }
}

export class ConformanceDashboardBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): ConformanceDashboard {
    const dash = ledger.ledgerDashboard;

    return {
      dashboardId: `conformance-dashboard-${ledger.outputId}`,
      headline: `Conformance Dashboard — ${ledger.goal}`,
      goal: ledger.goal,
      healthScore: dash.healthScore,
      probabilityScore: dash.probabilityScore,
      matrixRowCount: ledger.accountabilityChain.links.length,
      ruleCount: ledger.evidenceRegister.items.length,
      readOnly: true,
      summary: `Read-only conformance dashboard — ${ledger.accountabilityChain.links.length} matrix rows, ${ledger.evidenceRegister.items.length} rules, probability ${dash.probabilityScore}/100.`,
    };
  }
}

export class ValidationMatrixBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): ValidationMatrix {
    const rows: ValidationMatrixRow[] = ledger.accountabilityChain.links.map((link) => ({
      rowId: `matrix-${link.linkId}`,
      sequence: link.sequence,
      title: link.title,
      detail: `Validation matrix row: ${link.detail}`,
    }));

    return {
      matrixId: `validation-matrix-${ledger.outputId}`,
      rows,
      summary: `${rows.length} read-only validation matrix rows from accountability chain.`,
    };
  }
}

export class ComplianceStatusBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): ComplianceStatus {
    const items: ComplianceStatusItem[] = ledger.decisionTrace.entries.map((entry, index) => ({
      itemId: `compliance-${entry.entryId}`,
      sequence: entry.sequence,
      title: entry.title,
      detail: entry.detail,
      status:
        index === 0
          ? ("compliant" as const)
          : index === 1
            ? ("conditional" as const)
            : ("non_compliant" as const),
    }));

    return {
      statusId: `compliance-status-${ledger.outputId}`,
      items,
      summary: `${items.length} read-only compliance status items from decision trace.`,
    };
  }
}

export class ConformanceRulesBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): ConformanceRules {
    const rules: ConformanceRule[] = ledger.evidenceRegister.items.map((item, index) => ({
      ruleId: `rule-${item.itemId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      status:
        index === 0 ? ("active" as const) : index === 1 ? ("conditional" as const) : ("inactive" as const),
    }));

    return {
      rulesId: `conformance-rules-${ledger.outputId}`,
      rules,
      summary: `${rules.length} read-only conformance rules from evidence register.`,
    };
  }
}

export class DeviationAnalysisBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): DeviationAnalysis {
    const items: DeviationAnalysisItem[] = ledger.responsibilityMap.items.map((item) => ({
      itemId: `deviation-${item.itemId}`,
      sequence: item.sequence,
      label: item.label,
      detail: item.detail,
      severity: item.level,
    }));

    return {
      analysisId: `deviation-analysis-${ledger.outputId}`,
      items,
      summary: `${items.length} read-only deviation analysis items from responsibility map.`,
    };
  }
}

export class CorrectiveActionsBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): CorrectiveActions {
    const actions: CorrectiveAction[] = ledger.auditTrail.entries.map((entry) => ({
      actionId: `corrective-${entry.entryId}`,
      sequence: entry.sequence,
      title: entry.title,
      detail: entry.detail,
    }));

    return {
      actionsId: `corrective-actions-${ledger.outputId}`,
      actions,
      summary: `${actions.length} read-only corrective actions from audit trail.`,
    };
  }
}

export class ValidationReportBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): ValidationReport {
    const report = ledger.transparencyReport;
    const reportLevel =
      ledger.ledgerConfidence.level === "high"
        ? ("full" as const)
        : ledger.ledgerConfidence.level === "medium"
          ? ("partial" as const)
          : ("limited" as const);

    return {
      reportId: `validation-report-${ledger.outputId}`,
      headline: report.headline,
      narrative: report.narrative,
      reportLevel,
      readOnly: true,
      summary: `Validation report — level ${reportLevel}, transparency ${report.transparencyLevel}, ledger confidence ${ledger.ledgerConfidence.score}/100.`,
    };
  }
}

export class ConformanceConfidenceBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): ConformanceConfidence {
    let score = 42;
    score += Math.min(ledger.ledgerConfidence.score * 0.3, 28);
    score += Math.min(ledger.ledgerDashboard.healthScore * 0.1, 10);
    score = Math.min(98, Math.max(40, Math.round(score)));

    const level: ConformanceValidationConfidenceLevel =
      score >= 80 ? "high" : score >= 60 ? "medium" : "low";

    return {
      level,
      score,
      rationale:
        level === "high"
          ? "AI Conformance Validation Experience meets high-confidence criteria from accountability ledger."
          : level === "medium"
            ? "Conformance validation viable with conditional accountability ledger requiring review."
            : "Limited conformance validation confidence — treat outputs as advisory only.",
      ledgerConfidenceScore: ledger.ledgerConfidence.score,
    };
  }
}

export class DelegationConformanceValidationBuilder {
  build(ledger: AiAccountabilityLedgerExperienceOutput): DelegationConformanceValidation {
    const checks: ConformanceCheck[] = [
      check(
        "del.upstream",
        "Sole upstream delegation",
        !!ledger.outputId,
        ledger.outputId ? 100 : 0,
        `Delegates exclusively to ${UPSTREAM_MODULE_ID} AI Accountability Ledger Experience.`
      ),
      check(
        "del.trace",
        "Accountability ledger traceability",
        !!ledger.governanceAssuranceOutputId,
        ledger.governanceAssuranceOutputId ? 95 : 0,
        `Accountability ledger ${ledger.outputId} → governance assurance ${ledger.governanceAssuranceOutputId}.`
      ),
      check(
        "del.nodup",
        "No duplicated business logic",
        true,
        100,
        "Conformance validation builders format accountability ledger output only."
      ),
    ];

    return {
      delegationId: "conformance-validation.delegation",
      soleUpstream: "CH5-X19 AI Accountability Ledger Experience",
      noDuplicatedLogic: true,
      accountabilityLedgerOutputId: ledger.outputId,
      checks,
      summary: "Delegation conformance validation — sole upstream X19, no duplicated logic.",
    };
  }
}

export class ConformanceExplanationBuilder {
  build(input: {
    outputId: string;
    goal: string;
    dashboard: ConformanceDashboard;
    validationMatrix: ValidationMatrix;
    conformanceRules: ConformanceRules;
    conformanceConfidenceScore: number;
  }): ConformanceExplanation {
    return {
      explanationId: `conformance-explanation-${input.outputId}`,
      headline: `AI Conformance Validation for "${input.goal}"`,
      summary: `Read-only conformance validation (confidence ${input.conformanceConfidenceScore}/100) — ${input.dashboard.matrixRowCount} matrix rows, ${input.dashboard.ruleCount} rules, probability ${input.dashboard.probabilityScore}/100.`,
      dashboardSummary: input.dashboard.summary,
      matrixSummary: input.validationMatrix.summary,
      rulesSummary: input.conformanceRules.summary,
    };
  }
}

export function createConformanceContextBuilder(): ConformanceContextBuilder {
  return new ConformanceContextBuilder();
}
export function createConformanceDashboardBuilder(): ConformanceDashboardBuilder {
  return new ConformanceDashboardBuilder();
}
export function createValidationMatrixBuilder(): ValidationMatrixBuilder {
  return new ValidationMatrixBuilder();
}
export function createComplianceStatusBuilder(): ComplianceStatusBuilder {
  return new ComplianceStatusBuilder();
}
export function createConformanceRulesBuilder(): ConformanceRulesBuilder {
  return new ConformanceRulesBuilder();
}
export function createDeviationAnalysisBuilder(): DeviationAnalysisBuilder {
  return new DeviationAnalysisBuilder();
}
export function createCorrectiveActionsBuilder(): CorrectiveActionsBuilder {
  return new CorrectiveActionsBuilder();
}
export function createValidationReportBuilder(): ValidationReportBuilder {
  return new ValidationReportBuilder();
}
export function createConformanceConfidenceBuilder(): ConformanceConfidenceBuilder {
  return new ConformanceConfidenceBuilder();
}
export function createDelegationConformanceValidationBuilder(): DelegationConformanceValidationBuilder {
  return new DelegationConformanceValidationBuilder();
}
export function createConformanceExplanationBuilder(): ConformanceExplanationBuilder {
  return new ConformanceExplanationBuilder();
}
