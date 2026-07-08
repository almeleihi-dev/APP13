import { createActionService } from "../action/application/action-service.js";
import { identityRepository } from "../identity/infrastructure/index.js";
import { createTrustModule } from "../trust/module.js";
import { createProviderExperienceModule } from "../provider-experience/module.js";
import { createRequestExperienceModule } from "../request-experience/module.js";
import { createConversionModule } from "../conversion/module.js";
import { createCustomerExperienceModule } from "../customer-experience/module.js";
import { createProviderWorkspaceModule } from "../provider-workspace/module.js";
import { createOperationsModule } from "../operations/module.js";
import { createNotificationsModule } from "../notifications/module.js";
import { createDiscoveryModule } from "../discovery/module.js";
import { createAnalyticsModule } from "../analytics/module.js";
import type { PlatformDependencies } from "./dependencies.js";
import type { EngineDependencies } from "./dependencies.js";
import type { TrustService } from "../trust/application/trust-service.js";

export interface EngineBootstrapResult extends EngineDependencies {
  trust: TrustService;
}

export function bootstrapEngines(platform: PlatformDependencies): EngineBootstrapResult {
  const { db } = platform;
  const actions = createActionService(db, identityRepository);
  const { trust, trustScore } = createTrustModule(db);
  const { eventInbox } = createNotificationsModule(db);
  trust.attachEventInboxService(eventInbox);
  const { providerProfile } = createProviderExperienceModule(db, { trustScore });
  const { requestIntelligence } = createRequestExperienceModule(db, { trustScore });
  const { matchContractConversion } = createConversionModule(db, { eventInbox });
  const { customerDashboard } = createCustomerExperienceModule(db);
  const { providerDashboard } = createProviderWorkspaceModule(db, { trustScore });
  const { adminConsole } = createOperationsModule(db);
  const { discovery } = createDiscoveryModule(db, { trustScore });
  const { platformAnalytics } = createAnalyticsModule(db);

  return {
    actions,
    trust,
    trustScore,
    eventInbox,
    providerProfile,
    requestIntelligence,
    matchContractConversion,
    customerDashboard,
    providerDashboard,
    adminConsole,
    discovery,
    platformAnalytics,
  };
}
