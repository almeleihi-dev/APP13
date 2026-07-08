function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchControlSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "launch-control-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "launch-control-summary",
        label: "Launch Control Summary",
        components: [
          component("summary", "core-ui-card", { ...summary, readOnly: true }, "Launch control summary"),
        ],
      },
    ],
  };
}
