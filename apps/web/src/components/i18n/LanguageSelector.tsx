import { LOCALE_LABELS, SUPPORTED_LOCALES, type SupportedLocale } from "../../i18n/locale-types.js";
import { useLocale } from "../../i18n/useLocale.js";

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className={`an-act-language-selector${className ? ` ${className}` : ""}`}>
      <span className="an-act-language-selector__label">{t("language.select")}</span>
      <select
        className="an-act-language-selector__select"
        value={locale}
        onChange={(event) => setLocale(event.target.value as SupportedLocale)}
        aria-label={t("language.select")}
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
