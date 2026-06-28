function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildExecutiveLaunchDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "executive-launch-dashboard",
    readOnly: true,
    sections: [
      {
        id: "executive-launch-dashboard",
        label: "Executive Launch Dashboard",
        components: [
          component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Executive launch dashboard"),
        ],
      },
    ],
  };
}
