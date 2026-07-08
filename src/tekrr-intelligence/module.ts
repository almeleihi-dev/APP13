export {
  TEKRR_INTELLIGENCE_JSON_SCHEMA,
  TEKRR_INTELLIGENCE_ROUTES,
  TEKRR_INTELLIGENCE_SCHEMA_VERSION,
  TEKRR_PROFILE_STATUSES,
  SKILL_LEVELS,
  EVIDENCE_LEVELS,
  AUTOMATION_LEVELS,
  DEPENDENCY_COMPLEXITY_LEVELS,
} from "./domain/tekrr-schema.js";
export {
  buildTekrrIntelligenceCenter,
  collectTekrrIntelligencePaths,
  toTekrrExecutionProfileView,
  toTekrrIntelligenceCenterView,
  toTekrrValidationReportView,
  type TekrrExecutionProfile,
  type TekrrExecutionProfileView,
  type TekrrIntelligenceCenterView,
  type ProjectContextHint,
} from "./domain/tekrr-profile.js";
export {
  synthesizeTekrrProfile,
  synthesizeDimension,
  buildTekrrCompilePreview,
} from "./domain/tekrr-synthesizer.js";
export { validateTekrrProfile } from "./domain/tekrr-validator.js";
export { computeExecutionScore, scoreTekrrProfile } from "./domain/tekrr-scoring.js";
export { buildRiskModel } from "./domain/risk-model.js";
export { buildResourceModel } from "./domain/resource-model.js";
export {
  TekrrIntelligenceService,
  createTekrrIntelligenceModule,
  createTekrrIntelligenceService,
  type TekrrIntelligenceModule,
} from "./application/tekrr-intelligence-service.js";
export {
  TekrrIntelligenceRepository,
  createTekrrIntelligenceRepository,
  tekrrIntelligenceRepository,
} from "./infrastructure/tekrr-intelligence-repository.js";
