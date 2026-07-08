export {
  ACTION_ONTOLOGY_SCHEMA_VERSION,
  ACTION_ONTOLOGY_JSON_SCHEMA,
  ACTION_ONTOLOGY_FIXED_TIMESTAMP,
  ACTION_ONTOLOGY_ROUTES,
  ACTION_FAMILIES,
  ACTION_TYPES,
  RELATIONSHIP_TYPES,
  ONTOLOGY_CHAIN,
  type ActionFamilyId,
  type ActionType,
  type RelationshipType,
} from "./domain/action-ontology-schema.js";

export type {
  CanonicalAction,
  ActionCategory,
  ActionPrecondition,
  ActionEvidenceRequirement,
  ActionOntologyNode,
  ActionRelationship,
  ActionOntologyValidation,
  ActionOntologySummary,
  CanonicalActionSkill,
  CanonicalActionResource,
  CanonicalActionRiskSignal,
} from "./domain/canonical-action.js";

export {
  CANONICAL_ACTIONS,
  listCanonicalActions,
  getCanonicalActionById,
  getPrimaryActionForFamily,
} from "./domain/ontology-seeds.js";

export {
  buildActionOntologyHome,
  toCanonicalActionsScreen,
  toActionRelationshipsScreen,
  toActionOntologyValidationScreen,
  toActionOntologySummaryScreen,
  collectActionOntologyPaths,
  FAMILY_LABELS,
  type ActionOntologyHome,
  type CanonicalActionsScreen,
  type ActionRelationshipsScreen,
  type ActionOntologyValidationScreen,
  type ActionOntologySummaryScreen,
} from "./domain/action-ontology-screens.js";

export {
  C1_SCENARIO_TO_CANONICAL_ACTION,
  C1_SCENARIO_TO_FAMILY,
  resolveCanonicalActionIdFromScenario,
  resolveFamilyFromScenario,
} from "./application/c1-ontology-bridge.js";

export {
  CanonicalActionResolver,
  createCanonicalActionResolver,
} from "./application/canonical-action-resolver.js";

export {
  ActionOntologyClassifier,
  createActionOntologyClassifier,
} from "./application/action-ontology-classifier.js";

export {
  ActionRelationshipBuilder,
  createActionRelationshipBuilder,
} from "./application/action-relationship-builder.js";

export {
  ActionOntologyValidator,
  createActionOntologyValidator,
} from "./application/action-ontology-validator.js";

export {
  ActionOntologySummaryBuilder,
  createActionOntologySummaryBuilder,
} from "./application/action-ontology-summary-builder.js";

export {
  ActionOntologyService,
  createActionOntologyService,
  createActionOntologyModule,
  type ActionOntologyModule,
  type ActionOntologyQuery,
} from "./application/action-ontology-service.js";

export {
  ActionOntologyRepository,
  createActionOntologyRepository,
} from "./infrastructure/action-ontology-repository.js";
