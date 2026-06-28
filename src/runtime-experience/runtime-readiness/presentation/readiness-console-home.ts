function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildReadinessConsoleHome(readinessPercentage: number, openGateCount: number) {
  return {
    screenId: "readiness-console-home",
    readOnly: true,
    sections: [
      {
        id: "readiness-console-home",
        label: "Readiness Console Home",
        components: [
          component("readiness", "core-ui-progress", { percentage: readinessPercentage, readOnly: true }, "Readiness percentage"),
          component("gates", "core-ui-badge", { count: openGateCount, readOnly: true }, "Open gates"),
          component("read-only", "core-ui-chip", { readOnly: true, noRuntimeExecution: true }, "Read-only readiness"),
        ],
      },
    ],
  };
}

export function buildReadinessConsoleScreen(overview: Record<string, unknown>) {
  return {
    screenId: "readiness-console-screen",
    readOnly: true,
    sections: [
      {
        id: "readiness-console",
        label: "Readiness Console",
        components: [component("console", "core-ui-card", { ...overview, readOnly: true }, "Readiness console")],
      },
    ],
  };
}

export function buildReadinessChecklistScreen(checks: Array<{ id: string; label: string; status: string }>) {
  return {
    screenId: "readiness-checklist-screen",
    readOnly: true,
    sections: [
      {
        id: "readiness-checklist",
        label: "Readiness Checklist",
        components: checks.map((check) =>
          component(`check-${check.id}`, "core-ui-chip", { ...check, readOnly: true }, check.label)
        ),
      },
    ],
  };
}

export function buildReadinessGatesScreen(gates: Array<{ id: string; title: string; status: string }>) {
  return {
    screenId: "readiness-gates-screen",
    readOnly: true,
    sections: [
      {
        id: "readiness-gates",
        label: "Readiness Gates",
        components: gates.map((gate) =>
          component(`gate-${gate.id}`, "core-ui-chip", { ...gate, readOnly: true }, gate.title)
        ),
      },
    ],
  };
}

export function buildReadinessSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "readiness-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "readiness-summary",
        label: "Readiness Summary",
        components: [component("summary", "core-ui-card", { ...summary, readOnly: true }, "Readiness summary")],
      },
    ],
  };
}

export function buildReadinessCommandBoard(
  items: Array<{ id: string; label: string; status: string; delegateModule: string }>
) {
  return {
    screenId: "readiness-command-board",
    readOnly: true,
    sections: [
      {
        id: "readiness-command-board",
        label: "Readiness Command Board",
        components: items.map((item) =>
          component(`command-${item.id}`, "core-ui-chip", { ...item, readOnly: true }, item.label)
        ),
      },
    ],
  };
}
