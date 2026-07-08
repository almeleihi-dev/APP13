function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildOperationsCenterStatusBoard(
  items: Array<{ id: string; label: string; status: string; delegateModule: string }>
) {
  return {
    screenId: "operations-center-status-board",
    readOnly: true,
    sections: [
      {
        id: "operations-center-status-board",
        label: "Operations Center Status Board",
        components: items.map((item) =>
          component(`status-${item.id}`, "core-ui-chip", { ...item, readOnly: true }, item.label)
        ),
      },
    ],
  };
}
