import {
  multilingualGoalPhrases,
  multilingualProfessionMarkers,
  normalizeMultilingualInput,
} from "../../../i18n/multilingual-input.js";

export type InputIntent = "goal" | "profession";

const GOAL_PHRASES = [
  "i want to",
  "i need to",
  "i would like to",
  "help me",
  "build a",
  "build an",
  "build my",
  "launch a",
  "launch an",
  "create a",
  "create an",
  "open a",
  "start a",
  "develop a",
  "develop an",
  "make a",
  "make an",
  "accomplish",
  "project to",
  "goal is",
  ...multilingualGoalPhrases(),
];

const PROFESSION_MARKERS = [
  "engineer",
  "designer",
  "developer",
  "accountant",
  "translator",
  "architect",
  "consultant",
  "lawyer",
  "attorney",
  "certified",
  "licensed",
  "professional",
  "specialist",
  "technician",
  "analyst",
  "planner",
  "surveyor",
  "inspector",
  "ingenieur",
  "entwickler",
  "steuerberater",
  "übersetzer",
  ...multilingualProfessionMarkers(),
];

const PROFESSION_TITLE_PATTERN =
  /^(certified|licensed|senior|junior|lead|principal)?\s*[\w\s./-]{2,48}$/i;

export function detectInputIntent(text: string): InputIntent {
  const normalized = normalizeMultilingualInput(text);
  const trimmed = normalized.trim();
  if (!trimmed) return "goal";

  const lower = trimmed.toLowerCase();
  if (GOAL_PHRASES.some((phrase) => lower.includes(phrase))) {
    return "goal";
  }

  const words = lower.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount <= 8 && PROFESSION_MARKERS.some((marker) => lower.includes(marker))) {
    if (wordCount <= 6 || lower.includes("certified") || lower.includes("licensed")) {
      return "profession";
    }
  }

  if (wordCount <= 5 && (lower.includes("/") || PROFESSION_TITLE_PATTERN.test(trimmed))) {
    if (PROFESSION_MARKERS.some((marker) => lower.includes(marker))) {
      return "profession";
    }
  }

  if (wordCount <= 4 && !lower.includes(" want ") && !lower.includes(" build ") && !lower.includes("möchte")) {
    return "profession";
  }

  return "goal";
}

export function professionAnalysisLabel(intent: InputIntent): string {
  return intent === "profession" ? "Discovering actions you can perform…" : "Building Professional Acts…";
}
