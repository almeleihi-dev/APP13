import { bootstrapPlatform } from "./platform.js";
import { bootstrapEngines } from "./engines.js";
import { bootstrapPlatformExperiences, bootstrapBrowserModules } from "./experiences.js";
import { bootstrapIntelligenceModules, bootstrapIntelligenceServices } from "./intelligence.js";
import { bootstrapLiving } from "./living.js";
import { bootstrapRuntime } from "./runtime.js";
import { bootstrapFinancial } from "./financial.js";
import { bootstrapSecurity } from "./security.js";
import type { AppDependencies } from "./dependencies.js";

export function bootstrapApp(): AppDependencies {
  const platform = bootstrapPlatform();
  const engineResult = bootstrapEngines(platform);
  const { trust, ...engines } = engineResult;
  const platformExperiences = bootstrapPlatformExperiences(platform, engines);
  const intelligenceModules = bootstrapIntelligenceModules();
  const living = bootstrapLiving();
  const runtime = bootstrapRuntime();
  const browserModules = bootstrapBrowserModules();
  const intelligenceServices = bootstrapIntelligenceServices();
  const financial = bootstrapFinancial({
    platform,
    engines,
    trust,
    trustIntelligence: intelligenceServices.trustIntelligence,
    providerIntelligence: intelligenceServices.providerIntelligence,
  });
  const security = bootstrapSecurity(platform);

  return {
    ...platform,
    ...engines,
    ...platformExperiences,
    ...browserModules,
    ...intelligenceModules,
    ...intelligenceServices,
    ...living,
    ...runtime,
    ...financial,
    ...security,
  };
}

export type { AppDependencies } from "./dependencies.js";
