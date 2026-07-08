function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchControlHome(launchClearancePercentage: number, officiallyClearedForLaunch: boolean) {
  return {
    screenId: "launch-control-home",
    readOnly: true,
    sections: [
      {
        id: "launch-control-home",
        label: "Launch Control Home",
        components: [
          component(
            "clearance",
            "core-ui-progress",
            { percentage: launchClearancePercentage, readOnly: true },
            "Launch clearance percentage"
          ),
          component(
            "official",
            "core-ui-badge",
            { cleared: officiallyClearedForLaunch, readOnly: true },
            "Official launch clearance"
          ),
          component(
            "read-only",
            "core-ui-chip",
            { readOnly: true, noRuntimeExecution: true },
            "Read-only launch control"
          ),
        ],
      },
    ],
  };
}
