function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildLaunchReadinessHome(readinessPercentage: number, officiallyReadyForLaunch: boolean) {
  return {
    screenId: "launch-readiness-home",
    readOnly: true,
    sections: [
      {
        id: "launch-readiness-home",
        label: "Launch Readiness Home",
        components: [
          component(
            "readiness",
            "core-ui-progress",
            { percentage: readinessPercentage, readOnly: true },
            "Launch readiness percentage"
          ),
          component(
            "official",
            "core-ui-badge",
            { ready: officiallyReadyForLaunch, readOnly: true },
            "Official launch readiness"
          ),
          component(
            "read-only",
            "core-ui-chip",
            { readOnly: true, noRuntimeExecution: true },
            "Read-only launch readiness authority"
          ),
        ],
      },
    ],
  };
}
