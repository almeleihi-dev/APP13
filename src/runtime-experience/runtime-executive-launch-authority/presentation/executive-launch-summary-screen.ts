function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildExecutiveLaunchSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "executive-launch-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "executive-launch-summary",
        label: "Executive Launch Summary",
        components: [
          component("summary", "core-ui-card", { ...summary, readOnly: true }, "Executive launch summary"),
        ],
      },
    ],
  };
}
