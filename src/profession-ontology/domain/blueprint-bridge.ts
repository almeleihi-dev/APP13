import { keywordMatchStrength, normalizeSearchText } from "../../action-intelligence/domain/action-catalog.js";
import { getActionType } from "../../action/domain/action.js";
import { buildBlueprintId } from "../../action-blueprint/domain/taxonomy-bridge.js";
import type { BlueprintDraft } from "../../action-blueprint/domain/action-blueprint.js";
import {
  buildDomainMilestonePattern,
  buildEvidenceRequirements,
  buildTekrrBinding,
  getSeedBlueprintByTaxonomyCode,
} from "../../action-blueprint/domain/taxonomy-bridge.js";
import { BLUEPRINT_SCHEMA_VERSION } from "../../action-blueprint/domain/blueprint-schema.js";
import type {
  ProfessionGraph,
  ProfessionOntologyEntry,
  ProfessionTransformationTrace,
} from "./profession-ontology.js";

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function bridgeProfessionGraphToBlueprintDraft(input: {
  graph: ProfessionGraph;
  entry: ProfessionOntologyEntry;
  trace: ProfessionTransformationTrace[];
}): BlueprintDraft {
  const { entry } = input;
  const actionCode = entry.taxonomyBinding.primaryTaxonomyCode;
  const seed = getSeedBlueprintByTaxonomyCode(actionCode);
  const actionType = getActionType(actionCode);
  if (!seed || !actionType) {
    throw new Error(`Unable to bridge profession ${entry.professionId} to taxonomy ${actionCode}`);
  }

  const milestonePattern = buildDomainMilestonePattern(actionType.domain);
  const evidenceRequirements = milestonePattern.flatMap((milestone) =>
    buildEvidenceRequirements(seed.riskLevelDefault, milestone.milestoneCode)
  );

  const blueprint = {
    blueprintId: buildBlueprintId(actionCode, slugify(entry.label)),
    version: "1.0.0",
    status: "draft" as const,
    primaryTaxonomyCode: actionCode,
    domain: entry.taxonomyBinding.primaryTaxonomyDomain,
    title: `${actionType.actionName} — ${entry.label}`,
    summary: `Profession ontology blueprint for ${entry.label}.`,
    intent: {
      verb: "execute",
      object: actionType.actionName,
      beneficiary: "customer",
      outcome: entry.summary,
    },
    scope: {
      inclusions: entry.capabilities.map((capability) => capability.label),
      exclusions: seed.scope.exclusions,
      assumptions: seed.scope.assumptions,
      jurisdictionHints: [],
    },
    actorRequirements: {
      providerRole: "service_provider",
      requiredCredentials: entry.credentials.map((credential) => credential.code),
      minProviderTier: entry.taxonomyBinding.minProviderTier,
      partyCount: 2,
    },
    tekrrBinding: buildTekrrBinding(actionCode),
    milestonePattern,
    evidenceRequirements,
    composition: { kind: "atomic" as const },
    sourceChannel: "profession_binding" as const,
    transformationTrace: input.trace.map((step) => ({
      step: step.step,
      ruleId: step.ruleId,
      detail: step.detail,
      score: step.score,
      matchedTaxonomyCode: step.matchedTaxonomyCode,
    })),
    minProviderTier: entry.taxonomyBinding.minProviderTier,
    riskLevelDefault: seed.riskLevelDefault,
    schemaVersion: BLUEPRINT_SCHEMA_VERSION,
  };

  const confidence = Math.round(
    input.trace.reduce((sum, step) => sum + step.score, 0) / Math.max(1, input.trace.length) * 100
  );

  return {
    blueprint,
    confidence,
    warnings:
      confidence < 60
        ? ["Low-confidence profession ontology match; validate taxonomy and blueprint bindings."]
        : [],
  };
}

export function resolveBlueprintBindings(entry: ProfessionOntologyEntry): string[] {
  return entry.blueprintBindings.map((binding) => binding.blueprintId);
}

export function scoreProfessionCorpus(corpus: string, entry: ProfessionOntologyEntry): number {
  const aliasTexts = entry.aliases.map((alias) => alias.label);
  const keywordTexts = entry.keywords.map((keyword) => keyword.term);
  const licenseTexts = entry.licenses.map((license) => license.label);
  const credentialTexts = entry.credentials.map((credential) => credential.label);
  const skillTexts = entry.skills.map((skill) => skill.label);

  const scores = [
    keywordMatchStrength(corpus, [entry.label, ...aliasTexts]),
    keywordMatchStrength(corpus, keywordTexts),
    keywordMatchStrength(corpus, licenseTexts),
    keywordMatchStrength(corpus, credentialTexts),
    keywordMatchStrength(corpus, skillTexts),
  ];

  return Math.max(...scores);
}

export function normalizeInputChannel(input: {
  profession_name?: string;
  trade?: string;
  specialization?: string;
  license?: string;
  certification?: string;
  cv_job_title?: string;
  business_category?: string;
}): { corpus: string; channels: string[] } {
  const parts: Array<{ channel: string; value?: string }> = [
    { channel: "profession_name", value: input.profession_name },
    { channel: "trade", value: input.trade },
    { channel: "specialization", value: input.specialization },
    { channel: "license", value: input.license },
    { channel: "certification", value: input.certification },
    { channel: "cv_job_title", value: input.cv_job_title },
    { channel: "business_category", value: input.business_category },
  ];

  const active = parts.filter((part) => part.value && part.value.trim().length > 0);
  return {
    corpus: normalizeSearchText(active.map((part) => part.value!.trim()).join(" ")),
    channels: active.map((part) => part.channel),
  };
}
