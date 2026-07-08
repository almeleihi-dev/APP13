function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchControlBoard(
  items: Array<{ id: string; label: string; status: string; delegateModule: string }>
) {
  return {
    screenId: "launch-control-board",
    readOnly: true,
    sections: [
      {
        id: "launch-control-board",
        label: "Launch Control Board",
        components: items.map((item) =>
          component(`board-${item.id}`, "core-ui-chip", { ...item, readOnly: true }, item.label)
        ),
      },
    ],
  };
}
