import type { FastifyInstance } from "fastify";
import type { LivingOnboardingService } from "../../living-experience/onboarding/application/living-onboarding-service.js";
import type { OnboardingStepId } from "../../living-experience/onboarding/domain/onboarding-schema.js";
import { ONBOARDING_STEPS } from "../../living-experience/onboarding/domain/onboarding-schema.js";
import { AppError } from "../../shared/errors/index.js";

function parseStepId(stepId: string): OnboardingStepId {
  if (!ONBOARDING_STEPS.includes(stepId as OnboardingStepId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown onboarding step: ${stepId}`,
      code: "NOT_FOUND",
    });
  }
  return stepId as OnboardingStepId;
}

export async function registerLivingOnboardingRoutes(
  app: FastifyInstance,
  livingOnboarding: LivingOnboardingService
): Promise<void> {
  app.get(
    "/living-onboarding",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOnboarding.getOverview(request.authContext!));
    }
  );

  app.get(
    "/living-onboarding/journey",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOnboarding.getJourney(request.authContext!));
    }
  );

  app.get(
    "/living-onboarding/steps",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOnboarding.getSteps(request.authContext!));
    }
  );

  app.get(
    "/living-onboarding/steps/:stepId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { stepId } = request.params as { stepId: string };
      return reply.send(livingOnboarding.getStep(request.authContext!, parseStepId(stepId)));
    }
  );

  app.post(
    "/living-onboarding/steps/:stepId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { stepId } = request.params as { stepId: string };
      const body = (request.body ?? {}) as Record<string, unknown>;
      return reply.send(
        livingOnboarding.submitStep(request.authContext!, parseStepId(stepId), body)
      );
    }
  );

  app.get(
    "/living-onboarding/classification",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOnboarding.getClassification(request.authContext!));
    }
  );

  app.get(
    "/living-onboarding/passport",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOnboarding.getPassport(request.authContext!));
    }
  );

  app.get(
    "/living-onboarding/live-frame",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOnboarding.getLiveFrame(request.authContext!));
    }
  );

  app.get(
    "/living-onboarding/home",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOnboarding.getHome(request.authContext!));
    }
  );

  app.post(
    "/living-onboarding/complete",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingOnboarding.complete(request.authContext!, body));
    }
  );

  app.post(
    "/living-onboarding/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingOnboarding.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-onboarding/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingOnboarding.getStatistics(request.authContext!));
    }
  );
}
