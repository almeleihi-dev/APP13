function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildExecutiveDashboardHome(executiveReadinessScore: number, moduleCount: number) {
  return {
    screenId: "executive-dashboard-home",
    readOnly: true,
    sections: [
      {
        id: "executive-home",
        label: "Executive Dashboard Home",
        components: [
          component("readiness", "core-ui-progress", { score: executiveReadinessScore, readOnly: true }, "Executive readiness"),
          component("modules", "core-ui-badge", { count: moduleCount, readOnly: true }, "Runtime modules"),
          component("read-only", "core-ui-chip", { readOnly: true, noRuntimeExecution: true }, "Read-only executive view"),
        ],
      },
    ],
  };
}

export function buildExecutiveDashboardScreen(overview: Record<string, unknown>) {
  return {
    screenId: "executive-dashboard-screen",
    readOnly: true,
    sections: [
      {
        id: "executive-dashboard",
        label: "Executive Dashboard",
        components: [component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Executive dashboard")],
      },
    ],
  };
}

export function buildExecutiveKpiScreen(kpis: Record<string, unknown>) {
  return {
    screenId: "executive-kpi-screen",
    readOnly: true,
    sections: [
      {
        id: "executive-kpis",
        label: "Executive KPIs",
        components: [component("kpis", "core-ui-progress", { ...kpis, readOnly: true }, "Executive KPIs")],
      },
    ],
  };
}

export function buildExecutiveInsightsScreen(insights: Array<{ id: string; priority: string; message: string }>) {
  return {
    screenId: "executive-insights-screen",
    readOnly: true,
    sections: [
      {
        id: "executive-insights",
        label: "Executive Insights",
        components: insights.map((insight) =>
          component(`insight-${insight.id}`, "core-ui-chip", { ...insight, readOnly: true }, insight.message)
        ),
      },
    ],
  };
}

export function buildExecutiveSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "executive-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "executive-summary",
        label: "Executive Summary",
        components: [component("summary", "core-ui-card", { ...summary, readOnly: true }, "Executive summary")],
      },
    ],
  };
}

export function buildExecutiveCommandBoard(
  items: Array<{ id: string; label: string; status: string; delegateModule: string; priority: string }>
) {
  return {
    screenId: "executive-command-board",
    readOnly: true,
    sections: [
      {
        id: "executive-command-board",
        label: "Executive Command Board",
        components: items.map((item) =>
          component(`command-${item.id}`, "core-ui-chip", { ...item, readOnly: true }, item.label)
        ),
      },
    ],
  };
}
