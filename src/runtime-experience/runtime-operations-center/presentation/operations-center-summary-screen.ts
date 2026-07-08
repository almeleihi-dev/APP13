function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildOperationsCenterSummaryScreen(summary: Record<string, unknown>) {
  return {
    screenId: "operations-center-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "operations-center-summary",
        label: "Operations Center Summary",
        components: [
          component("summary", "core-ui-card", { ...summary, readOnly: true }, "Operations center summary"),
        ],
      },
    ],
  };
}
