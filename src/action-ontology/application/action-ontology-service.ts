import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { ScenarioId } from "../../unified-action-intelligence/domain/action-intelligence-schema.js";
import {
  ACTION_FAMILIES,
  ACTION_ONTOLOGY_JSON_SCHEMA,
  ACTION_ONTOLOGY_ROUTES,
  ACTION_ONTOLOGY_SCHEMA_VERSION,
  type ActionFamilyId,
} from "../domain/action-ontology-schema.js";
import {
  buildActionOntologyHome,
  toActionOntologySummaryScreen,
  toActionOntologyValidationScreen,
  toActionRelationshipsScreen,
  toCanonicalActionsScreen,
} from "../domain/action-ontology-screens.js";
import { createCanonicalActionResolver } from "./canonical-action-resolver.js";
import { createActionRelationshipBuilder } from "./action-relationship-builder.js";
import { createActionOntologyValidator } from "./action-ontology-validator.js";
import { createActionOntologySummaryBuilder } from "./action-ontology-summary-builder.js";
import {
  resolveCanonicalActionIdFromScenario,
  resolveFamilyFromScenario,
} from "./c1-ontology-bridge.js";
import {
  createActionOntologyRepository,
  type ActionOntologyRepository,
} from "../infrastructure/action-ontology-repository.js";

export interface ActionOntologyQuery {
  family?: ActionFamilyId;
  action_id?: string;
  scenario_id?: ScenarioId;
}

export class ActionOntologyService {
  private readonly repository: ActionOntologyRepository;
  private readonly resolver = createCanonicalActionResolver();
  private readonly relationshipBuilder = createActionRelationshipBuilder();
  private readonly validator = createActionOntologyValidator();
  private readonly summaryBuilder = createActionOntologySummaryBuilder();

  constructor(deps?: { repository?: ActionOntologyRepository }) {
    this.repository = deps?.repository ?? createActionOntologyRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return buildActionOntologyHome({
      actions: this.repository.listActions(),
      families: this.repository.getPrimaryActionsByFamily(),
    });
  }

  getActions(authContext: AuthContext, query: ActionOntologyQuery = {}) {
    this.assertAuthenticated(authContext);
    const resolved = this.resolveQuery(query);
    let actions = this.repository.listActions();

    if (resolved.actionId) {
      const action = this.resolver.resolveById(resolved.actionId);
      actions = action ? [action] : [];
    } else if (resolved.familyId) {
      actions = this.resolver.resolveByFamily(resolved.familyId);
    }

    return toCanonicalActionsScreen(actions, resolved.familyId ?? null);
  }

  getRelationships(authContext: AuthContext, query: ActionOntologyQuery = {}) {
    this.assertAuthenticated(authContext);
    const resolved = this.resolveQuery(query);
    const relationships = resolved.actionId
      ? this.relationshipBuilder.buildForAction(resolved.actionId)
      : this.relationshipBuilder.buildAll();

    return toActionRelationshipsScreen(resolved.actionId ?? null, relationships);
  }

  validate(authContext: AuthContext, query: ActionOntologyQuery = {}) {
    this.assertAuthenticated(authContext);
    const resolved = this.resolveQuery(query);
    const validation = resolved.actionId
      ? (() => {
          const action = this.resolver.resolveById(resolved.actionId);
          if (!action) {
            return {
              valid: false,
              completenessScore: 0,
              actionCount: 0,
              familyCount: 0,
              missingFields: [`action:${resolved.actionId}`],
              warnings: [],
              summary: `Unknown canonical action: ${resolved.actionId}`,
            };
          }
          return this.validator.validateAction(action);
        })()
      : this.validator.validateCatalog(this.repository.listActions());

    return toActionOntologyValidationScreen(validation);
  }

  getSummary(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const actions = this.repository.listActions();
    const relationships = this.relationshipBuilder.buildAll();
    const summary = this.summaryBuilder.build({ actions, relationships });
    return toActionOntologySummaryScreen(summary);
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: ACTION_ONTOLOGY_SCHEMA_VERSION,
      routes: ACTION_ONTOLOGY_ROUTES,
      families: ACTION_FAMILIES,
      json_schema: ACTION_ONTOLOGY_JSON_SCHEMA,
      read_only: true,
    };
  }

  resolveFromC1Scenario(authContext: AuthContext, scenarioId: ScenarioId) {
    this.assertAuthenticated(authContext);
    const canonicalActionId = resolveCanonicalActionIdFromScenario(scenarioId);
    const familyId = resolveFamilyFromScenario(scenarioId);
    const action = this.resolver.resolveById(canonicalActionId);
    return {
      scenario_id: scenarioId,
      canonical_action_id: canonicalActionId,
      family_id: familyId,
      action: action
        ? toCanonicalActionsScreen([action], familyId).actions[0]
        : null,
      read_only: true,
    };
  }

  private resolveQuery(query: ActionOntologyQuery): {
    actionId?: string;
    familyId?: ActionFamilyId;
  } {
    if (query.scenario_id) {
      return {
        actionId: resolveCanonicalActionIdFromScenario(query.scenario_id),
        familyId: resolveFamilyFromScenario(query.scenario_id),
      };
    }
    if (query.action_id) {
      const action = this.resolver.resolveById(query.action_id);
      return {
        actionId: query.action_id,
        familyId: action?.category,
      };
    }
    if (query.family) {
      return { familyId: query.family };
    }
    return {};
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

export function createActionOntologyService(
  deps?: ConstructorParameters<typeof ActionOntologyService>[0]
): ActionOntologyService {
  return new ActionOntologyService(deps);
}

export function createActionOntologyModule(deps?: {
  repository?: ActionOntologyRepository;
}) {
  const actionOntology = createActionOntologyService(deps);
  return { actionOntology };
}

export type ActionOntologyModule = ReturnType<typeof createActionOntologyModule>;
