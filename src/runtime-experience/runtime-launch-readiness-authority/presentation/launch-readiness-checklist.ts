function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchReadinessChecklist(checks: Array<{ id: string; label: string; status: string }>) {
  return {
    screenId: "launch-readiness-checklist",
    readOnly: true,
    sections: [
      {
        id: "launch-readiness-checklist",
        label: "Launch Readiness Checklist",
        components: checks.map((check) =>
          component(`check-${check.id}`, "core-ui-chip", { ...check, readOnly: true }, check.label)
        ),
      },
    ],
  };
}
