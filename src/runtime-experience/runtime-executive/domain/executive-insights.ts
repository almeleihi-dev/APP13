export type ExecutiveInsightPriority = "high" | "medium" | "low";

export interface ExecutiveInsight {
  id: string;
  priority: ExecutiveInsightPriority;
  category: string;
  message: string;
  delegateModule: string;
  recommendedAction: string;
}

export function buildExecutiveInsights(input: {
  alerts: Array<{ severity: string; message: string; delegateModule: string }>;
  recommendations: string[];
  overallStatus: string;
  certified: boolean;
}): ExecutiveInsight[] {
  const insights: ExecutiveInsight[] = [];

  for (const alert of input.alerts.filter((a) => a.severity === "critical")) {
    insights.push({
      id: `insight-critical-${insights.length}`,
      priority: "high",
      category: "blocker",
      message: alert.message,
      delegateModule: alert.delegateModule,
      recommendedAction: "Resolve blocker before executive sign-off",
    });
  }

  for (const alert of input.alerts.filter((a) => a.severity === "warning")) {
    insights.push({
      id: `insight-warning-${insights.length}`,
      priority: "medium",
      category: "warning",
      message: alert.message,
      delegateModule: alert.delegateModule,
      recommendedAction: "Review warning and assign remediation owner",
    });
  }

  for (const rec of input.recommendations) {
    insights.push({
      id: `insight-rec-${insights.length}`,
      priority: "medium",
      category: "recommendation",
      message: rec,
      delegateModule: "CH3-X20",
      recommendedAction: "Incorporate into executive action plan",
    });
  }

  if (insights.length === 0 && input.certified) {
    insights.push({
      id: "insight-certified",
      priority: "low",
      category: "status",
      message: "Runtime certified and on-track for MVP implementation handoff",
      delegateModule: "CH3-X22",
      recommendedAction: "Proceed to MVP implementation planning",
    });
  } else if (insights.length === 0) {
    insights.push({
      id: "insight-operational",
      priority: "low",
      category: "status",
      message: `Runtime executive status: ${input.overallStatus}`,
      delegateModule: "CH3-X21",
      recommendedAction: "Continue monitoring via operations center",
    });
  }

  return insights;
}
