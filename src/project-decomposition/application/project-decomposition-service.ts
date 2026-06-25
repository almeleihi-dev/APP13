import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth, requireRole } from "../../security/guards.js";
import { PROJECT_DECOMPOSITION_JSON_SCHEMA } from "../domain/project-schema.js";
import {
  buildDependencyAudit,
} from "../domain/dependency-engine.js";
import {
  buildProjectDecompositionCenter,
  toProjectBlueprintGraphView,
  toProjectDecompositionCenterView,
  toProjectValidationReportView,
  validateProjectGraph,
  type ProjectBlueprintGraph,
  type ProjectBlueprintGraphView,
  type ProjectDecompositionCenterView,
} from "../domain/project-decomposition.js";
import { compileProjectPreview } from "../domain/project-compiler.js";
import { transformProjectInput } from "../domain/project-transform.js";
import {
  createProjectDecompositionRepository,
  type ProjectDecompositionRepository,
} from "../infrastructure/project-decomposition-repository.js";
import type { ProjectTemplateSpec } from "../domain/project-templates.js";

export class ProjectDecompositionService {
  private readonly repository: ProjectDecompositionRepository;

  constructor(repository?: ProjectDecompositionRepository) {
    this.repository = repository ?? createProjectDecompositionRepository();
  }

  getCenter(authContext: AuthContext): ProjectDecompositionCenterView {
    this.assertAuthenticated(authContext);
    const center = buildProjectDecompositionCenter({
      templateCount: this.repository.getTemplateCount(),
      publishedTemplateCount: this.repository.getPublishedTemplateCount(),
    });
    return toProjectDecompositionCenterView(center);
  }

  getOverview(authContext: AuthContext): ProjectDecompositionCenterView["overview"] {
    return this.getCenter(authContext).overview;
  }

  transform(
    authContext: AuthContext,
    input: { project_name: string; goal_text: string; constraints?: string[] }
  ): ProjectBlueprintGraphView {
    this.assertAuthenticated(authContext);
    const graph = transformProjectInput(input);
    this.repository.saveGraph(graph);
    return toProjectBlueprintGraphView(graph);
  }

  validate(authContext: AuthContext, graph: ProjectBlueprintGraph): ReturnType<typeof toProjectValidationReportView> {
    this.assertAuthenticated(authContext);
    return toProjectValidationReportView(validateProjectGraph(graph));
  }

  compilePreview(authContext: AuthContext, input: { project_id?: string; graph?: ProjectBlueprintGraph }) {
    this.assertAuthenticated(authContext);
    const graph =
      input.graph ??
      (input.project_id ? this.repository.getGraph(input.project_id) : undefined);
    if (!graph) {
      throw new Error("graph or project_id is required");
    }
    return compileProjectPreview(graph);
  }

  getSchema(authContext: AuthContext): typeof PROJECT_DECOMPOSITION_JSON_SCHEMA {
    this.assertAuthenticated(authContext);
    return PROJECT_DECOMPOSITION_JSON_SCHEMA;
  }

  listTemplates(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const templates = this.repository.listTemplates();
    return {
      templates: templates.map((entry) => ({
        template_id: entry.template.templateId,
        label: entry.template.label,
        status: entry.status,
        node_count: entry.template.nodes.length,
        phase_count: entry.template.phases.length,
        published_at: entry.publishedAt,
      })),
      total_count: templates.length,
      summary: `Project decomposition templates: ${templates.length} entries.`,
    };
  }

  getGraph(authContext: AuthContext, projectId: string): ProjectBlueprintGraphView {
    this.assertAuthenticated(authContext);
    const graph = this.repository.getGraph(projectId);
    if (!graph) {
      throw new Error(`Project graph not found: ${projectId}`);
    }
    return toProjectBlueprintGraphView(graph);
  }

  getDependencies(authContext: AuthContext, projectId: string) {
    this.assertAuthenticated(authContext);
    const graph = this.requireGraph(projectId);
    return {
      project_id: graph.projectId,
      ...buildDependencyAudit(graph),
    };
  }

  getCriticalPath(authContext: AuthContext, projectId: string) {
    this.assertAuthenticated(authContext);
    const graph = this.requireGraph(projectId);
    return {
      project_id: graph.projectId,
      critical_path: graph.criticalPath,
      parallel_groups: graph.parallelGroups,
      summary: graph.criticalPath.summary,
    };
  }

  getPhases(authContext: AuthContext, projectId: string) {
    this.assertAuthenticated(authContext);
    const graph = this.requireGraph(projectId);
    const validation = validateProjectGraph(graph);
    return {
      project_id: graph.projectId,
      phases: graph.phases,
      phase_validation: validation.phaseValidation,
      summary: `Project ${graph.projectId} has ${graph.phases.length} phases.`,
    };
  }

  publishTemplate(authContext: AuthContext, template: ProjectTemplateSpec) {
    this.assertPlatformAdmin(authContext);
    const entry = this.repository.publishTemplate(template);
    return {
      template_id: entry.template.templateId,
      status: entry.status,
      published_at: entry.publishedAt,
      summary: `Published project template ${entry.template.templateId}.`,
    };
  }

  deprecateTemplate(
    authContext: AuthContext,
    input: { template_id: string; successor_template_id?: string }
  ) {
    this.assertPlatformAdmin(authContext);
    const entry = this.repository.deprecateTemplate({
      templateId: input.template_id,
      successorTemplateId: input.successor_template_id,
    });
    return {
      template_id: entry.template.templateId,
      status: entry.status,
      deprecated_at: entry.deprecatedAt,
      deprecated_by: entry.deprecatedBy,
      summary: `Deprecated project template ${entry.template.templateId}.`,
    };
  }

  private requireGraph(projectId: string): ProjectBlueprintGraph {
    const graph = this.repository.getGraph(projectId);
    if (!graph) {
      throw new Error(`Project graph not found: ${projectId}`);
    }
    return graph;
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }

  private assertPlatformAdmin(authContext: AuthContext): void {
    requireRole(authContext, "platform_admin");
  }
}

export function createProjectDecompositionService(
  repository?: ProjectDecompositionRepository
): ProjectDecompositionService {
  return new ProjectDecompositionService(repository);
}

export function createProjectDecompositionModule(deps?: { rootDir?: string }) {
  const repository = createProjectDecompositionRepository({ rootDir: deps?.rootDir });
  const projectDecomposition = createProjectDecompositionService(repository);
  return { projectDecomposition };
}

export type ProjectDecompositionModule = ReturnType<typeof createProjectDecompositionModule>;
