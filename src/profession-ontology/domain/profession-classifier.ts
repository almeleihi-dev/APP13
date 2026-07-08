import type { BlueprintDraft } from "../../action-blueprint/domain/action-blueprint.js";
import {
  bridgeProfessionGraphToBlueprintDraft,
  normalizeInputChannel,
  scoreProfessionCorpus,
} from "./blueprint-bridge.js";
import { buildClassificationTrace, buildProfessionGraph } from "./profession-graph.js";
import type {
  InputChannel,
  ProfessionClassification,
  ProfessionOntologyEntry,
  ProfessionTransformationTrace,
} from "./profession-ontology.js";
import { buildSeedProfessionRegistry } from "./profession-registry.js";

function classifyAgainstRegistry(input: {
  corpus: string;
  channels: InputChannel[];
}): {
  entry: ProfessionOntologyEntry;
  score: number;
  ruleId: string;
  detail: string;
} {
  const registry = buildSeedProfessionRegistry();
  let bestEntry = registry[0];
  let bestScore = 0;
  let bestRuleId = "profession.fallback";
  let bestDetail = "Fallback to first registry profession.";

  for (const entry of registry) {
    const score = scoreProfessionCorpus(input.corpus, entry);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
      bestRuleId = `profession.match.${entry.professionId}`;
      bestDetail = `Matched profession registry entry ${entry.professionId} with score ${score.toFixed(2)}.`;
    }
  }

  if (bestScore === 0 && input.corpus) {
    bestDetail = "No keyword match; selected default advisory profession mapping.";
    bestEntry =
      registry.find((entry) => entry.professionId === "marketing-consultant") ?? bestEntry;
    bestScore = 0.2;
    bestRuleId = "profession.default_advisory";
  }

  return { entry: bestEntry, score: bestScore, ruleId: bestRuleId, detail: bestDetail };
}

export function classifyProfessionInput(input: {
  profession_name?: string;
  trade?: string;
  specialization?: string;
  license?: string;
  certification?: string;
  cv_job_title?: string;
  business_category?: string;
}): ProfessionClassification {
  const normalized = normalizeInputChannel(input);
  if (!normalized.corpus) {
    throw new Error("At least one profession input channel is required");
  }

  const match = classifyAgainstRegistry({
    corpus: normalized.corpus,
    channels: normalized.channels as InputChannel[],
  });
  const trace = buildClassificationTrace({
    professionId: match.entry.professionId,
    taxonomyCode: match.entry.taxonomyBinding.primaryTaxonomyCode,
    score: match.score,
    ruleId: match.ruleId,
    detail: match.detail,
    channels: normalized.channels as InputChannel[],
  });
  const graph = buildProfessionGraph({
    entry: match.entry,
    matchedChannels: normalized.channels as InputChannel[],
  });
  const confidence = Math.round(match.score * 100);

  return {
    professionId: match.entry.professionId,
    label: match.entry.label,
    confidence: confidence || 20,
    primaryTaxonomyDomain: match.entry.taxonomyBinding.primaryTaxonomyDomain,
    primaryTaxonomyCode: match.entry.taxonomyBinding.primaryTaxonomyCode,
    matchedChannels: normalized.channels as InputChannel[],
    graph,
    trace,
    summary: `Classified input as ${match.entry.label} (${match.entry.professionId}) with ${confidence || 20}% confidence.`,
  };
}

export function transformProfessionInput(input: {
  profession_name?: string;
  trade?: string;
  specialization?: string;
  license?: string;
  certification?: string;
  cv_job_title?: string;
  business_category?: string;
}): { classification: ProfessionClassification; blueprintDraft: BlueprintDraft } {
  const classification = classifyProfessionInput(input);
  const entry =
    buildSeedProfessionRegistry().find((item) => item.professionId === classification.professionId);
  if (!entry) {
    throw new Error(`Profession registry entry missing: ${classification.professionId}`);
  }

  const bridgeTrace: ProfessionTransformationTrace[] = [
    ...classification.trace,
    {
      step: "bridge_blueprint_draft",
      ruleId: "x41.blueprint-bridge",
      detail: `Bridged profession graph to X40 BlueprintDraft via taxonomy ${classification.primaryTaxonomyCode}.`,
      score: classification.confidence / 100,
      matchedProfessionId: classification.professionId,
      matchedTaxonomyCode: classification.primaryTaxonomyCode,
    },
  ];

  const blueprintDraft = bridgeProfessionGraphToBlueprintDraft({
    graph: classification.graph,
    entry,
    trace: bridgeTrace,
  });

  return { classification, blueprintDraft };
}

export function resolveAlias(professionId: string, aliasLabel: string): ProfessionOntologyEntry | undefined {
  const normalized = aliasLabel.trim().toLowerCase();
  return buildSeedProfessionRegistry().find((entry) =>
    entry.professionId === professionId ||
    entry.label.toLowerCase() === normalized ||
    entry.aliases.some((alias) => alias.label.toLowerCase() === normalized)
  );
}
