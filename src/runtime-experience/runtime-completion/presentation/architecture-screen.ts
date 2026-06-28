function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildArchitectureScreen(architecture: Record<string, unknown>) {
  return {
    screenId: "architecture-screen",
    readOnly: true,
    sections: [
      {
        id: "architecture",
        label: "Runtime Architecture Summary",
        components: [
          component("architecture", "core-ui-card", { ...architecture, readOnly: true }, "Runtime architecture summary"),
        ],
      },
    ],
  };
}
