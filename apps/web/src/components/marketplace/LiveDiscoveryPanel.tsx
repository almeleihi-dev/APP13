import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DiscoverActionResult,
  DiscoverProviderResult,
} from "@an-act/runtime-client";
import { useRuntime } from "../../providers/RuntimeProvider.js";

/**
 * LiveDiscoveryPanel — the REAL, backend-backed marketplace discovery layer
 * (Production Candidate Phase 4). Read-only.
 *
 * Pulls ranked providers (GET /discover/providers) and the live action catalog
 * (GET /discover/actions). Everything shown here is real backend data: trust
 * score/tier, availability, completed contracts, rating, and ranking. When the
 * backend returns nothing, we show an honest empty state — we never invent
 * providers. Location modes are client-side display preferences (the backend
 * ranks by distance/availability), and are labelled as such.
 */
export interface LiveDiscoveryPanelProps {
  /** Optional search text to seed the provider/action query. */
  text?: string;
}

type LocationMode = "near_me" | "same_city" | "country" | "worldwide" | "remote";

const LOCATION_MODES: Array<{ value: LocationMode; label: string }> = [
  { value: "near_me", label: "Near me" },
  { value: "same_city", label: "Same city" },
  { value: "country", label: "Country-wide" },
  { value: "worldwide", label: "Worldwide" },
  { value: "remote", label: "Remote" },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function LiveDiscoveryPanel({ text }: LiveDiscoveryPanelProps) {
  const { client } = useRuntime();
  const [providers, setProviders] = useState<DiscoverProviderResult[]>([]);
  const [actions, setActions] = useState<DiscoverActionResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unauthenticated" | "error">("idle");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>("worldwide");

  const hasSession = client.auth.hasSession();

  const load = useCallback(async () => {
    if (!client.auth.hasSession()) {
      setStatus("unauthenticated");
      return;
    }
    setStatus("loading");
    try {
      const [providerRes, actionRes] = await Promise.all([
        client.discoverProviders({ text, availableNow: availableOnly || undefined, limit: 12 }),
        client.discoverActions({ text, limit: 12 }),
      ]);
      setProviders(providerRes.providers);
      setActions(actionRes.actions);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [client, text, availableOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  // Location mode is a client-side display preference only (no backend field).
  const visibleProviders = useMemo(() => {
    if (locationMode === "remote") {
      // Best-effort: surface available providers first for a remote intent.
      return [...providers].sort((a, b) => Number(b.available_now) - Number(a.available_now));
    }
    return providers;
  }, [providers, locationMode]);

  return (
    <section className="an-act-marketplace-providers" aria-label="Live providers from AN ACT">
      <div className="an-act-contract-experience__status-row">
        <span className="ds-flow__sample-badge" data-variant="live">
          Live · from AN ACT
        </span>
        <span className="ds-eyebrow">Real backend discovery</span>
      </div>

      <div className="an-act-marketplace-browse-hints__examples" role="group" aria-label="Discovery filters">
        <button
          type="button"
          className="an-act-marketplace-browse-hints__chip"
          aria-pressed={availableOnly}
          data-active={availableOnly ? "true" : undefined}
          onClick={() => setAvailableOnly((value) => !value)}
        >
          {availableOnly ? "✓ " : ""}Available now
        </button>
        {LOCATION_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            className="an-act-marketplace-browse-hints__chip"
            aria-pressed={locationMode === mode.value}
            data-active={locationMode === mode.value ? "true" : undefined}
            onClick={() => setLocationMode(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <p className="ds-caption" role="note">
        Location modes are display preferences. Live ranking uses real trust,
        availability, completion and rating signals from the backend.
      </p>

      {status === "loading" ? (
        <p className="ds-caption" role="status">
          Loading live providers…
        </p>
      ) : null}

      {status === "unauthenticated" ? (
        <p className="ds-caption" role="note">
          Sign in to see live providers ranked by real trust and availability.
        </p>
      ) : null}

      {status === "error" ? (
        <div className="ds-empty" role="alert">
          <strong className="ds-title">Couldn’t load live providers</strong>
          <p className="ds-caption">The discovery service didn’t respond.</p>
          <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm" onClick={() => void load()}>
            Try again
          </button>
        </div>
      ) : null}

      {status === "ready" && visibleProviders.length === 0 ? (
        <div className="ds-empty" role="status">
          <span className="ds-empty__icon" aria-hidden="true">
            ⌕
          </span>
          <strong className="ds-title">No live providers yet</strong>
          <p className="ds-caption">
            No verified providers match this search on AN ACT yet. As professionals join and get
            verified, they’ll appear here — nothing is simulated.
          </p>
        </div>
      ) : null}

      {status === "ready" && visibleProviders.length > 0 ? (
        <div className="an-act-marketplace-providers__grid">
          {visibleProviders.map((provider) => (
            <article
              key={provider.provider_id}
              className="an-act-marketplace-provider-card an-act-marketplace-provider-card--published"
            >
              <div className="an-act-marketplace-provider-card__head">
                <span className="an-act-marketplace-provider-card__avatar" aria-hidden="true">
                  {initials(provider.display_name)}
                </span>
                <div className="an-act-marketplace-provider-card__meta">
                  <p className="an-act-marketplace-provider-card__name">{provider.display_name}</p>
                  <p className="an-act-marketplace-provider-card__service">
                    {provider.action_codes.slice(0, 2).join(" · ") || "Professional"}
                  </p>
                  <span className="an-act-marketplace-provider-card__tier">
                    Live Frame · {provider.trust_tier} · {provider.trust_label}
                  </span>
                </div>
              </div>
              <div className="an-act-marketplace-provider-card__signals">
                <span className="an-act-marketplace-provider-card__signal">
                  Trust <strong>{Math.round(provider.trust_score)}</strong>
                </span>
                <span className="an-act-marketplace-provider-card__signal">
                  ★ <strong>{provider.average_rating.toFixed(1)}</strong>
                </span>
                <span className="an-act-marketplace-provider-card__signal">
                  {provider.completed_contracts} completed
                </span>
                <span className="an-act-marketplace-provider-card__signal">
                  {provider.available_now ? "Available now" : provider.availability.provider_status}
                </span>
              </div>
              {provider.ranking?.summary ? (
                <p className="ds-caption" style={{ margin: "var(--ds-space-2) 0 0" }}>
                  {provider.ranking.summary}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {status === "ready" && actions.length > 0 ? (
        <div className="an-act-living-published-actions" style={{ marginTop: "var(--ds-space-4)" }}>
          <p className="an-act-marketplace-providers__label">Browse by action · live provider counts</p>
          <div className="an-act-marketplace-browse-hints__examples">
            {actions.map((action) => (
              <span key={action.action_code} className="an-act-marketplace-browse-hints__chip">
                {action.action_name} · {action.provider_count}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
