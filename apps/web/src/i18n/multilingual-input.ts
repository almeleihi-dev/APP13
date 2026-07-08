/**
 * Normalizes multilingual profession/goal input to English canonical forms
 * for Action Intelligence matching (inventory, decomposition, intent).
 */

const PROFESSION_CANONICAL: Array<{ patterns: string[]; canonical: string }> = [
  { patterns: ["bauingenieur", "zivilingenieur", "structural engineer", "civil engineer"], canonical: "civil structural engineer" },
  { patterns: ["steuerberater", "certified accountant", "محاسب قانوني", "buchhalter"], canonical: "certified accountant" },
  { patterns: ["innenarchitekt", "interior designer", "مصمم داخلي"], canonical: "interior designer" },
  { patterns: ["app developer", "software developer", "softwareentwickler", "entwickler", "مطور تطبيقات", "مطور"], canonical: "app developer" },
  { patterns: ["legal translator", "übersetzer", "مترجم قانوني"], canonical: "legal translator" },
  { patterns: ["مهندس إنشاءات", "مهندس"], canonical: "civil engineer" },
];

const GOAL_CANONICAL: Array<{ patterns: string[]; canonical: string }> = [
  {
    patterns: [
      "ich möchte eine app erstellen",
      "ich will eine app bauen",
      "i want to build a mobile app",
      "i want to build an app",
      "أريد بناء تطبيق",
      "اريد بناء تطبيق",
    ],
    canonical: "I want to build a mobile app",
  },
  {
    patterns: ["ich möchte ein haus bauen", "build a house", "أريد بناء منزل"],
    canonical: "I want to build a house",
  },
  {
    patterns: ["geschäft eröffnen", "open a business", "أريد فتح مشروع"],
    canonical: "open a business",
  },
];

const GOAL_PHRASES_I18N = [
  "ich möchte",
  "ich will",
  "ich brauche",
  "أريد",
  "اريد",
  "أحتاج",
];

const PROFESSION_MARKERS_I18N = [
  "ingenieur",
  "designer",
  "entwickler",
  "steuerberater",
  "übersetzer",
  "مهندس",
  "مصمم",
  "محاسب",
  "مطور",
  "مترجم",
];

export function normalizeMultilingualInput(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  const lower = trimmed.toLowerCase();

  for (const entry of GOAL_CANONICAL) {
    if (entry.patterns.some((pattern) => lower.includes(pattern.toLowerCase()))) {
      return entry.canonical;
    }
  }

  for (const entry of PROFESSION_CANONICAL) {
    if (entry.patterns.some((pattern) => lower.includes(pattern.toLowerCase()) || trimmed.includes(pattern))) {
      return entry.canonical;
    }
  }

  return trimmed;
}

export function multilingualGoalPhrases(): string[] {
  return GOAL_PHRASES_I18N;
}

export function multilingualProfessionMarkers(): string[] {
  return PROFESSION_MARKERS_I18N;
}

export function detectInputLanguageHint(text: string): "en" | "de" | "ar" | "unknown" {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (
    /\b(ich|möchte|eine|der|und|steuerberater|bauingenieur|entwickler)\b/i.test(text)
  ) {
    return "de";
  }
  if (/[a-zA-Z]/.test(text)) return "en";
  return "unknown";
}
