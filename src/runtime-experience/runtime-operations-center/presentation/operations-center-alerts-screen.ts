function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildOperationsCenterAlertsScreen(
  alerts: Array<{ id: string; severity: string; message: string }>
) {
  return {
    screenId: "operations-center-alerts-screen",
    readOnly: true,
    sections: [
      {
        id: "operations-center-alerts",
        label: "Operations Center Alerts",
        components: alerts.map((alert) =>
          component(`alert-${alert.id}`, "core-ui-chip", { ...alert, readOnly: true }, alert.message)
        ),
      },
    ],
  };
}
