import { createNeedExperienceModule } from "../runtime-experience/need/module.js";
import { createActionExperienceModule } from "../runtime-experience/action/module.js";
import { createContractExperienceModule } from "../runtime-experience/contract/module.js";
import { createChatExperienceModule } from "../runtime-experience/chat/module.js";
import { createTimelineExperienceModule } from "../runtime-experience/timeline/module.js";
import { createNotificationExperienceModule } from "../runtime-experience/notification/module.js";
import { createProfileExperienceModule } from "../runtime-experience/profile/module.js";
import { createAnActRuntimeJourneyModule } from "../runtime-experience/runtime-journey/module.js";
import { createAnActRuntimeStateModule } from "../runtime-experience/runtime-state/module.js";
import { createAnActRuntimeRegistryModule } from "../runtime-experience/runtime-registry/module.js";
import { createAnActRuntimeCoordinatorModule } from "../runtime-experience/runtime-coordinator/module.js";
import { createAnActRuntimeHealthModule } from "../runtime-experience/runtime-health/module.js";
import { createAnActRuntimeDemoModule } from "../runtime-experience/runtime-demo/module.js";
import { createAnActRuntimePreviewModule } from "../runtime-experience/runtime-preview/module.js";
import { createAnActRuntimeLauncherModule } from "../runtime-experience/runtime-launcher/module.js";
import { createAnActRuntimeReleaseModule } from "../runtime-experience/runtime-release/module.js";
import { createAnActRuntimeOperationsModule } from "../runtime-experience/runtime-operations/module.js";
import { createAnActRuntimeExecutiveDashboardModule } from "../runtime-experience/runtime-executive/module.js";
import { createAnActRuntimeReadinessConsoleModule } from "../runtime-experience/runtime-readiness/module.js";
import { createAnActRuntimeCertificationCenterModule } from "../runtime-experience/runtime-certification/module.js";
import { createAnActRuntimeFinalReadinessReviewModule } from "../runtime-experience/runtime-final-readiness/module.js";
import { createAnActRuntimeProductionApprovalCenterModule } from "../runtime-experience/runtime-production-approval/module.js";
import { createAnActRuntimeOperationsCenterModule } from "../runtime-experience/runtime-operations-center/module.js";
import { createAnActRuntimeLaunchControlCenterModule } from "../runtime-experience/runtime-launch-control/module.js";
import { createAnActRuntimeLaunchReadinessAuthorityModule } from "../runtime-experience/runtime-launch-readiness-authority/module.js";
import { createAnActRuntimeExecutiveLaunchAuthorityModule } from "../runtime-experience/runtime-executive-launch-authority/module.js";
import { createAnActRuntimeCompletionModule } from "../runtime-experience/runtime-completion/module.js";
import type { RuntimeDependencies } from "./dependencies.js";

export function bootstrapRuntime(): RuntimeDependencies {
  const { needExperience } = createNeedExperienceModule();
  const { actionExperience } = createActionExperienceModule();
  const { contractExperience } = createContractExperienceModule();
  const { chatExperience } = createChatExperienceModule();
  const { timelineExperience } = createTimelineExperienceModule();
  const { notificationExperience } = createNotificationExperienceModule();
  const { profileExperience } = createProfileExperienceModule();
  const { runtimeJourney } = createAnActRuntimeJourneyModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
  });
  const { runtimeState } = createAnActRuntimeStateModule({ runtimeJourney });
  const { runtimeRegistry } = createAnActRuntimeRegistryModule();
  const { runtimeCoordinator } = createAnActRuntimeCoordinatorModule({
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
  });
  const { runtimeHealth } = createAnActRuntimeHealthModule({ runtimeRegistry });
  const { runtimeDemo } = createAnActRuntimeDemoModule({
    runtimeState,
    runtimeCoordinator,
    runtimeRegistry,
    runtimeHealth,
  });
  const { runtimePreview } = createAnActRuntimePreviewModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
  });
  const { runtimeLauncher } = createAnActRuntimeLauncherModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
  });
  const { runtimeRelease } = createAnActRuntimeReleaseModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    runtimeLauncher,
  });
  const { runtimeOperations } = createAnActRuntimeOperationsModule({
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    runtimeLauncher,
    runtimeRelease,
  });
  const { runtimeExecutive } = createAnActRuntimeExecutiveDashboardModule({
    runtimeOperations,
    runtimeRelease,
    runtimeLauncher,
    runtimeHealth,
  });
  const { runtimeReadiness } = createAnActRuntimeReadinessConsoleModule({
    runtimeExecutive,
    runtimeOperations,
    runtimeRelease,
    runtimeLauncher,
  });
  const { runtimeCertification } = createAnActRuntimeCertificationCenterModule({
    runtimeReadiness,
    runtimeExecutive,
    runtimeOperations,
    runtimeRelease,
  });
  const { runtimeFinalReadiness } = createAnActRuntimeFinalReadinessReviewModule({
    runtimeCertification,
    runtimeReadiness,
    runtimeExecutive,
    runtimeOperations,
  });
  const { runtimeProductionApproval } = createAnActRuntimeProductionApprovalCenterModule({
    runtimeFinalReadiness,
    runtimeCertification,
    runtimeExecutive,
    runtimeOperations,
  });
  const { runtimeOperationsCenter } = createAnActRuntimeOperationsCenterModule({
    runtimeProductionApproval,
    runtimeOperations,
    runtimeExecutive,
    runtimeFinalReadiness,
  });
  const { runtimeLaunchControl } = createAnActRuntimeLaunchControlCenterModule({
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeLauncher,
    runtimeOperations,
  });
  const { runtimeLaunchReadinessAuthority } = createAnActRuntimeLaunchReadinessAuthorityModule({
    runtimeLaunchControl,
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeLauncher,
  });
  const { runtimeExecutiveLaunchAuthority } = createAnActRuntimeExecutiveLaunchAuthorityModule({
    runtimeLaunchReadinessAuthority,
    runtimeLaunchControl,
    runtimeOperationsCenter,
    runtimeProductionApproval,
    runtimeExecutive,
  });
  const { runtimeCompletion } = createAnActRuntimeCompletionModule({
    runtimeExecutiveLaunchAuthority,
  });

  return {
    needExperience,
    actionExperience,
    contractExperience,
    chatExperience,
    timelineExperience,
    notificationExperience,
    profileExperience,
    runtimeJourney,
    runtimeState,
    runtimeRegistry,
    runtimeCoordinator,
    runtimeHealth,
    runtimeDemo,
    runtimePreview,
    runtimeLauncher,
    runtimeRelease,
    runtimeOperations,
    runtimeExecutive,
    runtimeReadiness,
    runtimeCertification,
    runtimeFinalReadiness,
    runtimeProductionApproval,
    runtimeOperationsCenter,
    runtimeLaunchControl,
    runtimeLaunchReadinessAuthority,
    runtimeExecutiveLaunchAuthority,
    runtimeCompletion,
  };
}
