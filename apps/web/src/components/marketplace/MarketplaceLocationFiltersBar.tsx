import { useState } from "react";
import type { MarketplaceLocationFilters } from "../../lib/living-platform/types.js";
import {
  defaultMarketplaceFilters,
  marketplaceFilterLabels,
} from "../../lib/living-platform/intelligence/marketplace-location-filters.js";
import { useLocale } from "../../i18n/useLocale.js";
import { LOCALE_LABELS, type SupportedLocale } from "../../i18n/locale-types.js";

export interface MarketplaceLocationFiltersBarProps {
  onChange: (filters: MarketplaceLocationFilters) => void;
  initial?: MarketplaceLocationFilters;
}

export function MarketplaceLocationFiltersBar({ onChange, initial }: MarketplaceLocationFiltersBarProps) {
  const { t } = useLocale();
  const [filters, setFilters] = useState<MarketplaceLocationFilters>(initial ?? defaultMarketplaceFilters());

  function update(next: Partial<MarketplaceLocationFilters>) {
    const merged = { ...filters, ...next };
    setFilters(merged);
    onChange(merged);
  }

  return (
    <div className="an-act-marketplace-location-filters" role="group" aria-label={t("marketplace.filter.location")}>
      <p className="an-act-marketplace-location-filters__label">{t("marketplace.filter.location")}</p>
      <div className="an-act-marketplace-location-filters__scopes">
        {marketplaceFilterLabels().map(({ scope, labelKey }) => (
          <button
            key={scope}
            type="button"
            className={`an-act-marketplace-location-filters__chip${filters.scope === scope ? " is-active" : ""}`}
            onClick={() => update({ scope })}
          >
            {t(labelKey as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      <label className="an-act-marketplace-location-filters__field">
        <span>{t("marketplace.filter.language")}</span>
        <select
          value={filters.language ?? ""}
          onChange={(event) => update({ language: event.target.value || undefined })}
        >
          <option value="">Any</option>
          {(Object.entries(LOCALE_LABELS) as Array<[SupportedLocale, string]>).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="an-act-marketplace-location-filters__toggle">
        <input
          type="checkbox"
          checked={Boolean(filters.remoteOnly)}
          onChange={(event) => update({ remoteOnly: event.target.checked })}
        />
        <span>{t("marketplace.filter.remote")}</span>
      </label>
    </div>
  );
}
