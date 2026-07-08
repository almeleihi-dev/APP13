import { useCallback, useEffect, useState } from "react";
import { translate, type MessageKey } from "./messages.js";
import { LOCALE_UPDATED_EVENT, type SupportedLocale } from "./locale-types.js";
import { readLocale, writeLocale } from "./locale-store.js";

export function useLocale() {
  const [locale, setLocale] = useState<SupportedLocale>(() => readLocale());

  useEffect(() => {
    const refresh = () => setLocale(readLocale());
    window.addEventListener(LOCALE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(LOCALE_UPDATED_EVENT, refresh);
  }, []);

  const setAppLocale = useCallback((next: SupportedLocale) => {
    writeLocale(next);
    setLocale(next);
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  return { locale, setLocale: setAppLocale, t };
}
