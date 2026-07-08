export type RuntimeCertificationStatus = "certified" | "conditional" | "pending" | "incomplete";

export interface RuntimeCertification {
  status: RuntimeCertificationStatus;
  runtimeChapter3Completed: boolean;
  runtimeCertified: boolean;
  validatedModuleCount: number;
  totalModuleCount: number;
  passedCheckCount: number;
  totalCheckCount: number;
  officialExecutiveLaunchApproval: boolean;
  readOnly: true;
  delegated: true;
}

export function buildRuntimeCertification(input: {
  validatedModuleCount: number;
  totalModuleCount: number;
  passedCheckCount: number;
  totalCheckCount: number;
  officialExecutiveLaunchApproval: boolean;
}): RuntimeCertification {
  const allModulesValidated =
    input.validatedModuleCount === input.totalModuleCount && input.passedCheckCount === input.totalCheckCount;
  const runtimeChapter3Completed = allModulesValidated;
  const runtimeCertified = runtimeChapter3Completed && input.officialExecutiveLaunchApproval;

  let status: RuntimeCertificationStatus = "certified";
  if (!runtimeChapter3Completed) status = input.validatedModuleCount === 0 ? "incomplete" : "pending";
  else if (!runtimeCertified) status = "conditional";

  return {
    status,
    runtimeChapter3Completed,
    runtimeCertified,
    validatedModuleCount: input.validatedModuleCount,
    totalModuleCount: input.totalModuleCount,
    passedCheckCount: input.passedCheckCount,
    totalCheckCount: input.totalCheckCount,
    officialExecutiveLaunchApproval: input.officialExecutiveLaunchApproval,
    readOnly: true,
    delegated: true,
  };
}
