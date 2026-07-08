function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildOperationsCenterHome(operationalCount: number, moduleCount: number, productionApproved: boolean) {
  return {
    screenId: "operations-center-home",
    readOnly: true,
    sections: [
      {
        id: "operations-center-home",
        label: "Runtime Operations Center Home",
        components: [
          component(
            "operational",
            "core-ui-badge",
            { count: operationalCount, total: moduleCount, readOnly: true },
            "Operational modules"
          ),
          component(
            "production-approved",
            "core-ui-chip",
            { productionApproved, readOnly: true },
            "Production approval status"
          ),
          component(
            "read-only",
            "core-ui-chip",
            { readOnly: true, noRuntimeExecution: true },
            "Read-only operations center"
          ),
        ],
      },
    ],
  };
}
