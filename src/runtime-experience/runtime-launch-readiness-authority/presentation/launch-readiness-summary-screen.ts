function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchReadinessSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "launch-readiness-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "launch-readiness-summary",
        label: "Launch Readiness Summary",
        components: [
          component("summary", "core-ui-card", { ...summary, readOnly: true }, "Launch readiness summary"),
        ],
      },
    ],
  };
}
