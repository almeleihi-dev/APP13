function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildCompletionDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "completion-dashboard",
    readOnly: true,
    sections: [
      {
        id: "completion-dashboard",
        label: "Completion Dashboard",
        components: [
          component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Runtime completion dashboard"),
        ],
      },
    ],
  };
}
