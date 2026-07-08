import Fastify, { type FastifyInstance } from "fastify";
import type { AuthContext } from "../../src/shared/auth/index.js";
import { errorHandler } from "../../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../../src/api/middleware/require-auth.js";
import { registerEscrowExperienceRoutes } from "../../src/api/routes/escrow.js";
import { registerExecutionExperienceRoutes } from "../../src/api/routes/execution.js";
import { registerEvidenceReadRoutes } from "../../src/api/routes/evidence-read.js";
import { registerDisputesReadRoutes } from "../../src/api/routes/disputes-read.js";
import { registerTrustExperienceRoutes } from "../../src/api/routes/trust.js";
import { registerPlatformExperienceRoutes } from "../../src/api/routes/platform.js";
import type { ExperienceServices } from "../../src/experience/index.js";
import { MVP_MILESTONE_ESCROW_SOURCE } from "../../src/ui/escrow/escrow-payload.js";
import { MVP_ACTIVE_EXECUTION_SOURCE } from "../../src/ui/execution/execution-payload.js";
import { MVP_EVIDENCE_OVERVIEW_SOURCE } from "../../src/ui/evidence/evidence-payload.js";
import { MVP_OPEN_DISPUTE_SOURCE } from "../../src/ui/dispute/dispute-payload.js";
import { MVP_TRUST_CENTER_SOURCE } from "../../src/ui/trust/trust-payload.js";
import { MVP_PLATFORM_HOME_SOURCE } from "../../src/ui/platform/platform-payload.js";

export const TEST_AUTH_CONTEXT: AuthContext = {
  userId: "11111111-1111-4111-8111-111111111111",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "experience-test-session",
};

export function createDefaultExperienceServices(): ExperienceServices {
  return {
    escrow: {
      getOverview: async () => MVP_MILESTONE_ESCROW_SOURCE,
      getHistory: async () => MVP_MILESTONE_ESCROW_SOURCE,
    },
    execution: {
      getDashboard: async () => MVP_ACTIVE_EXECUTION_SOURCE,
      getMilestoneDetails: async () => MVP_ACTIVE_EXECUTION_SOURCE,
    },
    evidence: {
      getOverview: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
      getItemDetails: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
      getTimeline: async () => MVP_EVIDENCE_OVERVIEW_SOURCE,
    },
    dispute: {
      getDashboard: async () => MVP_OPEN_DISPUTE_SOURCE,
      getDetails: async () => MVP_OPEN_DISPUTE_SOURCE,
      getTimeline: async () => MVP_OPEN_DISPUTE_SOURCE,
    },
    trust: {
      getTrustCenter: async () => MVP_TRUST_CENTER_SOURCE,
      getProviderReport: async () => MVP_TRUST_CENTER_SOURCE,
      getTimeline: async () => MVP_TRUST_CENTER_SOURCE,
    },
    platform: {
      getHome: async () => MVP_PLATFORM_HOME_SOURCE,
      getOverview: async () => MVP_PLATFORM_HOME_SOURCE,
    },
  };
}

export async function buildExperienceTestServer(
  services: ExperienceServices = createDefaultExperienceServices()
): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  app.decorateRequest("authContext", null);
  app.addHook("preHandler", async (request) => {
    request.authContext = TEST_AUTH_CONTEXT;
  });
  app.addHook("preHandler", requireAuthMiddleware);
  app.setErrorHandler(errorHandler);

  await registerEscrowExperienceRoutes(app, services.escrow);
  await registerExecutionExperienceRoutes(app, services.execution);
  await registerEvidenceReadRoutes(app, services.evidence);
  await registerDisputesReadRoutes(app, services.dispute);
  await registerTrustExperienceRoutes(app, services.trust);
  await registerPlatformExperienceRoutes(app, services.platform);

  return app;
}
