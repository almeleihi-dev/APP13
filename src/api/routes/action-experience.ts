import type { FastifyInstance } from "fastify";
import type { ActionExperienceService } from "../../runtime-experience/action/application/action-experience-service.js";
import { isActionScreenId } from "../../runtime-experience/action/domain/action-screen.js";
import type { WaitingReason } from "../../runtime-experience/action/domain/action-state.js";
import { AppError } from "../../shared/errors/index.js";

const WAITING_REASONS: WaitingReason[] = ["customer", "confirmation", "payment"];

function parseWaitingReason(value: string): WaitingReason {
  if (!WAITING_REASONS.includes(value as WaitingReason)) {
    throw new AppError({
      type: "about:blank",
      title: "Bad Request",
      status: 400,
      detail: `Invalid waiting reason: ${value}`,
      code: "VALIDATION_ERROR",
    });
  }
  return value as WaitingReason;
}

export async function registerActionExperienceRoutes(
  app: FastifyInstance,
  actionExperience: ActionExperienceService
): Promise<void> {
  app.get(
    "/action-experience",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        actionExperience.getExperience(request.authContext!, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );

  app.post(
    "/action-experience/enter",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        generated_at?: string;
        need_handoff?: {
          opportunity_id?: string;
          action_summary?: string;
          location?: string;
          schedule?: string;
          notes?: string;
          estimated_cost?: number;
        };
      };
      return reply.send(
        actionExperience.enterFromNeedTransition(request.authContext!, {
          generated_at: body.generated_at,
          need_handoff: body.need_handoff
            ? {
                opportunityId: body.need_handoff.opportunity_id,
                actionSummary: body.need_handoff.action_summary ?? "",
                location: body.need_handoff.location ?? "",
                schedule: body.need_handoff.schedule ?? "",
                notes: body.need_handoff.notes ?? "",
                estimatedCost: body.need_handoff.estimated_cost ?? 0,
              }
            : undefined,
        })
      );
    }
  );

  app.get(
    "/action-experience/flow",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(actionExperience.getFlow())
  );

  app.get(
    "/action-experience/validate",
    { config: { authRequired: true } },
    async (_request, reply) => reply.send(actionExperience.validateRuntime())
  );

  app.get(
    "/action-experience/home",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(actionExperience.getHome(request.authContext!, query));
    }
  );

  app.get(
    "/action-experience/contract",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(actionExperience.getContract(request.authContext!, query));
    }
  );

  app.get(
    "/action-experience/active",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(actionExperience.getActiveAction(request.authContext!, query));
    }
  );

  app.get(
    "/action-experience/progress",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(actionExperience.getProgress(request.authContext!, query));
    }
  );

  app.get(
    "/action-experience/completion",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(actionExperience.getCompletion(request.authContext!, query));
    }
  );

  app.get(
    "/action-experience/waiting",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { reason?: string; generated_at?: string };
      return reply.send(
        actionExperience.getWaiting(request.authContext!, {
          reason: parseWaitingReason(query.reason ?? "customer"),
          generated_at: query.generated_at,
        })
      );
    }
  );

  app.get(
    "/action-experience/transition",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string; progress?: string };
      return reply.send(
        actionExperience.advanceTransition(request.authContext!, {
          progress: query.progress ? Number(query.progress) : 0,
          generated_at: query.generated_at,
        })
      );
    }
  );

  app.post(
    "/action-experience/contract/continue",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(actionExperience.continueContract(request.authContext!, body));
    }
  );

  app.post(
    "/action-experience/complete",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(actionExperience.completeAction(request.authContext!, body));
    }
  );

  app.post(
    "/action-experience/return",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(actionExperience.startReturnTransition(request.authContext!, body));
    }
  );

  app.post(
    "/action-experience/transition/advance",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { progress?: number; generated_at?: string };
      return reply.send(
        actionExperience.advanceTransition(request.authContext!, {
          progress: body.progress ?? 0,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.get(
    "/action-experience/screen/:screenId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { screenId } = request.params as { screenId: string };
      if (!isActionScreenId(screenId)) {
        throw new AppError({
          type: "about:blank",
          title: "Not Found",
          status: 404,
          detail: `Unknown action screen: ${screenId}`,
          code: "NOT_FOUND",
        });
      }
      const query = request.query as { generated_at?: string; reduced_motion?: string };
      return reply.send(
        actionExperience.getScreen(request.authContext!, screenId, {
          generated_at: query.generated_at,
          reduced_motion: query.reduced_motion === "true",
        })
      );
    }
  );
}
