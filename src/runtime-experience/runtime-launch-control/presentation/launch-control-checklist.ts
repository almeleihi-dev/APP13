function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchControlChecklist(checks: Array<{ id: string; label: string; status: string }>) {
  return {
    screenId: "launch-control-checklist",
    readOnly: true,
    sections: [
      {
        id: "launch-control-checklist",
        label: "Launch Control Checklist",
        components: checks.map((check) =>
          component(`check-${check.id}`, "core-ui-chip", { ...check, readOnly: true }, check.label)
        ),
      },
    ],
  };
}
