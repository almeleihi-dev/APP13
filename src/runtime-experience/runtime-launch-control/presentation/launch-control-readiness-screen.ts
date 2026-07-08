function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchControlReadinessScreen(readiness: Record<string, unknown>) {
  return {
    screenId: "launch-control-readiness-screen",
    readOnly: true,
    sections: [
      {
        id: "launch-control-readiness",
        label: "Launch Control Readiness",
        components: [
          component("readiness", "core-ui-card", { ...readiness, readOnly: true }, "Launch readiness decision"),
        ],
      },
    ],
  };
}
