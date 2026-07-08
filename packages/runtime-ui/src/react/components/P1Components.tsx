import React, { type CSSProperties, type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import type { RenderNode } from "../../render-node.js";
import type { RelayIntent } from "./P0Components.js";
import { AnActBrandLoading } from "../brand/AnActBrandLoading.js";
import { useCardRoleInList } from "../list-section-context.js";

export type { RelayIntent };

export interface P1ComponentProps {
  node: RenderNode;
  children?: ReactNode;
  onRelay?: (intent: RelayIntent) => void;
}

export function AnActInput({ node, onRelay }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  const name = String(node.props?.name ?? node.key);
  const label = String(node.props?.label ?? name);
  const multiline = Boolean(node.props?.multiline);

  return (
    <label className="an-act-field" data-component-id={node.componentId} style={style}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={String(node.props?.value ?? "")}
          placeholder={String(node.props?.placeholder ?? "")}
          required={Boolean(node.props?.required)}
          rows={4}
          onChange={(event) =>
            onRelay?.({
              actionId: "need.update-draft",
              body: { [name]: event.currentTarget.value },
            })
          }
          style={{
            padding: "var(--an-act-spacing-space-12) var(--an-act-spacing-space-16)",
            borderRadius: "var(--an-act-radius-large)",
            border: `1px solid var(--an-act-color-border-default)`,
            background: "var(--an-act-color-surface-primary)",
            color: "inherit",
            font: "inherit",
            resize: "vertical",
            minHeight: "var(--an-act-touch-target-min)",
          }}
        />
      ) : (
        <input
          name={name}
          type="text"
          defaultValue={String(node.props?.value ?? "")}
          placeholder={String(node.props?.placeholder ?? "")}
          required={Boolean(node.props?.required)}
          onChange={(event) =>
            onRelay?.({
              actionId: "need.update-draft",
              body: { [name]: event.currentTarget.value },
            })
          }
        />
      )}
    </label>
  );
}

export function AnActSearch({ node, onRelay }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  const loading = Boolean(node.props?.loading);
  const liveSearch = Boolean(node.props?.liveSearch);
  const initialValue = String(node.props?.value ?? "");
  const [keyword, setKeyword] = useState(initialValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setKeyword(initialValue);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const submitSearch = (nextKeyword: string, immediate = false) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const run = () => {
      onRelay?.({ actionId: "need.search", body: { keyword: nextKeyword.trim() } });
    };
    if (immediate) {
      run();
      return;
    }
    debounceRef.current = setTimeout(run, 350);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch(keyword, true);
  };

  return (
    <form
      data-component-id={node.componentId}
      className="an-act-search-form an-act-search-form--premium"
      onSubmit={submit}
      style={{ display: "grid", gap: "var(--an-act-spacing-space-8)", ...(style as object) }}
    >
      <span className="an-act-section__label">{node.accessibility?.label ?? "Search marketplace"}</span>
      <div className="an-act-search-form__row">
        <div className="an-act-search-form__input-wrap">
          <span className="an-act-search-form__icon" aria-hidden="true">
            ⌕
          </span>
          <input
            name="keyword"
            type="search"
            className="an-act-search-form__input"
            value={keyword}
            placeholder={String(node.props?.placeholder ?? "Search services, professionals, programs...")}
            aria-busy={loading}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setKeyword(next);
              if (liveSearch) {
                submitSearch(next);
              }
            }}
          />
          {keyword ? (
            <button
              type="button"
              className="an-act-search-form__clear"
              aria-label="Clear search"
              onClick={() => {
                setKeyword("");
                if (liveSearch) {
                  submitSearch("", true);
                }
              }}
            >
              ×
            </button>
          ) : null}
        </div>
        <button type="submit" className="ds-btn ds-btn--primary" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      <div className="an-act-search-form__status" aria-live="polite">
        {loading ? (
          <>
            <span className="an-act-search-form__spinner" aria-hidden="true" />
            <span>Finding the best matches for you...</span>
          </>
        ) : keyword.trim().length === 0 ? (
          <span>Search live — results update as you type.</span>
        ) : null}
      </div>
    </form>
  );
}

export function AnActChip({ node, onRelay }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  const selected = Boolean(node.props?.selected);
  return (
    <button
      type="button"
      className="an-act-chip"
      data-component-id={node.componentId}
      aria-pressed={selected}
      onClick={() => {
        if (node.props?.query) {
          onRelay?.({ actionId: "need.search", body: { keyword: String(node.props.query) } });
          return;
        }
        if (node.props?.category) {
          onRelay?.({ actionId: "need.search", body: { keyword: "", category: String(node.props.category) } });
        }
      }}
    >
      {String(node.props?.label ?? "")}
    </button>
  );
}

export function AnActBadge({ node }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  return (
    <span
      data-component-id={node.componentId}
      style={{
        ...(style as object),
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "var(--an-act-radius-pill)",
        border: `1px solid var(--an-act-color-border-subtle)`,
        fontFamily: "var(--an-act-typography-label-font-family)",
        fontSize: "var(--an-act-typography-label-font-size)",
        fontWeight: "var(--an-act-typography-label-font-weight)",
        letterSpacing: "var(--an-act-typography-label-letter-spacing)",
        textTransform: "uppercase",
      }}
      role="status"
    >
      {String(node.props?.label ?? node.props?.status ?? "Badge")}
    </span>
  );
}

export function AnActAvatar({ node }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  const initials = String(node.props?.initials ?? node.props?.label ?? "?").slice(0, 2);
  return (
    <div
      data-component-id={node.componentId}
      style={{
        ...(style as object),
        width: "40px",
        height: "40px",
        borderRadius: "var(--an-act-radius-pill)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        background: "var(--an-act-color-accent-primary)",
        color: "var(--an-act-color-text-inverse)",
      }}
      aria-label={node.accessibility?.label}
    >
      {initials}
    </div>
  );
}

export function AnActList({ node, children }: P1ComponentProps) {
  return (
    <div
      data-component-id={node.componentId ?? "core-ui-list"}
      data-runtime-element="an-act-list"
      className="an-act-section"
      role="list"
      aria-label={node.accessibility?.label ?? String(node.props?.label ?? "List")}
    >
      {children}
    </div>
  );
}

export function AnActSection({ node, children }: P1ComponentProps) {
  return (
    <section
      className="an-act-section"
      data-component-id="core-ui-section"
      data-section-id={node.props?.sectionId}
      data-section-purpose={node.props?.purpose}
      aria-label={String(node.props?.label ?? "Section")}
    >
      {node.props?.label ? <h2 className="an-act-section__label">{String(node.props.label)}</h2> : null}
      {children}
    </section>
  );
}

export function AnActEmptyState({ node, children }: P1ComponentProps) {
  return (
    <div
      data-component-id="core-ui-empty-state"
      className="an-act-card an-act-empty-state"
      role="status"
    >
      {node.props?.title ? <strong>{String(node.props.title)}</strong> : null}
      {node.props?.summary || node.props?.message ? (
        <p style={{ margin: "8px 0 0", color: "var(--an-act-color-text-secondary)" }}>
          {String(node.props.summary ?? node.props.message)}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function AnActLoading({ node }: P1ComponentProps) {
  return (
    <div data-component-id={node.componentId}>
      <AnActBrandLoading
        stageText={String(node.props?.stageText ?? "Preparing...")}
        progress={typeof node.props?.progress === "number" ? node.props.progress : undefined}
      />
    </div>
  );
}

export function AnActError({ node }: P1ComponentProps) {
  return (
    <div
      data-component-id="core-ui-error"
      role="alert"
      className="an-act-card"
      style={{
        borderColor: "var(--an-act-color-status-error)",
        backgroundColor: "color-mix(in srgb, var(--an-act-color-status-error) 8%, transparent)",
        boxShadow: "var(--an-act-elevation-none)",
      }}
    >
      <strong>{String(node.props?.title ?? "Error")}</strong>
      <p style={{ margin: "8px 0 0" }}>{String(node.props?.detail ?? node.props?.message ?? "Something went wrong")}</p>
      {node.props?.code ? (
        <code style={{ fontSize: "var(--an-act-typography-caption-font-size)" }}>{String(node.props.code)}</code>
      ) : null}
    </div>
  );
}

export function AnActOpportunityCard({ node, onRelay }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  const liveFrame = node.props?.liveFrame as { tier?: string } | undefined;
  const badges = Array.isArray(node.props?.badges) ? (node.props.badges as Array<Record<string, unknown>>) : [];
  const opportunityId = typeof node.props?.opportunityId === "string" ? node.props.opportunityId : undefined;
  const title = String(node.props?.title ?? "");
  const titleParts = title.split("—").map((part) => part.trim());
  const providerName = titleParts[0] ?? title;
  const serviceName = titleParts.length > 1 ? titleParts.slice(1).join(" — ") : "Professional service";

  const relaySnapshot = () => {
    if (!opportunityId) {
      return;
    }
    onRelay?.({
      actionId: "need.view-opportunity",
      body: {
        opportunity_id: opportunityId,
        snapshot: {
          title,
          providerName,
          serviceName,
          opportunityId,
          liveFrame,
          rating: node.props?.rating,
          distanceKm: node.props?.distanceKm,
          availability: node.props?.availability,
          estimatedMinutes: node.props?.estimatedMinutes,
          estimatedCostSar: node.props?.estimatedCostSar,
          badges: badges.map((badge) => String(badge.label ?? badge.status ?? "")),
        },
      },
    });
  };

  const role = useCardRoleInList("article");

  return (
    <article
      className="an-act-card an-act-card--premium an-act-card--interactive an-act-card--elevated an-act-opportunity-card an-act-opportunity-card--premium an-act-opportunity-card--p12 an-act-card--live-frame-accent"
      data-component-id={node.componentId}
      style={style}
      role={role}
    >
      <div className="an-act-opportunity-card__top">
        <div className="an-act-opportunity-card__identity">
          <div className="ds-avatar" aria-hidden="true">
            {providerName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="an-act-opportunity-card__provider">{providerName}</h3>
            <p className="an-act-opportunity-card__service">{serviceName}</p>
          </div>
        </div>
        {liveFrame?.tier ? (
          <span className={`ds-badge ds-badge--live-frame ds-badge--live-frame-${liveFrame.tier}`}>
            Live Frame · {String(liveFrame.tier)}
          </span>
        ) : null}
      </div>

      <p className="an-act-opportunity-card__passport-preview">
        Professional passport on file · Platform verified · Live Frame monitored
      </p>

      <div className="an-act-opportunity-card__metrics">
        {node.props?.rating != null ? (
          <div className="an-act-opportunity-card__metric">
            <span className="an-act-opportunity-card__metric-label">Rating</span>
            <strong className="an-act-opportunity-card__metric-value">★ {String(node.props.rating)}</strong>
          </div>
        ) : null}
        {node.props?.distanceKm != null ? (
          <div className="an-act-opportunity-card__metric">
            <span className="an-act-opportunity-card__metric-label">Distance</span>
            <strong className="an-act-opportunity-card__metric-value">{String(node.props.distanceKm)} km</strong>
          </div>
        ) : null}
        {node.props?.estimatedCostSar != null ? (
          <div className="an-act-opportunity-card__price-block" aria-label="Estimated price">
            <small>From</small>
            <strong>{String(node.props.estimatedCostSar)} SAR</strong>
          </div>
        ) : null}
        {node.props?.estimatedCostSar == null && node.props?.availability ? (
          <div className="an-act-opportunity-card__metric">
            <span className="an-act-opportunity-card__metric-label">Available</span>
            <strong className="an-act-opportunity-card__metric-value">{String(node.props.availability)}</strong>
          </div>
        ) : null}
      </div>

      {badges.length > 0 ? (
        <div className="an-act-opportunity-card__badges" aria-label="Verification badges">
          {badges.map((badge, index) => (
            <span key={`${node.key}-badge-${index}`} className="ds-badge ds-badge--verified">
              {String(badge.label ?? badge.status ?? "")}
            </span>
          ))}
        </div>
      ) : null}

      {opportunityId ? (
        <div className="an-act-opportunity-card__cta">
        <button type="button" className="premium-btn premium-btn--secondary premium-btn--block ds-btn--ripple" onClick={relaySnapshot}>
          Preview passport
        </button>
          <button type="button" className="premium-btn premium-btn--primary premium-btn--block ds-btn--ripple" onClick={relaySnapshot}>
            View Details
          </button>
        </div>
      ) : null}
    </article>
  );
}
