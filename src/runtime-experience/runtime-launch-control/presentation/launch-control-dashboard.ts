function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchControlDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "launch-control-dashboard",
    readOnly: true,
    sections: [
      {
        id: "launch-control-dashboard",
        label: "Launch Control Dashboard",
        components: [
          component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Launch control dashboard"),
        ],
      },
    ],
  };
}
