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
import type { ProjectContextHint } from "../../tekrr-intelligence/domain/tekrr-profile.js";
import { EXECUTION_BLUEPRINT_JSON_SCHEMA } from "../domain/execution-schema.js";
import {
  buildExecutionCompilePreview,
  compileExecutionBlueprint,
} from "../domain/execution-compiler.js";
import {
  buildExecutionBlueprintCenter,
  fromExecutionBlueprintView,
  toExecutionBlueprintCenterView,
  toExecutionBlueprintView,
  toExecutionValidationReportView,
  validateExecutionBlueprint,
  type ExecutionBlueprintView,
  type ExecutionBlueprintCenterView,
} from "../domain/execution-blueprint.js";
import {
  listStandardEvidencePatterns,
  listStandardMilestonePatterns,
} from "../domain/milestone-pattern.js";
import { listStandardQualityGateTemplates } from "../domain/quality-gates.js";
import {
  createExecutionBlueprintRepository,
  type ExecutionBlueprintRepository,
} from "../infrastructure/execution-blueprint-repository.js";

export class ExecutionBlueprintService {
  private readonly repository: ExecutionBlueprintRepository;
  private readonly blueprintRepository: ActionBlueprintRepository;
  private readonly projectRepository: ProjectDecompositionRepository;

  constructor(deps?: {
    repository?: ExecutionBlueprintRepository;
    blueprintRepository?: ActionBlueprintRepository;
    projectRepository?: ProjectDecompositionRepository;
  }) {
    this.repository = deps?.repository ?? createExecutionBlueprintRepository();
    this.blueprintRepository = deps?.blueprintRepository ?? createActionBlueprintRepository();
    this.projectRepository = deps?.projectRepository ?? createProjectDecompositionRepository();
  }

  getCenter(authContext: AuthContext): ExecutionBlueprintCenterView {
    this.assertAuthenticated(authContext);
    const center = buildExecutionBlueprintCenter({
      patternCount: this.repository.getPatternCount(),
      publishedPatternCount: this.repository.getPublishedPatternCount(),
    });
    return toExecutionBlueprintCenterView(center);
  }

  getOverview(authContext: AuthContext): ExecutionBlueprintCenterView["overview"] {
    return this.getCenter(authContext).overview;
  }

  compile(
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
    const preview = buildExecutionCompilePreview({ blueprint, projectContext });
    return {
      execution_blueprint: toExecutionBlueprintView(preview.executionBlueprint),
      preview_only: preview.preview_only,
      template_id: preview.template_id,
      contract_compatible: preview.contract_compatible,
      summary: preview.summary,
    };
  }

  preview(
    authContext: AuthContext,
    input: {
      blueprint?: ActionBlueprintView;
      blueprint_id?: string;
      version?: string;
      project_id?: string;
      project_context?: ProjectContextHint;
    }
  ) {
    return this.compile(authContext, input);
  }

  validate(
    authContext: AuthContext,
    input:
      | { execution_blueprint: ExecutionBlueprintView }
      | { blueprint?: ActionBlueprintView; blueprint_id?: string; version?: string }
  ) {
    this.assertAuthenticated(authContext);
    const executionBlueprint =
      "execution_blueprint" in input
        ? fromExecutionBlueprintView(input.execution_blueprint)
        : compileExecutionBlueprint({ blueprint: this.resolveBlueprint(input) });
    return toExecutionValidationReportView(validateExecutionBlueprint(executionBlueprint));
  }

  getSchema(authContext: AuthContext): typeof EXECUTION_BLUEPRINT_JSON_SCHEMA {
    this.assertAuthenticated(authContext);
    return EXECUTION_BLUEPRINT_JSON_SCHEMA;
  }

  getPatterns(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      milestone_patterns: listStandardMilestonePatterns(),
      evidence_patterns: listStandardEvidencePatterns(),
      quality_gate_templates: listStandardQualityGateTemplates(),
      summary: "Standard milestone, evidence, and quality gate patterns.",
    };
  }

  getMilestones(authContext: AuthContext, blueprintId: string, version?: string) {
    this.assertAuthenticated(authContext);
    const blueprint = this.resolveBlueprint({ blueprint_id: blueprintId, version });
    const executionBlueprint = compileExecutionBlueprint({ blueprint });
    return {
      blueprint_id: blueprint.blueprintId,
      milestones: executionBlueprint.milestones,
      parallel_groups: executionBlueprint.parallelGroups,
      estimated_duration_hours: executionBlueprint.estimatedDurationHours,
      summary: `Milestones for ${blueprint.blueprintId}: ${executionBlueprint.milestones.length} entries.`,
    };
  }

  getEvidence(authContext: AuthContext, blueprintId: string, version?: string) {
    this.assertAuthenticated(authContext);
    const blueprint = this.resolveBlueprint({ blueprint_id: blueprintId, version });
    const executionBlueprint = compileExecutionBlueprint({ blueprint });
    return {
      blueprint_id: blueprint.blueprintId,
      evidence_requirements: executionBlueprint.evidenceRequirements,
      summary: `Evidence requirements for ${blueprint.blueprintId}: ${executionBlueprint.evidenceRequirements.length} entries.`,
    };
  }

  getQualityGates(authContext: AuthContext, blueprintId: string, version?: string) {
    this.assertAuthenticated(authContext);
    const blueprint = this.resolveBlueprint({ blueprint_id: blueprintId, version });
    const executionBlueprint = compileExecutionBlueprint({ blueprint });
    return {
      blueprint_id: blueprint.blueprintId,
      quality_gates: executionBlueprint.qualityGates,
      summary: `Quality gates for ${blueprint.blueprintId}: ${executionBlueprint.qualityGates.length} entries.`,
    };
  }

  getPaymentGates(authContext: AuthContext, blueprintId: string, version?: string) {
    this.assertAuthenticated(authContext);
    const blueprint = this.resolveBlueprint({ blueprint_id: blueprintId, version });
    const executionBlueprint = compileExecutionBlueprint({ blueprint });
    return {
      blueprint_id: blueprint.blueprintId,
      payment_gates: executionBlueprint.paymentGates.map((gate) => ({
        gateId: gate.gateId,
        milestoneCode: gate.milestoneCode,
        releaseType: gate.releaseType,
        percentageHint: gate.percentageHint,
        blocking: gate.blocking,
        preview_only: true,
        summary: gate.summary,
      })),
      summary: `Payment gate preview for ${blueprint.blueprintId}: ${executionBlueprint.paymentGates.length} gates.`,
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
    const executionBlueprint = compileExecutionBlueprint({
      blueprint,
      projectContext: input.project_context,
    });
    const entry = this.repository.publishPattern({
      executionBlueprint,
      label: input.label,
    });
    return {
      execution_blueprint_id: entry.executionBlueprint.executionBlueprintId,
      primary_taxonomy_code: entry.executionBlueprint.primaryTaxonomyCode,
      blueprint_id: entry.executionBlueprint.blueprintId,
      status: entry.status,
      published_at: entry.publishedAt,
      summary: `Published execution pattern ${entry.executionBlueprint.executionBlueprintId}.`,
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
    const entry = this.repository.deprecatePattern({
      primaryTaxonomyCode: input.primary_taxonomy_code,
      blueprintId: input.blueprint_id,
      successorTaxonomyCode: input.successor_taxonomy_code,
    });
    return {
      execution_blueprint_id: entry.executionBlueprint.executionBlueprintId,
      status: entry.status,
      deprecated_at: entry.deprecatedAt,
      deprecated_by: entry.deprecatedBy,
      summary: `Deprecated execution pattern ${entry.executionBlueprint.executionBlueprintId}.`,
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

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createExecutionBlueprintService(deps?: {
  repository?: ExecutionBlueprintRepository;
  blueprintRepository?: ActionBlueprintRepository;
  projectRepository?: ProjectDecompositionRepository;
}): ExecutionBlueprintService {
  return new ExecutionBlueprintService(deps);
}

export function createExecutionBlueprintModule(deps?: { rootDir?: string }) {
  const rootDir = deps?.rootDir;
  const repository = createExecutionBlueprintRepository({ rootDir });
  const blueprintRepository = createActionBlueprintRepository({ rootDir });
  const projectRepository = createProjectDecompositionRepository({ rootDir });
  const executionBlueprint = createExecutionBlueprintService({
    repository,
    blueprintRepository,
    projectRepository,
  });
  return { executionBlueprint };
}

export type ExecutionBlueprintModule = ReturnType<typeof createExecutionBlueprintModule>;
