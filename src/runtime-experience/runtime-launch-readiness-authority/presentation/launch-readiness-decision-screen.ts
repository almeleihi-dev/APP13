function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchReadinessDecisionScreen(decision: Record<string, unknown>) {
  return {
    screenId: "launch-readiness-decision-screen",
    readOnly: true,
    sections: [
      {
        id: "launch-readiness-decision",
        label: "Launch Readiness Decision",
        components: [
          component("decision", "core-ui-card", { ...decision, readOnly: true }, "Launch readiness decision"),
        ],
      },
    ],
  };
}
