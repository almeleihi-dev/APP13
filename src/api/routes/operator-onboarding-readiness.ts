import type { FastifyInstance } from "fastify";
import type { OperatorOnboardingReadinessService } from "../../experience/operator-onboarding-readiness/application/operator-onboarding-readiness-service.js";

export async function registerOperatorOnboardingReadinessRoutes(
  app: FastifyInstance,
  operatorOnboardingReadiness: OperatorOnboardingReadinessService
): Promise<void> {
  app.get(
    "/operator-onboarding-readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await operatorOnboardingReadiness.getOperatorOnboardingReadinessCenter(
          request.authContext!
        )
      );
    }
  );

  app.get(
    "/operator-onboarding-readiness/overview",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorOnboardingReadiness.getOnboardingOverview(request.authContext!));
    }
  );

  app.get(
    "/operator-onboarding-readiness/blockers",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorOnboardingReadiness.getBlockerRegister(request.authContext!));
    }
  );

  app.get(
    "/operator-onboarding-readiness/warnings",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorOnboardingReadiness.getWarningRegister(request.authContext!));
    }
  );

  app.get(
    "/operator-onboarding-readiness/remediation-queue",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorOnboardingReadiness.getRemediationQueue(request.authContext!));
    }
  );

  app.get(
    "/operator-onboarding-readiness/checklist",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorOnboardingReadiness.getOnboardingChecklist(request.authContext!));
    }
  );

  app.get(
    "/operator-onboarding-readiness/x-stack-readiness",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorOnboardingReadiness.getXStackReadiness(request.authContext!));
    }
  );

  app.get(
    "/operator-onboarding-readiness/verification",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorOnboardingReadiness.getVerificationChain(request.authContext!));
    }
  );

  app.get(
    "/operator-onboarding-readiness/recommendations",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(
        await operatorOnboardingReadiness.getOnboardingRecommendations(request.authContext!)
      );
    }
  );

  app.get(
    "/operator-onboarding-readiness/score",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(await operatorOnboardingReadiness.getOnboardingScore(request.authContext!));
    }
  );
}
