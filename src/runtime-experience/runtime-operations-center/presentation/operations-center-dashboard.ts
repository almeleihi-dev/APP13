function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildOperationsCenterDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "operations-center-dashboard",
    readOnly: true,
    sections: [
      {
        id: "operations-center-dashboard",
        label: "Operations Center Dashboard",
        components: [
          component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Operations center dashboard"),
        ],
      },
    ],
  };
}
