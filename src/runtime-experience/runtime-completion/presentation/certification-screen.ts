function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildCertificationScreen(certification: Record<string, unknown>) {
  return {
    screenId: "certification-screen",
    readOnly: true,
    sections: [
      {
        id: "certification",
        label: "Runtime Certification",
        components: [
          component("certification", "core-ui-card", { ...certification, readOnly: true }, "Runtime certification"),
        ],
      },
    ],
  };
}
