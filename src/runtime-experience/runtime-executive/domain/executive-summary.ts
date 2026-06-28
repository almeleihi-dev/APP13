import type { ExecutiveOverview } from "./executive-overview.js";
import type { ExecutiveKpis } from "./executive-kpis.js";
import type { ExecutiveInsight } from "./executive-insights.js";

export interface ExecutiveSummary {
  overview: ExecutiveOverview;
  kpis: ExecutiveKpis;
  insightCount: number;
  highPriorityInsightCount: number;
  readOnly: true;
  delegated: true;
}

export function buildExecutiveSummary(input: {
  overview: ExecutiveOverview;
  kpis: ExecutiveKpis;
  insights: ExecutiveInsight[];
}): ExecutiveSummary {
  return {
    overview: input.overview,
    kpis: input.kpis,
    insightCount: input.insights.length,
    highPriorityInsightCount: input.insights.filter((i) => i.priority === "high").length,
    readOnly: true,
    delegated: true,
  };
}
