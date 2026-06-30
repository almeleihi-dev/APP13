import React, { type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { RenderNode } from "../../render-node.js";
import { AnActLiveFrame, type RelayIntent } from "./P0Components.js";
import { AnActBrandLoading } from "../brand/AnActBrandLoading.js";

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

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("keyword") as HTMLInputElement | null;
    const keyword = input?.value ?? "";
    onRelay?.({ actionId: "need.search", body: { keyword } });
  };

  return (
    <form
      data-component-id={node.componentId}
      onSubmit={submit}
      style={{ display: "grid", gap: "var(--an-act-spacing-space-8)", ...(style as object) }}
    >
      <span className="an-act-section__label">{node.accessibility?.label ?? "Search"}</span>
      <input
        name="keyword"
        type="search"
        defaultValue={String(node.props?.value ?? "")}
        placeholder={String(node.props?.placeholder ?? "Search...")}
        style={{
          minHeight: "var(--an-act-touch-target-min)",
          padding: "var(--an-act-spacing-space-12) var(--an-act-spacing-space-16)",
          borderRadius: "var(--an-act-radius-large)",
          border: `1px solid var(--an-act-color-border-default)`,
          background: "var(--an-act-color-surface-primary)",
          color: "inherit",
          font: "inherit",
        }}
      />
      <button type="submit" className="an-act-button an-act-button--primary" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

export function AnActChip({ node, onRelay }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  const selected = Boolean(node.props?.selected);
  return (
    <button
      type="button"
      className="an-act-button an-act-button--secondary"
      data-component-id={node.componentId}
      aria-pressed={selected}
      style={{
        ...(style as object),
        minHeight: "44px",
        borderRadius: "var(--an-act-radius-pill)",
        fontWeight: selected ? 600 : 400,
        borderColor: selected ? "var(--an-act-color-accent-primary)" : undefined,
      }}
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
      className="an-act-card"
      style={{
        textAlign: "center",
        borderStyle: "dashed",
        boxShadow: "var(--an-act-elevation-none)",
      }}
      role="status"
    >
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

  return (
    <article
      className={`an-act-card an-act-card--interactive`}
      data-component-id={node.componentId}
      style={style}
      role="article"
      tabIndex={opportunityId ? 0 : undefined}
      onClick={() => {
        if (opportunityId) {
          onRelay?.({ actionId: "need.select-opportunity", body: { opportunity_id: opportunityId } });
        }
      }}
      onKeyDown={(event) => {
        if (opportunityId && (event.key === "Enter" || event.key === " ")) {
          onRelay?.({ actionId: "need.select-opportunity", body: { opportunity_id: opportunityId } });
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--an-act-spacing-space-12)", justifyContent: "space-between" }}>
        <strong style={{ fontFamily: "var(--an-act-typography-title-font-family)", fontSize: "var(--an-act-typography-title-font-size)" }}>
          {String(node.props?.title ?? "")}
        </strong>
        {liveFrame?.tier ? (
          <AnActLiveFrame
            node={{
              key: `${node.key}-live-frame`,
              element: "an-act-live-frame",
              componentId: "core-ui-live-frame",
              props: { uiTier: liveFrame.tier, label: String(liveFrame.tier) },
              style: { padding: "4px 12px" },
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          gap: "var(--an-act-spacing-space-12)",
          flexWrap: "wrap",
          fontSize: "var(--an-act-typography-caption-font-size)",
          color: "var(--an-act-color-text-secondary)",
        }}
      >
        {node.props?.rating != null ? <span>★ {String(node.props.rating)}</span> : null}
        {node.props?.distanceKm != null ? <span>{String(node.props.distanceKm)} km</span> : null}
        {node.props?.availability ? <span>{String(node.props.availability)}</span> : null}
        {node.props?.estimatedCostSar != null ? <span>{String(node.props.estimatedCostSar)} SAR</span> : null}
      </div>
      {badges.length > 0 ? (
        <div style={{ display: "flex", gap: "var(--an-act-spacing-space-8)", flexWrap: "wrap" }}>
          {badges.map((badge, index) => (
            <AnActBadge
              key={`${node.key}-badge-${index}`}
              node={{
                key: `${node.key}-badge-${index}`,
                element: "an-act-badge",
                componentId: "core-ui-badge",
                props: badge,
                style: {},
              }}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
