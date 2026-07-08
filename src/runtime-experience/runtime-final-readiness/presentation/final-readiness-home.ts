function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildFinalReadinessHome(reviewPercentage: number, readyForProduction: boolean) {
  return {
    screenId: "final-readiness-home",
    readOnly: true,
    sections: [
      {
        id: "final-readiness-home",
        label: "Final Readiness Home",
        components: [
          component("review", "core-ui-progress", { percentage: reviewPercentage, readOnly: true }, "Review percentage"),
          component("production", "core-ui-badge", { ready: readyForProduction, readOnly: true }, "Production readiness"),
          component("read-only", "core-ui-chip", { readOnly: true, noRuntimeExecution: true }, "Read-only final review"),
        ],
      },
    ],
  };
}

export function buildFinalReadinessDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "final-readiness-dashboard",
    readOnly: true,
    sections: [
      {
        id: "final-readiness-dashboard",
        label: "Final Readiness Dashboard",
        components: [component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Final readiness dashboard")],
      },
    ],
  };
}

export function buildFinalReadinessChecklist(checks: Array<{ id: string; label: string; status: string }>) {
  return {
    screenId: "final-readiness-checklist",
    readOnly: true,
    sections: [
      {
        id: "final-readiness-checklist",
        label: "Final Readiness Checklist",
        components: checks.map((check) =>
          component(`check-${check.id}`, "core-ui-chip", { ...check, readOnly: true }, check.label)
        ),
      },
    ],
  };
}

export function buildFinalReadinessRisksScreen(risks: Array<{ id: string; title: string; severity: string; mitigated: boolean }>) {
  return {
    screenId: "final-readiness-risks-screen",
    readOnly: true,
    sections: [
      {
        id: "final-readiness-risks",
        label: "Final Readiness Risks",
        components: risks.map((risk) =>
          component(`risk-${risk.id}`, "core-ui-chip", { ...risk, readOnly: true }, risk.title)
        ),
      },
    ],
  };
}

export function buildFinalReadinessSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "final-readiness-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "final-readiness-summary",
        label: "Final Readiness Summary",
        components: [component("summary", "core-ui-card", { ...summary, readOnly: true }, "Final readiness summary")],
      },
    ],
  };
}

export function buildFinalReadinessBoard(
  items: Array<{ id: string; label: string; status: string; delegateModule: string }>
) {
  return {
    screenId: "final-readiness-board",
    readOnly: true,
    sections: [
      {
        id: "final-readiness-board",
        label: "Final Readiness Board",
        components: items.map((item) =>
          component(`board-${item.id}`, "core-ui-chip", { ...item, readOnly: true }, item.label)
        ),
      },
    ],
  };
}
