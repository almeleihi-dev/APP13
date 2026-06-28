function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildOperationsCenterHealthScreen(health: Record<string, unknown>) {
  return {
    screenId: "operations-center-health-screen",
    readOnly: true,
    sections: [
      {
        id: "operations-center-health",
        label: "Operations Center Health",
        components: [
          component("health", "core-ui-progress", { ...health, readOnly: true }, "Operations center health"),
        ],
      },
    ],
  };
}
