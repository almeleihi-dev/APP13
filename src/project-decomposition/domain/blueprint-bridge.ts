import { keywordMatchStrength, normalizeSearchText } from "../../action-intelligence/domain/action-catalog.js";
import { buildBlueprintId } from "../../action-blueprint/domain/taxonomy-bridge.js";
import { getActionType } from "../../action/domain/action.js";
import type { BlueprintDraft } from "../../action-blueprint/domain/action-blueprint.js";
import { bridgeProfessionGraphToBlueprintDraft } from "../../profession-ontology/domain/blueprint-bridge.js";
import { buildProfessionGraph } from "../../profession-ontology/domain/profession-graph.js";
import { getSeedProfessionById } from "../../profession-ontology/domain/profession-registry.js";
import type {
  BlueprintCompositionNode,
  ProjectBlueprintGraph,
  ProjectTransformationTrace,
} from "./project-decomposition.js";

export function buildBlueprintDraftForNode(input: {
  node: BlueprintCompositionNode;
  trace: ProjectTransformationTrace[];
}): BlueprintDraft {
  const professionEntry = getSeedProfessionById(input.node.professionId);
  if (!professionEntry) {
    throw new Error(`Unknown profession for node ${input.node.nodeId}: ${input.node.professionId}`);
  }

  const actionType = getActionType(input.node.primaryTaxonomyCode);
  if (!actionType) {
    throw new Error(`Unknown taxonomy code for node ${input.node.nodeId}: ${input.node.primaryTaxonomyCode}`);
  }

  const graph = buildProfessionGraph({
    entry: professionEntry,
    matchedChannels: ["profession_name"],
  });

  const nodeTrace = [
    ...input.trace,
    {
      step: "bridge_node_blueprint",
      ruleId: `x42.node.${input.node.nodeId}`,
      detail: `Bridged node ${input.node.nodeId} to taxonomy ${input.node.primaryTaxonomyCode}.`,
      score: 1,
      matchedTaxonomyCode: input.node.primaryTaxonomyCode,
    },
  ];

  const draft = bridgeProfessionGraphToBlueprintDraft({
    graph,
    entry: {
      ...professionEntry,
      taxonomyBinding: {
        ...professionEntry.taxonomyBinding,
        primaryTaxonomyCode: input.node.primaryTaxonomyCode,
        primaryTaxonomyDomain: actionType.domain,
      },
    },
    trace: nodeTrace.map((step) => ({
      step: step.step,
      ruleId: step.ruleId,
      detail: step.detail,
      score: step.score,
      matchedProfessionId: input.node.professionId,
      matchedTaxonomyCode: step.matchedTaxonomyCode,
    })),
  });

  return {
    ...draft,
    blueprint: {
      ...draft.blueprint,
      blueprintId: input.node.blueprintId || buildBlueprintId(input.node.primaryTaxonomyCode, input.node.nodeId),
      title: `${actionType.actionName} — ${input.node.label}`,
      summary: input.node.deliverable,
      composition: { kind: "atomic" },
    },
  };
}

export function detectBlueprintReuse(graph: ProjectBlueprintGraph): Array<{
  blueprint_id: string;
  node_ids: string[];
  reuse_count: number;
}> {
  const byBlueprint = new Map<string, string[]>();
  const byTaxonomy = new Map<string, string[]>();

  for (const node of graph.nodes) {
    const blueprintList = byBlueprint.get(node.blueprintId) ?? [];
    blueprintList.push(node.nodeId);
    byBlueprint.set(node.blueprintId, blueprintList);

    const taxonomyList = byTaxonomy.get(node.primaryTaxonomyCode) ?? [];
    taxonomyList.push(node.nodeId);
    byTaxonomy.set(node.primaryTaxonomyCode, taxonomyList);
  }

  const results: Array<{ blueprint_id: string; node_ids: string[]; reuse_count: number }> = [];

  for (const [blueprintId, nodeIds] of byBlueprint.entries()) {
    if (nodeIds.length > 1) {
      results.push({
        blueprint_id: blueprintId,
        node_ids: nodeIds,
        reuse_count: nodeIds.length,
      });
    }
  }

  for (const [taxonomyCode, nodeIds] of byTaxonomy.entries()) {
    if (nodeIds.length <= 1) continue;
    const blueprintKey = `taxonomy://${taxonomyCode}`;
    if (results.some((entry) => entry.blueprint_id === blueprintKey)) continue;
    results.push({
      blueprint_id: blueprintKey,
      node_ids: nodeIds,
      reuse_count: nodeIds.length,
    });
  }

  return results;
}

export function scoreProjectTemplate(corpus: string, keywords: string[]): number {
  return keywordMatchStrength(corpus, keywords);
}

export function normalizeProjectInput(input: {
  project_name: string;
  goal_text: string;
  constraints?: string[];
}): string {
  return normalizeSearchText(
    [input.project_name, input.goal_text, ...(input.constraints ?? [])].filter(Boolean).join(" ")
  );
}
