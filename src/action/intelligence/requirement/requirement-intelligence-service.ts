import { AppError, ErrorCodes, problem } from "../../../shared/errors/index.js";
import { detectLanguage } from "../action-intelligence-service.js";
import type { DetectedLanguage } from "../types.js";
import {
  REQUIREMENT_PROFILE_LIBRARY,
  localizeText,
  resolveActionLabel,
} from "./requirement-library.js";
import type {
  ContractReadiness,
  RequirementExtractInput,
  RequirementExtractResult,
  RequirementMatch,
  RequirementMissingQuestion,
  RequirementProfile,
} from "./types.js";

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

function containsArabic(text: string): boolean {
  return ARABIC_SCRIPT.test(text);
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

function resolveOutputLanguage(
  detected: DetectedLanguage,
  preference: RequirementExtractInput["language"]
): "en" | "ar" {
  if (preference === "en" || preference === "ar") {
    return preference;
  }
  if (detected === "ar") return "ar";
  return "en";
}

function roundConfidence(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function scoreRequirementProfile(
  profile: RequirementProfile,
  corpus: string,
  corpusLower: string,
  professionHint?: string
): RequirementMatch {
  let score = 0;
  let maxScore = profile.keywords.en.length + profile.keywords.ar.length + 4;

  for (const keyword of [...profile.keywords.en, ...profile.keywords.ar]) {
    if (keywordMatches(corpusLower, keyword) || keywordMatches(corpus, keyword)) {
      score += 1;
    }
  }

  if (professionHint) {
    const hint = professionHint.toLowerCase();
    const hintMatches =
      hint.includes(profile.id.replace(/_/g, " ")) ||
      hint.includes(profile.id) ||
      profile.professionHintAliases.some(
        (alias) =>
          hint.includes(alias.toLowerCase()) ||
          alias.toLowerCase().includes(hint) ||
          corpus.includes(alias)
      );

    if (hintMatches) {
      score += 4;
      maxScore += 4;
    }
  }

  return { profile, score, maxScore };
}

function buildConfidence(top: RequirementMatch, runnerUp: RequirementMatch | null): number {
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

function corpusHasSignal(
  corpus: string,
  corpusLower: string,
  signals: { en: string[]; ar: string[] }
): boolean {
  return [...signals.en, ...signals.ar].some(
    (signal) => keywordMatches(corpusLower, signal) || keywordMatches(corpus, signal)
  );
}

function resolveMissingQuestions(
  questions: RequirementMissingQuestion[],
  corpus: string,
  corpusLower: string,
  language: "en" | "ar"
): string[] {
  return questions
    .filter((entry) => !corpusHasSignal(corpus, corpusLower, entry.absentSignals))
    .map((entry) => localizeText(entry.text, language));
}

function resolveContractReadiness(
  confidence: number,
  missingQuestions: string[]
): ContractReadiness {
  if (missingQuestions.length === 0 && confidence >= 0.65) {
    return "ready";
  }
  return "needs_clarification";
}

function buildUnknownResult(languageDetected: DetectedLanguage): RequirementExtractResult {
  return {
    language_detected: languageDetected,
    confidence: 0,
    suggested_actions: [],
    deliverables: [],
    milestones: [],
    missing_questions: [],
    contract_readiness: "unknown",
  };
}

export class RequirementIntelligenceService {
  extract(input: RequirementExtractInput): RequirementExtractResult {
    const requirementText = normalizeWhitespace(input.requirement_text ?? "");
    const professionHint = normalizeWhitespace(input.profession_hint ?? "");

    if (!requirementText) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "action",
          detail: "requirement_text is required",
        })
      );
    }

    const corpus = normalizeWhitespace([requirementText, professionHint].filter(Boolean).join(" "));
    const corpusLower = corpus.toLowerCase();
    const languageDetected = detectLanguage(requirementText);
    const outputLanguage = resolveOutputLanguage(languageDetected, input.language ?? "auto");

    const scored = REQUIREMENT_PROFILE_LIBRARY.map((profile) =>
      scoreRequirementProfile(profile, corpus, corpusLower, professionHint || undefined)
    ).sort((a, b) => b.score - a.score);

    const top = scored[0];
    if (!top || top.score <= 0) {
      return buildUnknownResult(languageDetected);
    }

    const runnerUp = scored[1] ?? null;
    const confidence = buildConfidence(top, runnerUp);
    const profile = top.profile;

    const suggested_actions = profile.suggestedActions
      .map((entry) => {
        const label = resolveActionLabel(entry.actionCode);
        if (!label) return null;
        return {
          action_code: entry.actionCode,
          label,
          reason: localizeText(entry.reason, outputLanguage),
        };
      })
      .filter((entry): entry is RequirementExtractResult["suggested_actions"][number] => entry !== null);

    const deliverables = profile.deliverables.map((entry) => ({
      title: localizeText(entry.title, outputLanguage),
      description: localizeText(entry.description, outputLanguage),
    }));

    const milestones = profile.milestones.map((entry) => ({
      title: localizeText(entry.title, outputLanguage),
      acceptance_criteria: entry.acceptanceCriteria.map((criterion) =>
        localizeText(criterion, outputLanguage)
      ),
    }));

    const missing_questions = resolveMissingQuestions(
      profile.missingQuestions,
      corpus,
      corpusLower,
      outputLanguage
    );

    return {
      language_detected: languageDetected,
      confidence,
      suggested_actions,
      deliverables,
      milestones,
      missing_questions,
      contract_readiness: resolveContractReadiness(confidence, missing_questions),
    };
  }
}

export function createRequirementIntelligenceService(): RequirementIntelligenceService {
  return new RequirementIntelligenceService();
}
