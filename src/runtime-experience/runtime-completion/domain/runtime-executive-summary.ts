import type { RuntimeCertification } from "./runtime-certification.js";
import type { RuntimeStatistics } from "./runtime-statistics.js";
import type { RuntimeCompletionOverview } from "./runtime-completion-report.js";

export interface RuntimeExecutiveSummary {
  chapter: "CH3";
  title: "AN ACT Runtime Experience — Executive Summary";
  completionPercentage: number;
  runtimeChapter3Completed: boolean;
  runtimeCertified: boolean;
  officialExecutiveLaunchApproval: boolean;
  validatedModuleCount: number;
  totalModuleCount: number;
  handoffTarget: "CH4";
  certification: RuntimeCertification;
  statistics: RuntimeStatistics;
  overview: RuntimeCompletionOverview;
  readOnly: true;
  delegated: true;
}

export function buildRuntimeExecutiveSummary(input: {
  overview: RuntimeCompletionOverview;
  certification: RuntimeCertification;
  statistics: RuntimeStatistics;
}): RuntimeExecutiveSummary {
  return {
    chapter: "CH3",
    title: "AN ACT Runtime Experience — Executive Summary",
    completionPercentage: input.overview.completionPercentage,
    runtimeChapter3Completed: input.certification.runtimeChapter3Completed,
    runtimeCertified: input.certification.runtimeCertified,
    officialExecutiveLaunchApproval: input.certification.officialExecutiveLaunchApproval,
    validatedModuleCount: input.overview.validatedCount,
    totalModuleCount: input.overview.moduleCount,
    handoffTarget: "CH4",
    certification: input.certification,
    statistics: input.statistics,
    overview: input.overview,
    readOnly: true,
    delegated: true,
  };
}
