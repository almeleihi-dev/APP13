import type { DbPool } from "../../shared/db/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { requireEmailVerifiedForActionCreate } from "../../identity/domain/index.js";
import { getTemplateByActionCode } from "../../contract/templates/registry.js";
import {
  computeTekrrCompleteness,
  getActionType,
  listActionTypes as listMvpActionTypes,
  type Action,
  type TekrrDimension,
} from "../domain/index.js";
import { ActionRepository, actionRepository } from "../infrastructure/action-repository.js";

export class ActionService {
  constructor(
    private readonly db: DbPool,
    private readonly identityRepo: IdentityRepository,
    private readonly actions: ActionRepository = actionRepository
  ) {}

  async createAction(
    userId: string,
    input: { action_type_code: string; title: string; description?: string }
  ) {
    const user = await this.identityRepo.findUserById(this.db.pool, userId);
    if (!user) throw notFound();
    requireEmailVerifiedForActionCreate(user);

    const customer = await this.identityRepo.findCustomerByUserId(this.db.pool, userId);
    if (!customer) {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.FORBIDDEN,
          engine: "action",
          detail: "Customer profile required",
        })
      );
    }

    const actionType = getActionType(input.action_type_code);
    if (!actionType) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "action",
          detail: "Unknown action_type_code",
        })
      );
    }

    const action = await this.actions.create(this.db.pool, {
      actionCode: actionType.actionCode,
      actionName: actionType.actionName,
      domain: actionType.domain,
      customerId: customer.id,
      title: input.title,
      description: input.description,
      templateId: actionType.templateId,
    });
    return this.toActionResponse(action);
  }

  async getAction(actionId: string, userId: string) {
    const action = await this.requireActionAccess(actionId, userId);
    return this.toActionResponse(action);
  }

  async listActions(userId: string) {
    const customer = await this.identityRepo.findCustomerByUserId(this.db.pool, userId);
    const provider = await this.identityRepo.findProviderByUserId(this.db.pool, userId);
    if (customer) {
      const actions = await this.actions.listByCustomer(this.db.pool, customer.id);
      return {
        data: actions.map((a: Action) => this.toActionResponse(a)),
        meta: { has_more: false },
      };
    }
    if (provider) {
      const result = await this.db.query(
        `SELECT * FROM action.actions WHERE provider_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [provider.id]
      );
      return {
        data: result.rows.map((row) =>
          this.toActionResponse({
            id: row.id,
            actionCode: row.action_code,
            actionName: row.action_name,
            domain: row.domain,
            status: row.status,
            customerId: row.customer_id,
            providerId: row.provider_id,
            invitedProviderEmail: row.invited_provider_email,
            companyId: row.company_id,
            title: row.title,
            description: row.description,
            tekrrProfile: row.tekrr_profile,
            tekrrCompleteness: row.tekrr_completeness,
            tekrrFrameworkVersion: row.tekrr_framework_version,
            templateId: row.template_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          } as Action)
        ),
        meta: { has_more: false },
      };
    }
    return { data: [], meta: { has_more: false } };
  }

  async updateTekrrDimension(
    actionId: string,
    userId: string,
    dimension: TekrrDimension,
    data: Record<string, unknown>
  ) {
    const action = await this.requireActionAccess(actionId, userId);
    if (!["draft", "tekrr_in_progress", "ready_for_contract"].includes(action.status)) {
      throw new AppError(
        problem({
          title: "Conflict",
          status: 409,
          code: ErrorCodes.INVALID_TRANSITION,
          engine: "action",
          detail: "TEKRR locked after contract generation",
        })
      );
    }
    const template = getTemplateByActionCode(action.actionCode);
    if (!template) throw notFound();

    const profile = {
      ...action.tekrrProfile,
      [dimension]: { ...action.tekrrProfile[dimension], ...data },
    };
    const completeness = computeTekrrCompleteness(profile, template.requiredTekrrFields);
    const nextStatus =
      completeness >= 100 && action.providerId ? "ready_for_contract" : "tekrr_in_progress";

    const updated = await this.actions.updateTekrr(
      this.db.pool,
      actionId,
      profile,
      completeness,
      nextStatus as Action["status"]
    );
    return this.toActionResponse(updated);
  }

  async transitionAction(actionId: string, userId: string, transition: string) {
    const action = await this.requireActionAccess(actionId, userId);
    if (transition === "mark_ready" && action.tekrrCompleteness >= 100) {
      const updated = await this.actions.transition(
        this.db.pool,
        actionId,
        "ready_for_contract",
        userId,
        action.status
      );
      if (!updated) throw conflictTransition();
      return this.toActionResponse(updated);
    }
    throw conflictTransition();
  }

  async assignProvider(actionId: string, userId: string, providerId: string) {
    await this.requireActionAccess(actionId, userId);
    const updated = await this.actions.setProvider(this.db.pool, actionId, providerId);
    const template = getTemplateByActionCode(updated.actionCode);
    if (template && updated.tekrrCompleteness >= 100 && updated.status !== "ready_for_contract") {
      await this.actions.transition(
        this.db.pool,
        actionId,
        "ready_for_contract",
        userId,
        updated.status
      );
      const refreshed = await this.actions.findById(this.db.pool, actionId);
      return this.toActionResponse(refreshed!);
    }
    return this.toActionResponse(updated);
  }

  listActionTypes() {
    return {
      data: listMvpActionTypes().map((t) => ({
        action_type_code: t.actionCode,
        action_name: t.actionName,
        domain: t.domain,
        template_id: t.templateId,
      })),
    };
  }

  private async requireActionAccess(actionId: string, userId: string): Promise<Action> {
    const action = await this.actions.findById(this.db.pool, actionId);
    if (!action) throw notFound();
    const customer = await this.identityRepo.findCustomerByUserId(this.db.pool, userId);
    const provider = await this.identityRepo.findProviderByUserId(this.db.pool, userId);
    const allowed =
      (customer && customer.id === action.customerId) ||
      (provider && action.providerId === provider.id);
    if (!allowed) throw notFound();
    return action;
  }

  toActionResponse(action: Action) {
    return {
      id: action.id,
      action_type_code: action.actionCode,
      status: action.status,
      tekrr_completeness: action.tekrrCompleteness,
      title: action.title,
      customer_id: action.customerId,
      provider_id: action.providerId,
    };
  }
}

function conflictTransition(): AppError {
  return new AppError(
    problem({
      title: "Conflict",
      status: 409,
      code: ErrorCodes.INVALID_TRANSITION,
      engine: "action",
      detail: "Invalid action transition",
    })
  );
}

export function createActionService(
  db: DbPool,
  identityRepo: IdentityRepository
): ActionService {
  return new ActionService(db, identityRepo);
}
