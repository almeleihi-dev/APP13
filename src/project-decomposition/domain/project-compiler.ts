import { compileBlueprintPreview } from "../../action-blueprint/domain/blueprint-compiler.js";
import { toBlueprintDraftView } from "../../action-blueprint/domain/action-blueprint.js";
import { buildBlueprintDraftForNode } from "./blueprint-bridge.js";
import type {
  ProjectBlueprintGraph,
  ProjectCompilePreview,
  ProjectNodeCompilePreview,
} from "./project-decomposition.js";
import { validateProjectGraph } from "./project-decomposition.js";

export function compileProjectPreview(graph: ProjectBlueprintGraph): ProjectCompilePreview {
  const validation = validateProjectGraph(graph);
  if (!validation.compilable) {
    throw new Error(validation.summary);
  }

  const nodePreviews: ProjectNodeCompilePreview[] = graph.nodes.map((node) => {
    const draft = buildBlueprintDraftForNode({ node, trace: graph.trace });
    const compiled = compileBlueprintPreview(draft.blueprint);
    return {
      node_id: node.nodeId,
      blueprint_draft: toBlueprintDraftView(draft),
      compiled_preview: compiled,
    };
  });

  return {
    project_id: graph.projectId,
    template_id: graph.templateId,
    node_previews: nodePreviews,
    preview_only: true,
    summary: `Compile preview for project ${graph.projectId}: ${nodePreviews.length} blueprint nodes, no runtime records created.`,
  };
}
