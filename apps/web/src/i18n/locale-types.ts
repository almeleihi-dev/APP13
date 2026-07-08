export const SUPPORTED_LOCALES = ["en", "de", "ar"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English 🇬🇧",
  de: "Deutsch 🇩🇪",
  ar: "العربية 🇸🇦",
};

export const LOCALE_UPDATED_EVENT = "an-act-locale-updated";
export const LOCALE_STORAGE_KEY = "an-act-locale-v1";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function defaultLocale(): SupportedLocale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("ar")) return "ar";
  return "en";
}
