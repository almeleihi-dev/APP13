export interface ExecutiveKpi {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend: "stable" | "up" | "down";
}

export interface ExecutiveKpis {
  mvpReadinessPercentage: number;
  releaseQualityScore: number;
  operationalModuleCount: number;
  totalModuleCount: number;
  certificationStatus: string;
  overallHealthStatus: string;
  executiveReadinessScore: number;
  kpis: ExecutiveKpi[];
}

export function calculateExecutiveReadinessScore(input: {
  mvpReadinessPercentage: number;
  releaseQualityScore: number;
  operationalRatio: number;
}): number {
  return Math.round(
    (input.mvpReadinessPercentage + input.releaseQualityScore + input.operationalRatio * 100) / 3
  );
}

export function buildExecutiveKpis(input: {
  mvpReadinessPercentage: number;
  releaseQualityScore: number;
  operationalModuleCount: number;
  totalModuleCount: number;
  certificationStatus: string;
  overallHealthStatus: string;
}): ExecutiveKpis {
  const operationalRatio =
    input.totalModuleCount > 0 ? input.operationalModuleCount / input.totalModuleCount : 0;
  const executiveReadinessScore = calculateExecutiveReadinessScore({
    mvpReadinessPercentage: input.mvpReadinessPercentage,
    releaseQualityScore: input.releaseQualityScore,
    operationalRatio,
  });
  return {
    mvpReadinessPercentage: input.mvpReadinessPercentage,
    releaseQualityScore: input.releaseQualityScore,
    operationalModuleCount: input.operationalModuleCount,
    totalModuleCount: input.totalModuleCount,
    certificationStatus: input.certificationStatus,
    overallHealthStatus: input.overallHealthStatus,
    executiveReadinessScore,
    kpis: [
      { id: "mvp-readiness", label: "MVP Readiness", value: input.mvpReadinessPercentage, unit: "%", trend: "stable" },
      { id: "release-quality", label: "Release Quality", value: input.releaseQualityScore, unit: "%", trend: "stable" },
      { id: "operational-modules", label: "Operational Modules", value: input.operationalModuleCount, trend: "stable" },
      { id: "executive-readiness", label: "Executive Readiness", value: executiveReadinessScore, unit: "%", trend: "stable" },
      { id: "certification", label: "Certification", value: input.certificationStatus, trend: "stable" },
      { id: "health-status", label: "Health Status", value: input.overallHealthStatus, trend: "stable" },
    ],
  };
}
