import type { RuntimeCertification } from "./runtime-certification.js";
import type { RuntimeStatistics } from "./runtime-statistics.js";
import type { RuntimeArchitectureSummary } from "./runtime-architecture-summary.js";
import type { RuntimeExecutiveSummary } from "./runtime-executive-summary.js";
import type { RuntimeCompletionOverview } from "./runtime-completion-report.js";
import type { RuntimeCompletionCheck } from "./runtime-completion-checks.js";
import { RUNTIME_COMPLETION_VERSION, RUNTIME_COMPLETION_FIXED_TIMESTAMP } from "./runtime-completion.js";

export interface RuntimeCompletionReport {
  version: typeof RUNTIME_COMPLETION_VERSION;
  generatedAt: typeof RUNTIME_COMPLETION_FIXED_TIMESTAMP;
  overview: RuntimeCompletionOverview;
  certification: RuntimeCertification;
  statistics: RuntimeStatistics;
  architecture: RuntimeArchitectureSummary;
  executiveSummary: RuntimeExecutiveSummary;
  checks: RuntimeCompletionCheck[];
  dependencySummary: {
    allModulesValidated: boolean;
    validatedModuleCount: number;
    totalModuleCount: number;
  };
  testSummary: {
    testSuiteCount: number;
    chapterRange: string;
  };
  verificationSummary: {
    verificationScriptCount: number;
    chapterRange: string;
  };
  readOnly: true;
  delegated: true;
}

export function buildRuntimeCompletionReport(input: {
  overview: RuntimeCompletionOverview;
  certification: RuntimeCertification;
  statistics: RuntimeStatistics;
  architecture: RuntimeArchitectureSummary;
  executiveSummary: RuntimeExecutiveSummary;
  checks: RuntimeCompletionCheck[];
}): RuntimeCompletionReport {
  return {
    version: RUNTIME_COMPLETION_VERSION,
    generatedAt: RUNTIME_COMPLETION_FIXED_TIMESTAMP,
    overview: input.overview,
    certification: input.certification,
    statistics: input.statistics,
    architecture: input.architecture,
    executiveSummary: input.executiveSummary,
    checks: input.checks,
    dependencySummary: {
      allModulesValidated: input.overview.validatedCount === input.overview.moduleCount,
      validatedModuleCount: input.overview.validatedCount,
      totalModuleCount: input.overview.moduleCount,
    },
    testSummary: {
      testSuiteCount: input.statistics.testSuiteCount,
      chapterRange: input.statistics.chapterRange,
    },
    verificationSummary: {
      verificationScriptCount: input.statistics.verificationScriptCount,
      chapterRange: input.statistics.chapterRange,
    },
    readOnly: true,
    delegated: true,
  };
}
