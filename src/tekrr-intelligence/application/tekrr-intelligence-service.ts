import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import {
  fromActionBlueprintView,
  type ActionBlueprint,
  type ActionBlueprintView,
} from "../../action-blueprint/domain/action-blueprint.js";
import {
  createActionBlueprintRepository,
  type ActionBlueprintRepository,
} from "../../action-blueprint/infrastructure/action-blueprint-repository.js";
import {
  createProjectDecompositionRepository,
  type ProjectDecompositionRepository,
} from "../../project-decomposition/infrastructure/project-decomposition-repository.js";
import { TEKRR_INTELLIGENCE_JSON_SCHEMA } from "../domain/tekrr-schema.js";
import {
  buildTekrrCompilePreview,
  synthesizeDimension,
  synthesizeTekrrProfile,
} from "../domain/tekrr-synthesizer.js";
import { scoreTekrrProfile } from "../domain/tekrr-scoring.js";
import { validateTekrrProfile } from "../domain/tekrr-validator.js";
import {
  buildTekrrIntelligenceCenter,
  toTekrrExecutionProfileView,
  toTekrrIntelligenceCenterView,
  toTekrrValidationReportView,
  type ProjectContextHint,
  type TekrrExecutionProfile,
  type TekrrExecutionProfileView,
  type TekrrIntelligenceCenterView,
} from "../domain/tekrr-profile.js";
import {
  createTekrrIntelligenceRepository,
  type TekrrIntelligenceRepository,
} from "../infrastructure/tekrr-intelligence-repository.js";

export class TekrrIntelligenceService {
  private readonly repository: TekrrIntelligenceRepository;
  private readonly blueprintRepository: ActionBlueprintRepository;
  private readonly projectRepository: ProjectDecompositionRepository;

  constructor(deps?: {
    repository?: TekrrIntelligenceRepository;
    blueprintRepository?: ActionBlueprintRepository;
    projectRepository?: ProjectDecompositionRepository;
  }) {
    this.repository = deps?.repository ?? createTekrrIntelligenceRepository();
    this.blueprintRepository = deps?.blueprintRepository ?? createActionBlueprintRepository();
    this.projectRepository = deps?.projectRepository ?? createProjectDecompositionRepository();
  }

  getCenter(authContext: AuthContext): TekrrIntelligenceCenterView {
    this.assertAuthenticated(authContext);
    const center = buildTekrrIntelligenceCenter({
      presetCount: this.repository.getPresetCount(),
      publishedPresetCount: this.repository.getPublishedPresetCount(),
    });
    return toTekrrIntelligenceCenterView(center);
  }

  getOverview(authContext: AuthContext): TekrrIntelligenceCenterView["overview"] {
    return this.getCenter(authContext).overview;
  }

  synthesize(
    authContext: AuthContext,
    input: {
      blueprint?: ActionBlueprintView;
      blueprint_id?: string;
      version?: string;
      project_id?: string;
      project_context?: ProjectContextHint;
    }
  ) {
    this.assertAuthenticated(authContext);
    const blueprint = this.resolveBlueprint(input);
    const projectContext = this.resolveProjectContext(input);
    const profile = synthesizeTekrrProfile({ blueprint, projectContext });
    const preview = buildTekrrCompilePreview(profile);
    return {
      profile: toTekrrExecutionProfileView(preview.profile),
      preview_only: preview.preview_only,
      field_checklist: preview.field_checklist,
      summary: preview.summary,
    };
  }

  validate(
    authContext: AuthContext,
    input: { profile: TekrrExecutionProfileView } | { blueprint?: ActionBlueprintView; blueprint_id?: string }
  ) {
    this.assertAuthenticated(authContext);
    const profile =
      "profile" in input
        ? this.fromProfileView(input.profile)
        : synthesizeTekrrProfile({ blueprint: this.resolveBlueprint(input) });
    return toTekrrValidationReportView(validateTekrrProfile(profile));
  }

  score(
    authContext: AuthContext,
    input: { profile?: TekrrExecutionProfileView; blueprint?: ActionBlueprintView; blueprint_id?: string }
  ) {
    this.assertAuthenticated(authContext);
    const profile = input.profile
      ? this.fromProfileView(input.profile)
      : synthesizeTekrrProfile({ blueprint: this.resolveBlueprint(input) });
    return scoreTekrrProfile(profile);
  }

  synthesizeTime(authContext: AuthContext, input: { blueprint?: ActionBlueprintView; blueprint_id?: string }) {
    this.assertAuthenticated(authContext);
    return synthesizeDimension(this.resolveBlueprint(input), "time");
  }

  synthesizeEffort(authContext: AuthContext, input: { blueprint?: ActionBlueprintView; blueprint_id?: string }) {
    this.assertAuthenticated(authContext);
    return synthesizeDimension(this.resolveBlueprint(input), "effort");
  }

  synthesizeKnowledge(authContext: AuthContext, input: { blueprint?: ActionBlueprintView; blueprint_id?: string }) {
    this.assertAuthenticated(authContext);
    return synthesizeDimension(this.resolveBlueprint(input), "knowledge");
  }

  synthesizeRisk(authContext: AuthContext, input: { blueprint?: ActionBlueprintView; blueprint_id?: string }) {
    this.assertAuthenticated(authContext);
    return synthesizeDimension(this.resolveBlueprint(input), "risk");
  }

  synthesizeResources(authContext: AuthContext, input: { blueprint?: ActionBlueprintView; blueprint_id?: string }) {
    this.assertAuthenticated(authContext);
    return synthesizeDimension(this.resolveBlueprint(input), "resources");
  }

  getSchema(authContext: AuthContext): typeof TEKRR_INTELLIGENCE_JSON_SCHEMA {
    this.assertAuthenticated(authContext);
    return TEKRR_INTELLIGENCE_JSON_SCHEMA;
  }

  listPresets(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const presets = this.repository.listPresets();
    return {
      presets: presets.map((entry) => ({
        primary_taxonomy_code: entry.profile.primaryTaxonomyCode,
        blueprint_id: entry.profile.blueprintId,
        profile_id: entry.profile.profileId,
        status: entry.status,
        label: entry.label,
        execution_score: entry.profile.executionScore.score,
        published_at: entry.publishedAt,
      })),
      total_count: presets.length,
      summary: `TEKRR synthesis presets: ${presets.length} entries.`,
    };
  }

  publish(
    authContext: AuthContext,
    input: {
      blueprint?: ActionBlueprintView;
      blueprint_id?: string;
      label: string;
      project_context?: ProjectContextHint;
    }
  ) {
    this.assertPlatformAdmin(authContext);
    const blueprint = this.resolveBlueprint(input);
    const profile = synthesizeTekrrProfile({
      blueprint,
      projectContext: input.project_context,
    });
    const entry = this.repository.publishPreset({ profile, label: input.label });
    return {
      profile_id: entry.profile.profileId,
      primary_taxonomy_code: entry.profile.primaryTaxonomyCode,
      blueprint_id: entry.profile.blueprintId,
      status: entry.status,
      published_at: entry.publishedAt,
      summary: `Published TEKRR synthesis preset ${entry.profile.profileId}.`,
    };
  }

  deprecate(
    authContext: AuthContext,
    input: {
      primary_taxonomy_code: string;
      blueprint_id: string;
      successor_taxonomy_code?: string;
    }
  ) {
    this.assertPlatformAdmin(authContext);
    const entry = this.repository.deprecatePreset({
      primaryTaxonomyCode: input.primary_taxonomy_code,
      blueprintId: input.blueprint_id,
      successorTaxonomyCode: input.successor_taxonomy_code,
    });
    return {
      profile_id: entry.profile.profileId,
      status: entry.status,
      deprecated_at: entry.deprecatedAt,
      deprecated_by: entry.deprecatedBy,
      summary: `Deprecated TEKRR synthesis preset ${entry.profile.profileId}.`,
    };
  }

  private resolveBlueprint(input: {
    blueprint?: ActionBlueprintView;
    blueprint_id?: string;
    version?: string;
  }): ActionBlueprint {
    if (input.blueprint) {
      return fromActionBlueprintView(input.blueprint);
    }
    if (input.blueprint_id) {
      const entry = input.version
        ? this.blueprintRepository.getPublishedVersion(input.blueprint_id, input.version)
        : this.blueprintRepository.getLatestPublished(input.blueprint_id);
      if (!entry) {
        throw new Error(`Blueprint not found: ${input.blueprint_id}`);
      }
      return entry.blueprint;
    }
    throw new Error("blueprint or blueprint_id is required");
  }

  private resolveProjectContext(input: {
    project_id?: string;
    project_context?: ProjectContextHint;
  }): ProjectContextHint | undefined {
    if (input.project_context) {
      return input.project_context;
    }
    if (!input.project_id) {
      return undefined;
    }
    const graph = this.projectRepository.getGraph(input.project_id);
    if (!graph) {
      throw new Error(`Project graph not found: ${input.project_id}`);
    }
    return {
      node_count: graph.nodes.length,
      edge_count: graph.edges.length,
      parallel_group_count: graph.parallelGroups.length,
    };
  }

  private fromProfileView(view: TekrrExecutionProfileView): TekrrExecutionProfile {
    return {
      profileId: view.profile_id,
      blueprintId: view.blueprint_id,
      primaryTaxonomyCode: view.primary_taxonomy_code,
      domain: view.domain,
      templateId: view.template_id,
      status: view.status,
      schemaVersion: view.schema_version,
      timeModel: view.time_model,
      effortModel: view.effort_model,
      knowledgeModel: view.knowledge_model,
      riskModel: view.risk_model,
      resourceModel: view.resource_model,
      skillLevel: view.skill_level,
      requiredLicenses: view.required_licenses,
      requiredTools: view.required_tools,
      requiredEvidenceLevel: view.required_evidence_level,
      automationPotential: view.automation_potential,
      parallelExecutionCapability: view.parallel_execution_capability,
      dependencyComplexity: view.dependency_complexity,
      executionScore: view.execution_score,
      validationRules: view.validation_rules,
      synthesisTrace: view.synthesis_trace,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createTekrrIntelligenceService(deps?: {
  repository?: TekrrIntelligenceRepository;
  blueprintRepository?: ActionBlueprintRepository;
  projectRepository?: ProjectDecompositionRepository;
}): TekrrIntelligenceService {
  return new TekrrIntelligenceService(deps);
}

export function createTekrrIntelligenceModule(deps?: { rootDir?: string }) {
  const rootDir = deps?.rootDir;
  const repository = createTekrrIntelligenceRepository({ rootDir });
  const blueprintRepository = createActionBlueprintRepository({ rootDir });
  const projectRepository = createProjectDecompositionRepository({ rootDir });
  const tekrrIntelligence = createTekrrIntelligenceService({
    repository,
    blueprintRepository,
    projectRepository,
  });
  return { tekrrIntelligence };
}

export type TekrrIntelligenceModule = ReturnType<typeof createTekrrIntelligenceModule>;
