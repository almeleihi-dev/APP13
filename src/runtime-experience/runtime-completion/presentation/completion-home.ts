function component(id: string, componentId: string, props: Record<string, unknown>, label: string) {
  return {
    id,
    componentId,
    props,
    accessibility: { label, role: "region" as const },
  };
}

export function buildCompletionHome(
  completionPercentage: number,
  runtimeChapter3Completed: boolean,
  runtimeCertified: boolean
) {
  return {
    screenId: "completion-home",
    readOnly: true,
    sections: [
      {
        id: "completion-home",
        label: "Runtime Completion Home",
        components: [
          component(
            "completion",
            "core-ui-progress",
            { percentage: completionPercentage, readOnly: true },
            "Chapter 3 completion percentage"
          ),
          component(
            "chapter-completed",
            "core-ui-badge",
            { completed: runtimeChapter3Completed, readOnly: true },
            "Chapter 3 completed"
          ),
          component(
            "certified",
            "core-ui-badge",
            { certified: runtimeCertified, readOnly: true },
            "Runtime certified"
          ),
          component(
            "read-only",
            "core-ui-chip",
            { readOnly: true, noRuntimeExecution: true },
            "Read-only completion certification"
          ),
        ],
      },
    ],
  };
}
