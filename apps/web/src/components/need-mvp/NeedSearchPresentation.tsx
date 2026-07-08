import { MARKETPLACE_FEATURED_PROVIDERS } from "./opportunity-presentation.js";
import type { OpportunitySnapshot } from "./types.js";
import { useState } from "react";
import {
  listPublishedActions,
  publishedActionToOpportunitySnapshot,
  searchPublishedActions,
} from "../../lib/living-platform/professional-action-store.js";
import { MarketplaceLocationFiltersBar } from "../marketplace/MarketplaceLocationFiltersBar.js";
import { LiveDiscoveryPanel } from "../marketplace/LiveDiscoveryPanel.js";
import type { MarketplaceLocationFilters } from "../../lib/living-platform/types.js";
import { defaultMarketplaceFilters } from "../../lib/living-platform/intelligence/marketplace-location-filters.js";

export function NeedSearchSkeleton() {
  return (
    <div className="an-act-search-skeleton ds-fade-in" role="status" aria-label="Searching">
      <div className="ds-skeleton ds-skeleton--title an-act-search-skeleton__bar" />
      <div className="an-act-search-skeleton__grid">
        <div className="ds-skeleton an-act-search-skeleton__card" />
        <div className="ds-skeleton an-act-search-skeleton__card" />
        <div className="ds-skeleton an-act-search-skeleton__card" />
      </div>
    </div>
  );
}

export function NeedEmptySearchHint() {
  return (
    <div className="ds-empty ds-fade-in" role="status">
      <span className="ds-empty__icon" aria-hidden="true">
        ⌕
      </span>
      <strong className="ds-title">Start typing to search</strong>
      <p className="ds-caption">Find verified professionals, services, and opportunities across the Action Marketplace.</p>
    </div>
  );
}

const MARKETPLACE_EXAMPLE_QUERIES = ["electrician", "consultant", "HVAC", "marketing"] as const;

export interface MarketplaceBrowseHintsProps {
  onExampleSearch: (keyword: string) => void;
  onSelectPublished?: (snapshot: OpportunitySnapshot) => void;
}

function providerInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function MarketplaceBrowseHints({ onExampleSearch, onSelectPublished }: MarketplaceBrowseHintsProps) {
  const [filters, setFilters] = useState<MarketplaceLocationFilters>(defaultMarketplaceFilters());
  const publishedActions = filters.scope === "worldwide" && !filters.language && !filters.remoteOnly
    ? listPublishedActions()
    : searchPublishedActions("", filters);

  return (
    <aside className="an-act-marketplace-browse-hints" aria-label="Marketplace guide">
      <MarketplaceLocationFiltersBar onChange={setFilters} initial={filters} />
      <div className="an-act-marketplace-identity">
        <span className="an-act-marketplace-identity__badge">Action Marketplace</span>
        <p className="an-act-marketplace-identity__title">Action Marketplace</p>
        <p className="an-act-marketplace-identity__lead">
          Live providers ranked by real trust and availability appear above. The catalog below is a
          sample demo (this device only) to show how listings look.
        </p>
        <div className="an-act-marketplace-identity__stats">
          <div className="an-act-marketplace-identity__stat">
            <strong>Live</strong>
            <span>Ranked above</span>
          </div>
          <div className="an-act-marketplace-identity__stat">
            <strong>Live</strong>
            <span>Verification</span>
          </div>
          <div className="an-act-marketplace-identity__stat">
            <strong>24/7</strong>
            <span>Request tracking</span>
          </div>
        </div>
      </div>

      <ol className="an-act-marketplace-browse-hints__journey">
        <li>Search</li>
        <li>Compare</li>
        <li>Request</li>
        <li>Track</li>
      </ol>

      <LiveDiscoveryPanel />

      <div className="an-act-marketplace-browse-hints__examples">
        {MARKETPLACE_EXAMPLE_QUERIES.map((query) => (
          <button
            key={query}
            type="button"
            className="an-act-marketplace-browse-hints__chip"
            onClick={() => onExampleSearch(query)}
          >
            {query}
          </button>
        ))}
      </div>

      {publishedActions.length > 0 ? (
        <div className="an-act-marketplace-providers an-act-living-published-actions">
          <p className="an-act-marketplace-providers__label">Sample published actions · demo (this device only)</p>
          <div className="an-act-marketplace-providers__grid">
            {publishedActions.map((action) => {
              const snapshot = publishedActionToOpportunitySnapshot(action);
              return (
                <button
                  key={action.id}
                  type="button"
                  className="an-act-marketplace-provider-card an-act-marketplace-provider-card--published"
                  onClick={() => onSelectPublished?.(snapshot)}
                >
                  <div className="an-act-marketplace-provider-card__head">
                    {action.creator.photoUrl ? (
                      <img
                        className="an-act-marketplace-provider-card__photo"
                        src={action.creator.photoUrl}
                        alt=""
                      />
                    ) : (
                      <span className="an-act-marketplace-provider-card__avatar" aria-hidden="true">
                        {providerInitials(action.creator.fullName)}
                      </span>
                    )}
                    <div className="an-act-marketplace-provider-card__meta">
                      <p className="an-act-marketplace-provider-card__name">{action.creator.fullName}</p>
                      <p className="an-act-marketplace-provider-card__service">{action.blueprint.name.trim()}</p>
                      <span className="an-act-marketplace-provider-card__tier">
                        Live Frame · {action.creator.liveFrameTier}
                      </span>
                    </div>
                  </div>
                  <div className="an-act-marketplace-provider-card__signals">
                    <span className="an-act-marketplace-provider-card__signal">Published action</span>
                    <span className="an-act-marketplace-provider-card__signal">Quality {action.qualityScore}</span>
                    <span className="an-act-marketplace-provider-card__signal">{action.creator.classification}</span>
                  </div>
                  <span className="an-act-marketplace-provider-card__cta">View action →</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="an-act-marketplace-providers">
        <p className="an-act-marketplace-providers__label">Demo catalog · sample providers (not live accounts)</p>
        <div className="an-act-marketplace-providers__grid">
          {MARKETPLACE_FEATURED_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className="an-act-marketplace-provider-card"
              onClick={() => onExampleSearch(provider.searchKeyword)}
            >
              <div className="an-act-marketplace-provider-card__head">
                <span className="an-act-marketplace-provider-card__avatar" aria-hidden="true">
                  {providerInitials(provider.providerName)}
                </span>
                <div className="an-act-marketplace-provider-card__meta">
                  <p className="an-act-marketplace-provider-card__name">{provider.providerName}</p>
                  <p className="an-act-marketplace-provider-card__service">{provider.serviceName}</p>
                  <span className="an-act-marketplace-provider-card__tier">Live Frame · {provider.liveFrameTier}</span>
                </div>
              </div>
              <div className="an-act-marketplace-provider-card__signals">
                <span className="an-act-marketplace-provider-card__signal">
                  ★ <strong>{provider.rating.toFixed(1)}</strong>
                </span>
                <span className="an-act-marketplace-provider-card__signal">
                  {provider.experienceYears} yrs experience
                </span>
                <span className="an-act-marketplace-provider-card__signal">Responds {provider.responseTime.toLowerCase()}</span>
                <span className="an-act-marketplace-provider-card__signal">{provider.availability}</span>
              </div>
              <span className="an-act-marketplace-provider-card__cta">View profile →</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function NeedNoResultsHint({ keyword }: { keyword: string }) {
  return (
    <div className="ds-empty ds-fade-in" role="status">
      <span className="ds-empty__icon" aria-hidden="true">
        ∅
      </span>
      <strong className="ds-title">No results for “{keyword}”</strong>
      <p className="ds-caption">Try electrician, consultant, HVAC, or marketing from the beta catalog.</p>
    </div>
  );
}
