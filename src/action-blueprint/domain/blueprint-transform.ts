import { PROFESSION_ACTION_LIBRARY } from "../../action/intelligence/profession-action-library.js";
import { getActionType } from "../../action/domain/action.js";
import { keywordMatchStrength, normalizeSearchText } from "../../action-intelligence/domain/action-catalog.js";
import type { ActionBlueprint, BlueprintDraft, TransformationStep } from "./action-blueprint.js";
import {
  buildBlueprintId,
  buildDomainMilestonePattern,
  buildEvidenceRequirements,
  buildTekrrBinding,
  getSeedBlueprintByTaxonomyCode,
  PROJECT_INTENT_RULES,
  SERVICE_DESCRIPTION_KEYWORDS,
} from "./taxonomy-bridge.js";
import { BLUEPRINT_SCHEMA_VERSION } from "./blueprint-schema.js";

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function scoreKeywordRules(
  corpus: string,
  rules: Array<{ actionCode: string; keywords: string[]; ruleId: string }>
): { actionCode: string; score: number; ruleId: string } | null {
  let best: { actionCode: string; score: number; ruleId: string } | null = null;
  for (const rule of rules) {
    const score = keywordMatchStrength(corpus, rule.keywords);
    if (!best || score > best.score) {
      best = { actionCode: rule.actionCode, score, ruleId: rule.ruleId };
    }
  }
  return best && best.score > 0 ? best : null;
}

function buildDraftFromTaxonomyMatch(input: {
  actionCode: string;
  sourceChannel: "service_description" | "profession_binding" | "project_intent";
  title: string;
  summary: string;
  trace: TransformationStep[];
  confidence: number;
  warnings: string[];
  slugSuffix?: string;
}): BlueprintDraft {
  const seed = getSeedBlueprintByTaxonomyCode(input.actionCode);
  const actionType = getActionType(input.actionCode);
  if (!seed || !actionType) {
    throw new Error(`unable to resolve taxonomy code ${input.actionCode}`);
  }

  const slug = slugify(input.slugSuffix ?? seed.title);
  const domain = actionType.domain;
  const milestonePattern = buildDomainMilestonePattern(domain);
  const evidenceRequirements = milestonePattern.flatMap((milestone) =>
    buildEvidenceRequirements(seed.riskLevelDefault, milestone.milestoneCode)
  );

  const blueprint: ActionBlueprint = {
    blueprintId: buildBlueprintId(input.actionCode, slug),
    version: "1.0.0",
    status: "draft",
    primaryTaxonomyCode: input.actionCode,
    domain,
    title: input.title,
    summary: input.summary,
    intent: {
      verb: "execute",
      object: actionType.actionName,
      beneficiary: "customer",
      outcome: input.summary,
    },
    scope: {
      inclusions: [normalizeSearchText(input.summary)],
      exclusions: seed.scope.exclusions,
      assumptions: seed.scope.assumptions,
      jurisdictionHints: [],
    },
    actorRequirements: { ...seed.actorRequirements },
    tekrrBinding: buildTekrrBinding(input.actionCode),
    milestonePattern,
    evidenceRequirements,
    composition: { kind: "atomic" },
    sourceChannel: input.sourceChannel,
    transformationTrace: input.trace,
    minProviderTier: seed.minProviderTier,
    riskLevelDefault: seed.riskLevelDefault,
    schemaVersion: BLUEPRINT_SCHEMA_VERSION,
  };

  return {
    blueprint,
    confidence: input.confidence,
    warnings: input.warnings,
  };
}

export function transformServiceDescription(input: {
  description: string;
  language?: string;
}): BlueprintDraft {
  const corpus = normalizeSearchText(input.description);
  if (!corpus) {
    throw new Error("description is required");
  }

  const match = scoreKeywordRules(
    corpus,
    SERVICE_DESCRIPTION_KEYWORDS.map((rule) => ({
      actionCode: rule.actionCode,
      keywords: rule.keywords,
      ruleId: rule.ruleId,
    }))
  );

  if (!match) {
    return buildDraftFromTaxonomyMatch({
      actionCode: "F.1.2",
      sourceChannel: "service_description",
      title: "Operational Coordination — Service Request",
      summary: input.description.trim(),
      trace: [
        {
          step: "service_description",
          ruleId: "service.fallback",
          detail: "No strong taxonomy keyword match; defaulted to operational coordination.",
          score: 0.2,
          matchedTaxonomyCode: "F.1.2",
        },
      ],
      confidence: 20,
      warnings: ["No strong taxonomy match; review primary_taxonomy_code before publishing."],
      slugSuffix: "service-request",
    });
  }

  const actionType = getActionType(match.actionCode)!;
  return buildDraftFromTaxonomyMatch({
    actionCode: match.actionCode,
    sourceChannel: "service_description",
    title: `${actionType.actionName} — Service Request`,
    summary: input.description.trim(),
    trace: [
      {
        step: "service_description",
        ruleId: match.ruleId,
        detail: `Matched service description to taxonomy code ${match.actionCode}.`,
        score: match.score,
        matchedTaxonomyCode: match.actionCode,
      },
    ],
    confidence: Math.round(match.score * 100),
    warnings: match.score < 0.5 ? ["Low-confidence taxonomy match; validate before publish."] : [],
  });
}

export function transformProfessionBinding(input: {
  profession: string;
  credentials?: string[];
  experience_text?: string;
}): BlueprintDraft {
  const profession = normalizeSearchText(input.profession);
  const credentials = (input.credentials ?? []).join(" ");
  const experience = normalizeSearchText(input.experience_text ?? "");
  const corpus = normalizeSearchText([profession, credentials, experience].filter(Boolean).join(" "));

  if (!corpus) {
    throw new Error("profession is required");
  }

  let bestMapping: (typeof PROFESSION_ACTION_LIBRARY)[number] | null = null;
  let bestScore = 0;

  for (const mapping of PROFESSION_ACTION_LIBRARY) {
    const enScore = keywordMatchStrength(corpus, mapping.keywords.en);
    const arScore = keywordMatchStrength(corpus, mapping.keywords.ar);
    const professionScore = keywordMatchStrength(corpus, [mapping.profession.en, mapping.profession.ar]);
    const score = Math.max(enScore, arScore, professionScore);
    if (score > bestScore) {
      bestScore = score;
      bestMapping = mapping;
    }
  }

  const actionCode = bestMapping?.actionCodes[0] ?? "C.1.1";
  const actionType = getActionType(actionCode)!;

  return buildDraftFromTaxonomyMatch({
    actionCode,
    sourceChannel: "profession_binding",
    title: `${actionType.actionName} — ${input.profession.trim()}`,
    summary: `Profession-bound blueprint for ${input.profession.trim()}.`,
    trace: [
      {
        step: "profession_binding",
        ruleId: bestMapping ? `profession.${bestMapping.id}` : "profession.fallback",
        detail: bestMapping
          ? `Mapped profession to ${bestMapping.profession.en} taxonomy binding.`
          : "No profession library match; defaulted to strategy consulting.",
        score: bestScore || 0.2,
        matchedTaxonomyCode: actionCode,
      },
    ],
    confidence: Math.round((bestScore || 0.2) * 100),
    warnings:
      bestScore < 0.4
        ? ["Low-confidence profession mapping; confirm taxonomy code manually."]
        : input.credentials?.length
          ? []
          : ["No credentials supplied; actor_requirements may need enrichment."],
    slugSuffix: slugify(input.profession),
  });
}

export function transformProjectIntent(input: {
  project_name: string;
  goal_text: string;
}): BlueprintDraft {
  const projectName = normalizeSearchText(input.project_name);
  const goalText = normalizeSearchText(input.goal_text);
  const corpus = normalizeSearchText(`${projectName} ${goalText}`);

  if (!projectName || !goalText) {
    throw new Error("project_name and goal_text are required");
  }

  let matchedRule: (typeof PROJECT_INTENT_RULES)[number] | null = null;
  let bestScore = 0;

  for (const rule of PROJECT_INTENT_RULES) {
    const score = keywordMatchStrength(corpus, rule.keywords);
    if (score > bestScore) {
      bestScore = score;
      matchedRule = rule;
    }
  }

  const actionCode = matchedRule?.actionCode ?? "F.1.2";
  const actionType = getActionType(actionCode)!;

  return buildDraftFromTaxonomyMatch({
    actionCode,
    sourceChannel: "project_intent",
    title: `${input.project_name.trim()} — ${actionType.actionName}`,
    summary: input.goal_text.trim(),
    trace: [
      {
        step: "project_intent",
        ruleId: matchedRule ? `project.${matchedRule.id}` : "project.fallback",
        detail: matchedRule
          ? `Project intent matched rule ${matchedRule.id}.`
          : "No project rule match; defaulted to event/operational coordination.",
        score: bestScore || 0.25,
        matchedTaxonomyCode: actionCode,
      },
    ],
    confidence: Math.round((bestScore || 0.25) * 100),
    warnings: bestScore < 0.5 ? ["Project intent match is weak; atomic composition only in X40."] : [],
    slugSuffix: slugify(input.project_name),
  });
}
