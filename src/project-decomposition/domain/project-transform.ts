import { getActionType } from "../../action/domain/action.js";
import { buildBlueprintId } from "../../action-blueprint/domain/taxonomy-bridge.js";
import { PROJECT_DECOMPOSITION_SCHEMA_VERSION } from "./project-schema.js";
import {
  buildParallelExecutionGroups,
  calculateCriticalPath,
  detectCycle,
} from "./dependency-engine.js";
import {
  detectBlueprintReuse,
  normalizeProjectInput,
  scoreProjectTemplate,
} from "./blueprint-bridge.js";
import type {
  BlueprintCompositionEdge,
  BlueprintCompositionNode,
  DeliverableMapping,
  ProjectBlueprintGraph,
  ProjectPhase,
  ProjectTransformationTrace,
} from "./project-decomposition.js";
import {
  listProjectTemplateSpecs,
  type ProjectTemplateSpec,
} from "./project-templates.js";

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function selectTemplate(corpus: string): {
  template: ProjectTemplateSpec;
  score: number;
  ruleId: string;
} {
  let best = listProjectTemplateSpecs()[0];
  let bestScore = 0;
  let ruleId = "project.fallback";

  for (const template of listProjectTemplateSpecs()) {
    const score = scoreProjectTemplate(corpus, template.keywords);
    if (score > bestScore) {
      bestScore = score;
      best = template;
      ruleId = `project.template.${template.templateId}`;
    }
  }

  if (bestScore === 0) {
    best =
      listProjectTemplateSpecs().find((template) => template.templateId === "office-relocation") ??
      best;
    bestScore = 0.25;
    ruleId = "project.template.fallback";
  }

  return { template: best, score: bestScore, ruleId };
}

function buildGraphFromTemplate(input: {
  projectName: string;
  goalText: string;
  template: ProjectTemplateSpec;
  trace: ProjectTransformationTrace[];
}): ProjectBlueprintGraph {
  const projectId = `project://${slugify(input.projectName)}`;
  const nodes: BlueprintCompositionNode[] = input.template.nodes.map((node) => {
    const actionType = getActionType(node.primaryTaxonomyCode);
    return {
      nodeId: node.nodeId,
      label: node.label,
      professionId: node.professionId,
      primaryTaxonomyCode: node.primaryTaxonomyCode,
      primaryTaxonomyDomain: actionType?.domain ?? "F",
      blueprintId: buildBlueprintId(node.primaryTaxonomyCode, `${slugify(input.template.templateId)}-${node.nodeId}`),
      phaseId: node.phaseId,
      deliverable: node.deliverable,
      durationWeight: node.durationWeight,
    };
  });

  const edges: BlueprintCompositionEdge[] = input.template.edges.map((edge, index) => ({
    edgeId: `${input.template.templateId}-edge-${index + 1}`,
    fromNodeId: edge.fromNodeId,
    toNodeId: edge.toNodeId,
    dependencyKind: edge.dependencyKind,
  }));

  const phases: ProjectPhase[] = input.template.phases.map((phase, index) => ({
    phaseId: phase.phaseId,
    kind: phase.kind,
    label: phase.label,
    nodeIds: phase.nodeIds,
    sequenceOrder: index + 1,
  }));

  const deliverables: DeliverableMapping[] = nodes.map((node, index) => ({
    deliverableId: `${projectId}-deliverable-${index + 1}`,
    label: node.deliverable,
    nodeId: node.nodeId,
    phaseId: node.phaseId,
  }));

  const graphWithoutAnalysis: ProjectBlueprintGraph = {
    projectId,
    projectName: input.projectName,
    goalText: input.goalText,
    templateId: input.template.templateId,
    status: "draft",
    schemaVersion: PROJECT_DECOMPOSITION_SCHEMA_VERSION,
    phases,
    nodes,
    edges,
    deliverables,
    parallelGroups: [],
    criticalPath: { nodeIds: [], totalDurationWeight: 0, summary: "" },
    blueprintReuse: [],
    trace: input.trace,
  };

  const cycle = detectCycle(nodes, edges);
  if (cycle) {
    throw new Error(`Template ${input.template.templateId} has dependency cycle`);
  }

  return {
    ...graphWithoutAnalysis,
    parallelGroups: buildParallelExecutionGroups(graphWithoutAnalysis),
    criticalPath: calculateCriticalPath(graphWithoutAnalysis),
    blueprintReuse: detectBlueprintReuse(graphWithoutAnalysis).map((entry) => ({
      blueprintId: entry.blueprint_id,
      nodeIds: entry.node_ids,
      reuseCount: entry.reuse_count,
    })),
  };
}

export function transformProjectInput(input: {
  project_name: string;
  goal_text: string;
  constraints?: string[];
}): ProjectBlueprintGraph {
  const projectName = input.project_name?.trim();
  const goalText = input.goal_text?.trim();
  if (!projectName || !goalText) {
    throw new Error("project_name and goal_text are required");
  }

  const corpus = normalizeProjectInput({
    project_name: projectName,
    goal_text: goalText,
    constraints: input.constraints,
  });
  const match = selectTemplate(corpus);
  const trace: ProjectTransformationTrace[] = [
    {
      step: "normalize_project",
      ruleId: "project.normalize",
      detail: "Normalized project name, goal, and constraints.",
      score: 1,
    },
    {
      step: "match_template",
      ruleId: match.ruleId,
      detail: `Matched project template ${match.template.templateId}.`,
      score: match.score,
      matchedTemplateId: match.template.templateId,
    },
    {
      step: "compose_graph",
      ruleId: "project.compose-dag",
      detail: `Composed blueprint DAG with ${match.template.nodes.length} nodes.`,
      score: 1,
      matchedTemplateId: match.template.templateId,
    },
  ];

  return buildGraphFromTemplate({
    projectName,
    goalText,
    template: match.template,
    trace,
  });
}

export function buildProjectGraphFromTemplate(input: {
  project_name: string;
  goal_text: string;
  template: ProjectTemplateSpec;
}): ProjectBlueprintGraph {
  return buildGraphFromTemplate({
    projectName: input.project_name,
    goalText: input.goal_text,
    template: input.template,
    trace: [
      {
        step: "load_template",
        ruleId: `project.template.${input.template.templateId}`,
        detail: `Loaded published template ${input.template.templateId}.`,
        score: 1,
        matchedTemplateId: input.template.templateId,
      },
    ],
  });
}
