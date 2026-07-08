import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import {
  PROFESSION_ACTION_LIBRARY,
  localizeLabels,
  resolveActionNames,
} from "./profession-action-library.js";
import type {
  ActionExtractInput,
  ActionExtractResult,
  DetectedLanguage,
  ProfessionMapping,
  ProfessionMatch,
} from "./types.js";

const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function containsArabic(text: string): boolean {
  return ARABIC_SCRIPT.test(text);
}

export function detectLanguage(text: string): DetectedLanguage {
  const hasArabic = containsArabic(text);
  const hasLatin = /[A-Za-z]/.test(text);
  if (hasArabic && hasLatin) return "mixed";
  if (hasArabic) return "ar";
  return "en";
}

function resolveOutputLanguage(
  detected: DetectedLanguage,
  preference: ActionExtractInput["language"]
): "en" | "ar" {
  if (preference === "en" || preference === "ar") {
    return preference;
  }
  if (detected === "ar") return "ar";
  return "en";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordMatches(text: string, keyword: string): boolean {
  const normalizedKeyword = normalizeWhitespace(keyword.toLowerCase());
  if (!normalizedKeyword) return false;
  if (containsArabic(keyword)) {
    return text.includes(keyword);
  }
  const pattern = new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, "i");
  return pattern.test(text);
}

function scoreProfessionMapping(
  mapping: ProfessionMapping,
  corpus: string,
  corpusLower: string,
  explicitProfession?: string
): ProfessionMatch {
  let score = 0;
  let maxScore = mapping.keywords.en.length + mapping.keywords.ar.length + 4;

  for (const keyword of [...mapping.keywords.en, ...mapping.keywords.ar]) {
    if (keywordMatches(corpusLower, keyword) || keywordMatches(corpus, keyword)) {
      score += 1;
    }
  }

  if (explicitProfession) {
    const explicit = explicitProfession.toLowerCase();
    if (
      explicit.includes(mapping.profession.en.toLowerCase()) ||
      explicit.includes(mapping.profession.ar) ||
      mapping.keywords.en.some((keyword) => explicit.includes(keyword.toLowerCase())) ||
      mapping.keywords.ar.some((keyword) => explicit.includes(keyword))
    ) {
      score += 4;
      maxScore += 4;
    }
  }

  return { mapping, score, maxScore };
}

function buildConfidence(top: ProfessionMatch, runnerUp: ProfessionMatch | null): number {
  if (top.score <= 0) return 0;
  const normalized = top.score / Math.max(top.maxScore, 1);
  if (!runnerUp || runnerUp.score <= 0) {
    return roundConfidence(Math.min(1, 0.55 + normalized * 0.45));
  }
  const lead = top.score - runnerUp.score;
  if (lead >= 2) {
    return roundConfidence(Math.min(1, 0.5 + normalized * 0.5));
  }
  const separation = lead / Math.max(top.score, 1);
  return roundConfidence(Math.min(1, normalized * 0.7 + separation * 0.3));
}

function roundConfidence(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function rankActions(mapping: ProfessionMapping, confidence: number): ActionExtractResult["actions"] {
  const resolved = resolveActionNames(mapping.actionCodes);
  if (resolved.length === 0) return [];

  return resolved.map((entry, index) => ({
    action_code: entry.actionCode,
    action_name: entry.actionName,
    score: roundConfidence(Math.max(0.1, confidence - index * 0.05)),
  }));
}

export class ActionIntelligenceService {
  extract(input: ActionExtractInput): ActionExtractResult {
    const profession = normalizeWhitespace(input.profession ?? "");
    const cvText = normalizeWhitespace(input.cv_text ?? "");
    const experienceText = normalizeWhitespace(input.experience_text ?? "");

    if (!profession && !cvText && !experienceText) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "action",
          detail: "At least one of profession, cv_text, or experience_text is required",
        })
      );
    }

    const corpus = normalizeWhitespace([profession, cvText, experienceText].filter(Boolean).join(" "));
    const corpusLower = corpus.toLowerCase();
    const languageDetected = detectLanguage(corpus);
    const outputLanguage = resolveOutputLanguage(languageDetected, input.language ?? "auto");

    const scored = PROFESSION_ACTION_LIBRARY.map((mapping) =>
      scoreProfessionMapping(mapping, corpus, corpusLower, profession || undefined)
    ).sort((a, b) => b.score - a.score);

    const top = scored[0];
    if (top.score <= 0) {
      return {
        profession: "unknown",
        confidence: 0,
        language_detected: languageDetected,
        actions: [],
        skills: [],
        deliverables: [],
      };
    }

    const runnerUp = scored[1] ?? null;
    const confidence = buildConfidence(top, runnerUp);
    const professionLabel =
      outputLanguage === "ar" ? top.mapping.profession.ar : top.mapping.profession.en;

    return {
      profession: professionLabel,
      confidence,
      language_detected: languageDetected,
      actions: rankActions(top.mapping, confidence),
      skills: localizeLabels(top.mapping.skills, outputLanguage),
      deliverables: localizeLabels(top.mapping.deliverables, outputLanguage),
    };
  }
}

export function createActionIntelligenceService(): ActionIntelligenceService {
  return new ActionIntelligenceService();
}
