import {
  defaultLocale,
  isSupportedLocale,
  LOCALE_STORAGE_KEY,
  LOCALE_UPDATED_EVENT,
  type SupportedLocale,
} from "./locale-types.js";

export function readLocale(): SupportedLocale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return defaultLocale();
}

export function writeLocale(locale: SupportedLocale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  applyDocumentLocale(locale);
  window.dispatchEvent(new CustomEvent(LOCALE_UPDATED_EVENT));
}

export function applyDocumentLocale(locale: SupportedLocale): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.classList.toggle("an-act-locale-ar", locale === "ar");
  document.documentElement.classList.toggle("an-act-locale-de", locale === "de");
  document.documentElement.classList.toggle("an-act-locale-en", locale === "en");
}

export function initLocale(): SupportedLocale {
  const locale = readLocale();
  applyDocumentLocale(locale);
  return locale;
}
