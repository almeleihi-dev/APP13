import type {
  InputChannel,
  ProfessionGraph,
  ProfessionOntologyEntry,
  ProfessionTransformationTrace,
} from "./profession-ontology.js";

export function buildProfessionGraph(input: {
  entry: ProfessionOntologyEntry;
  matchedChannels: InputChannel[];
}): ProfessionGraph {
  return {
    professionId: input.entry.professionId,
    label: input.entry.label,
    matchedChannels: input.matchedChannels,
    nodes: input.entry.hierarchy.nodes,
    skills: input.entry.skills,
    capabilities: input.entry.capabilities,
    credentials: input.entry.credentials,
    licenses: input.entry.licenses,
    actionFamilies: input.entry.actionFamilies,
    taxonomyBinding: input.entry.taxonomyBinding,
    blueprintBindings: input.entry.blueprintBindings,
  };
}

export function buildClassificationTrace(input: {
  professionId: string;
  taxonomyCode: string;
  score: number;
  ruleId: string;
  detail: string;
  channels: InputChannel[];
}): ProfessionTransformationTrace[] {
  return [
    {
      step: "normalize_input",
      ruleId: "profession-graph.normalize",
      detail: `Normalized input channels: ${input.channels.join(", ")}`,
      score: 1,
    },
    {
      step: "match_profession",
      ruleId: input.ruleId,
      detail: input.detail,
      score: input.score,
      matchedProfessionId: input.professionId,
      matchedTaxonomyCode: input.taxonomyCode,
    },
    {
      step: "build_profession_graph",
      ruleId: "profession-graph.build",
      detail: `Built profession graph for ${input.professionId}.`,
      score: input.score,
      matchedProfessionId: input.professionId,
      matchedTaxonomyCode: input.taxonomyCode,
    },
  ];
}
