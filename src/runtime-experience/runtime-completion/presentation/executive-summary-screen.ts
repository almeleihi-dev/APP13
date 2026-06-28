function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildExecutiveSummaryScreen(executiveSummary: Record<string, unknown>) {
  return {
    screenId: "executive-summary-screen",
    readOnly: true,
    sections: [
      {
        id: "executive-summary",
        label: "Executive Summary",
        components: [
          component(
            "executive-summary",
            "core-ui-card",
            { ...executiveSummary, readOnly: true },
            "Runtime executive summary"
          ),
        ],
      },
    ],
  };
}
