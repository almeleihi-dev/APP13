import {
  PROJECT_DECOMPOSITION_SCHEMA_VERSION,
  PROJECT_DECOMPOSITION_STATUSES,
  PROJECT_PHASE_KINDS,
} from "./project-schema.js";
import { detectCycle } from "./dependency-engine.js";

export type ProjectDecompositionStatus = (typeof PROJECT_DECOMPOSITION_STATUSES)[number];
export type ProjectPhaseKind = (typeof PROJECT_PHASE_KINDS)[number];

export interface ProjectPhase {
  phaseId: string;
  kind: ProjectPhaseKind;
  label: string;
  nodeIds: string[];
  sequenceOrder: number;
}

export interface BlueprintCompositionNode {
  nodeId: string;
  label: string;
  professionId: string;
  primaryTaxonomyCode: string;
  primaryTaxonomyDomain: string;
  blueprintId: string;
  phaseId: string;
  deliverable: string;
  durationWeight: number;
}

export interface BlueprintCompositionEdge {
  edgeId: string;
  fromNodeId: string;
  toNodeId: string;
  dependencyKind: "finish_to_start" | "start_to_start";
}

export interface DeliverableMapping {
  deliverableId: string;
  label: string;
  nodeId: string;
  phaseId: string;
}

export interface ParallelExecutionGroup {
  groupOrder: number;
  nodeIds: string[];
  labels: string[];
  parallelizable: boolean;
}

export interface CriticalPathResult {
  nodeIds: string[];
  totalDurationWeight: number;
  summary: string;
}

export interface BlueprintReuseDetection {
  blueprintId: string;
  nodeIds: string[];
  reuseCount: number;
}

export interface PhaseValidationEntry {
  phaseId: string;
  label: string;
  valid: boolean;
  nodeCount: number;
  rationale: string;
}

export interface ProjectTransformationTrace {
  step: string;
  ruleId: string;
  detail: string;
  score: number;
  matchedTemplateId?: string;
  matchedTaxonomyCode?: string;
}

export interface ProjectBlueprintGraph {
  projectId: string;
  projectName: string;
  goalText: string;
  templateId: string;
  status: ProjectDecompositionStatus;
  schemaVersion: typeof PROJECT_DECOMPOSITION_SCHEMA_VERSION;
  phases: ProjectPhase[];
  nodes: BlueprintCompositionNode[];
  edges: BlueprintCompositionEdge[];
  deliverables: DeliverableMapping[];
  parallelGroups: ParallelExecutionGroup[];
  criticalPath: CriticalPathResult;
  blueprintReuse: BlueprintReuseDetection[];
  trace: ProjectTransformationTrace[];
}

export interface ProjectValidationReport {
  valid: boolean;
  status: ProjectDecompositionStatus;
  phaseValidation: PhaseValidationEntry[];
  dependencyValid: boolean;
  compilable: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface ProjectNodeCompilePreview {
  node_id: string;
  blueprint_draft: ReturnType<typeof import("../../action-blueprint/domain/action-blueprint.js").toBlueprintDraftView>;
  compiled_preview: import("../../action-blueprint/domain/action-blueprint.js").CompiledBlueprintPreview;
}

export interface ProjectCompilePreview {
  project_id: string;
  template_id: string;
  node_previews: ProjectNodeCompilePreview[];
  preview_only: true;
  summary: string;
}

export interface ProjectDecompositionOverview {
  headline: string;
  schemaVersion: typeof PROJECT_DECOMPOSITION_SCHEMA_VERSION;
  templateCount: number;
  publishedTemplateCount: number;
  summary: string;
}

export interface ProjectDecompositionCenter {
  overview: ProjectDecompositionOverview;
  generatedAt: Date;
}

export function buildProjectOverview(input: {
  templateCount: number;
  publishedTemplateCount: number;
}): ProjectDecompositionOverview {
  return {
    headline: "APP13 Project Decomposition Engine",
    schemaVersion: PROJECT_DECOMPOSITION_SCHEMA_VERSION,
    templateCount: input.templateCount,
    publishedTemplateCount: input.publishedTemplateCount,
    summary: `Project decomposition: ${input.templateCount} templates (${input.publishedTemplateCount} published).`,
  };
}

export function buildProjectDecompositionCenter(input: {
  templateCount: number;
  publishedTemplateCount: number;
  generatedAt?: Date;
}): ProjectDecompositionCenter {
  return {
    overview: buildProjectOverview(input),
    generatedAt: input.generatedAt ?? new Date(),
  };
}

export function validateProjectGraph(graph: ProjectBlueprintGraph): ProjectValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!graph.projectName.trim()) errors.push("project_name is required");
  if (!graph.goalText.trim()) errors.push("goal_text is required");
  if (graph.nodes.length === 0) errors.push("project graph must contain nodes");

  const nodeIds = new Set(graph.nodes.map((node) => node.nodeId));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
      errors.push(`edge ${edge.edgeId} references unknown nodes`);
    }
  }

  const cycle = detectCycle(graph.nodes, graph.edges);
  if (cycle) {
    errors.push(`dependency cycle detected: ${cycle.join(", ")}`);
  }

  const phaseValidation: PhaseValidationEntry[] = graph.phases.map((phase) => {
    const nodesInPhase = graph.nodes.filter((node) => node.phaseId === phase.phaseId);
    const valid = nodesInPhase.length > 0 && phase.nodeIds.every((id) => nodeIds.has(id));
    return {
      phaseId: phase.phaseId,
      label: phase.label,
      valid,
      nodeCount: nodesInPhase.length,
      rationale: valid
        ? `Phase ${phase.label} contains ${nodesInPhase.length} blueprint nodes.`
        : `Phase ${phase.label} is missing required nodes.`,
    };
  });

  if (phaseValidation.some((phase) => !phase.valid)) {
    errors.push("one or more phases failed validation");
  }

  if (graph.criticalPath.nodeIds.length === 0) {
    warnings.push("critical path is empty");
  }

  const dependencyValid = !cycle && errors.every((error) => !error.startsWith("edge"));
  const valid = errors.length === 0 && graph.criticalPath.nodeIds.length > 0;

  return {
    valid,
    status: valid ? "validated" : "draft",
    phaseValidation,
    dependencyValid,
    compilable: valid,
    errors,
    warnings,
    summary: valid
      ? `Project graph ${graph.projectId} is valid with ${graph.nodes.length} blueprint nodes.`
      : `Project graph ${graph.projectId} failed validation.`,
  };
}

export function collectProjectDecompositionPaths(): string[] {
  return [
    "docs/action-intelligence/X42-Project-Decomposition-Engine.md",
    "src/api/routes/project-decomposition.ts",
    "src/project-decomposition/module.ts",
    "test/x42-project-decomposition.test.ts",
    "scripts/verify-x42.sh",
  ];
}

// Views

export interface ProjectDecompositionCenterView {
  overview: {
    headline: string;
    schema_version: typeof PROJECT_DECOMPOSITION_SCHEMA_VERSION;
    template_count: number;
    published_template_count: number;
    summary: string;
  };
  generated_at: string;
}

export interface ProjectBlueprintGraphView {
  project_id: string;
  project_name: string;
  goal_text: string;
  template_id: string;
  status: ProjectDecompositionStatus;
  schema_version: typeof PROJECT_DECOMPOSITION_SCHEMA_VERSION;
  phases: ProjectPhase[];
  nodes: BlueprintCompositionNode[];
  edges: BlueprintCompositionEdge[];
  deliverables: DeliverableMapping[];
  parallel_groups: ParallelExecutionGroup[];
  critical_path: CriticalPathResult;
  blueprint_reuse: BlueprintReuseDetection[];
  trace: ProjectTransformationTrace[];
}

export function toProjectDecompositionCenterView(
  center: ProjectDecompositionCenter
): ProjectDecompositionCenterView {
  return {
    overview: {
      headline: center.overview.headline,
      schema_version: center.overview.schemaVersion,
      template_count: center.overview.templateCount,
      published_template_count: center.overview.publishedTemplateCount,
      summary: center.overview.summary,
    },
    generated_at: center.generatedAt.toISOString(),
  };
}

export function toProjectBlueprintGraphView(graph: ProjectBlueprintGraph): ProjectBlueprintGraphView {
  return {
    project_id: graph.projectId,
    project_name: graph.projectName,
    goal_text: graph.goalText,
    template_id: graph.templateId,
    status: graph.status,
    schema_version: graph.schemaVersion,
    phases: graph.phases,
    nodes: graph.nodes,
    edges: graph.edges,
    deliverables: graph.deliverables,
    parallel_groups: graph.parallelGroups,
    critical_path: graph.criticalPath,
    blueprint_reuse: graph.blueprintReuse,
    trace: graph.trace,
  };
}

export function toProjectValidationReportView(report: ProjectValidationReport) {
  return {
    valid: report.valid,
    status: report.status,
    phase_validation: report.phaseValidation,
    dependency_valid: report.dependencyValid,
    compilable: report.compilable,
    errors: report.errors,
    warnings: report.warnings,
    summary: report.summary,
  };
}
