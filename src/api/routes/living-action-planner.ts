import type { FastifyInstance } from "fastify";
import type { LivingActionPlannerService } from "../../living-experience/action-planner/application/living-action-planner-service.js";
import type { LivingActionPlannerSectionId } from "../../living-experience/action-planner/domain/planner-schema.js";
import { LIVING_ACTION_PLANNER_SECTIONS } from "../../living-experience/action-planner/domain/planner-schema.js";
import { AppError } from "../../shared/errors/index.js";

const SECTION_ROUTE_MAP: Record<string, LivingActionPlannerSectionId> = {
  mission: "todays_mission",
  "action-plan": "todays_action_plan",
  timeline: "priority_timeline",
  checklist: "professional_checklist",
  preparation: "required_preparation",
  resources: "recommended_resources",
  time: "time_planner",
  progress: "progress_tracker",
  completed: "completed_today",
  blocked: "blocked_actions",
  reschedule: "reschedule_planner",
  tomorrow: "tomorrow_queue",
  history: "execution_history",
};

function parseSectionId(sectionId: string): LivingActionPlannerSectionId {
  if (!LIVING_ACTION_PLANNER_SECTIONS.includes(sectionId as LivingActionPlannerSectionId)) {
    throw new AppError({
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: `Unknown action planner section: ${sectionId}`,
      code: "NOT_FOUND",
    });
  }
  return sectionId as LivingActionPlannerSectionId;
}

export async function registerLivingActionPlannerRoutes(
  app: FastifyInstance,
  livingActionPlanner: LivingActionPlannerService
): Promise<void> {
  app.get(
    "/living-action-planner",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingActionPlanner.getExperience(request.authContext!, query));
    }
  );

  app.get(
    "/living-action-planner/sections",
    { config: { authRequired: true } },
    async (request, reply) => {
      const query = request.query as { generated_at?: string };
      return reply.send(livingActionPlanner.getSections(request.authContext!, query));
    }
  );

  for (const [routeSuffix, sectionId] of Object.entries(SECTION_ROUTE_MAP)) {
    app.get(
      `/living-action-planner/${routeSuffix}`,
      { config: { authRequired: true } },
      async (request, reply) => {
        const query = request.query as { generated_at?: string };
        return reply.send(livingActionPlanner.getSection(request.authContext!, sectionId, query));
      }
    );
  }

  app.post(
    "/living-action-planner/complete",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        action_id?: string;
        title?: string;
        notes?: string;
        generated_at?: string;
      };
      return reply.send(
        livingActionPlanner.markComplete(request.authContext!, {
          action_id: body.action_id ?? "",
          title: body.title ?? "",
          notes: body.notes,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-action-planner/postpone",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as {
        action_id?: string;
        title?: string;
        notes?: string;
        generated_at?: string;
      };
      return reply.send(
        livingActionPlanner.markPostponed(request.authContext!, {
          action_id: body.action_id ?? "",
          title: body.title ?? "",
          notes: body.notes,
          generated_at: body.generated_at,
        })
      );
    }
  );

  app.post(
    "/living-action-planner/refresh",
    { config: { authRequired: true } },
    async (request, reply) => {
      const body = (request.body ?? {}) as { generated_at?: string };
      return reply.send(livingActionPlanner.refresh(request.authContext!, body));
    }
  );

  app.get(
    "/living-action-planner/statistics",
    { config: { authRequired: true } },
    async (request, reply) => {
      return reply.send(livingActionPlanner.getStatistics(request.authContext!));
    }
  );

  app.get(
    "/living-action-planner/section/:sectionId",
    { config: { authRequired: true } },
    async (request, reply) => {
      const { sectionId } = request.params as { sectionId: string };
      const query = request.query as { generated_at?: string };
      return reply.send(
        livingActionPlanner.getSection(request.authContext!, parseSectionId(sectionId), query)
      );
    }
  );
}
