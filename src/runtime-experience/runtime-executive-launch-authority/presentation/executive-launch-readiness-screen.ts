function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildExecutiveLaunchReadinessScreen(readiness: Record<string, unknown>) {
  return {
    screenId: "executive-launch-readiness-screen",
    readOnly: true,
    sections: [
      {
        id: "executive-launch-readiness",
        label: "Executive Launch Readiness",
        components: [
          component("readiness", "core-ui-card", { ...readiness, readOnly: true }, "Executive launch readiness"),
        ],
      },
    ],
  };
}
