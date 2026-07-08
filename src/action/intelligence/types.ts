export type DetectedLanguage = "en" | "ar" | "mixed";

export interface LocalizedLabel {
  en: string;
  ar: string;
}

export interface ProfessionMapping {
  id: string;
  profession: LocalizedLabel;
  keywords: { en: string[]; ar: string[] };
  actionCodes: string[];
  skills: LocalizedLabel[];
  deliverables: LocalizedLabel[];
}

export interface ActionExtractInput {
  profession?: string;
  cv_text?: string;
  experience_text?: string;
  language?: "en" | "ar" | "auto";
}

export interface ExtractedAction {
  action_code: string;
  action_name: string;
  score: number;
}

export interface ActionExtractResult {
  profession: string;
  confidence: number;
  language_detected: DetectedLanguage;
  actions: ExtractedAction[];
  skills: string[];
  deliverables: string[];
}

export interface ProfessionMatch {
  mapping: ProfessionMapping;
  score: number;
  maxScore: number;
}
