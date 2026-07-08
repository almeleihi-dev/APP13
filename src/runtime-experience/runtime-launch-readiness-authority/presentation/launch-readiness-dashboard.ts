function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchReadinessDashboard(overview: Record<string, unknown>) {
  return {
    screenId: "launch-readiness-dashboard",
    readOnly: true,
    sections: [
      {
        id: "launch-readiness-dashboard",
        label: "Launch Readiness Dashboard",
        components: [
          component("dashboard", "core-ui-card", { ...overview, readOnly: true }, "Launch readiness dashboard"),
        ],
      },
    ],
  };
}
