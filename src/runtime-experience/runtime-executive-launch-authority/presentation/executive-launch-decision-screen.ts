function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildExecutiveLaunchDecisionScreen(decision: Record<string, unknown>) {
  return {
    screenId: "executive-launch-decision-screen",
    readOnly: true,
    sections: [
      {
        id: "executive-launch-decision",
        label: "Executive Launch Decision",
        components: [
          component("decision", "core-ui-card", { ...decision, readOnly: true }, "Executive launch decision"),
        ],
      },
    ],
  };
}
