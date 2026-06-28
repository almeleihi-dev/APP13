function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildExecutiveLaunchHome(authorizationPercentage: number, officialExecutiveLaunchApproval: boolean) {
  return {
    screenId: "executive-launch-home",
    readOnly: true,
    sections: [
      {
        id: "executive-launch-home",
        label: "Executive Launch Home",
        components: [
          component(
            "authorization",
            "core-ui-progress",
            { percentage: authorizationPercentage, readOnly: true },
            "Executive launch authorization percentage"
          ),
          component(
            "official",
            "core-ui-badge",
            { approved: officialExecutiveLaunchApproval, readOnly: true },
            "Official executive launch approval"
          ),
          component(
            "read-only",
            "core-ui-chip",
            { readOnly: true, noRuntimeExecution: true },
            "Read-only executive launch authority"
          ),
        ],
      },
    ],
  };
}
