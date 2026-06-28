function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildStatisticsScreen(statistics: Record<string, unknown>) {
  return {
    screenId: "statistics-screen",
    readOnly: true,
    sections: [
      {
        id: "statistics",
        label: "Runtime Statistics",
        components: [
          component("statistics", "core-ui-card", { ...statistics, readOnly: true }, "Runtime statistics"),
        ],
      },
    ],
  };
}
