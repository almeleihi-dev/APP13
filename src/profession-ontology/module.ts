export {
  PROFESSION_ONTOLOGY_JSON_SCHEMA,
  PROFESSION_ONTOLOGY_ROUTES,
  PROFESSION_ONTOLOGY_SCHEMA_VERSION,
  ACTION_DECOMPOSITION_CLASSES,
  HIERARCHY_LEVELS,
} from "./domain/profession-schema.js";
export {
  buildProfessionOntologyCenter,
  collectProfessionOntologyPaths,
  toProfessionClassificationView,
  toProfessionOntologyCenterView,
  toProfessionOntologyEntryView,
  type ProfessionClassification,
  type ProfessionGraph,
  type ProfessionOntologyEntry,
  type ProfessionOntologyEntryView,
} from "./domain/profession-ontology.js";
export {
  classifyProfessionInput,
  transformProfessionInput,
  resolveAlias,
} from "./domain/profession-classifier.js";
export {
  buildSeedProfessionRegistry,
  buildGlobalProfessionHierarchy,
  getSeedProfessionById,
} from "./domain/profession-registry.js";
export { bridgeProfessionGraphToBlueprintDraft } from "./domain/blueprint-bridge.js";
export {
  ProfessionOntologyService,
  createProfessionOntologyModule,
  createProfessionOntologyService,
  type ProfessionOntologyModule,
} from "./application/profession-ontology-service.js";
export {
  ProfessionOntologyRepository,
  createProfessionOntologyRepository,
  professionOntologyRepository,
} from "./infrastructure/profession-ontology-repository.js";
