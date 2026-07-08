function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildOperationsHome(operationalCount: number, moduleCount: number) {
  return {
    screenId: "operations-home",
    readOnly: true,
    sections: [
      {
        id: "operations-home",
        label: "Runtime Operations Home",
        components: [
          component("operational", "core-ui-badge", { count: operationalCount, total: moduleCount, readOnly: true }, "Operational modules"),
          component("read-only", "core-ui-chip", { readOnly: true, noRuntimeExecution: true }, "Read-only operations"),
        ],
      },
    ],
  };
}

export function buildOperationsDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "operations-dashboard",
    readOnly: true,
    sections: [
      {
        id: "operations-dashboard",
        label: "Operations Dashboard",
        components: [component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Operations dashboard")],
      },
    ],
  };
}

export function buildOperationsHealthScreen(health: Record<string, unknown>) {
  return {
    screenId: "operations-health-screen",
    readOnly: true,
    sections: [
      {
        id: "operations-health",
        label: "Operations Health",
        components: [component("health", "core-ui-progress", { ...health, readOnly: true }, "Operations health")],
      },
    ],
  };
}

export function buildOperationsAlertsScreen(alerts: Array<{ id: string; severity: string; message: string }>) {
  return {
    screenId: "operations-alerts-screen",
    readOnly: true,
    sections: [
      {
        id: "operations-alerts",
        label: "Operations Alerts",
        components: alerts.map((alert) =>
          component(`alert-${alert.id}`, "core-ui-chip", { ...alert, readOnly: true }, alert.message)
        ),
      },
    ],
  };
}

export function buildOperationsSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "operations-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "operations-summary",
        label: "Operations Summary",
        components: [component("summary", "core-ui-card", { ...summary, readOnly: true }, "Operations summary")],
      },
    ],
  };
}

export function buildOperationsStatusBoard(
  items: Array<{ id: string; label: string; status: string; delegateModule: string }>
) {
  return {
    screenId: "operations-status-board",
    readOnly: true,
    sections: [
      {
        id: "operations-status-board",
        label: "Operations Status Board",
        components: items.map((item) =>
          component(`status-${item.id}`, "core-ui-chip", { ...item, readOnly: true }, item.label)
        ),
      },
    ],
  };
}
