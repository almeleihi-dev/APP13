import React, { type CSSProperties, type FormEvent, type ReactNode } from "react";
import type { RenderNode } from "../../render-node.js";
import { AnActLiveFrame, type RelayIntent } from "./P0Components.js";

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
    <label data-component-id={node.componentId} style={{ display: "grid", gap: "8px", ...(style as object) }}>
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
            padding: "12px 16px",
            borderRadius: "12px",
            border: `1px solid ${style.borderColor ?? "currentColor"}`,
            background: "transparent",
            color: "inherit",
            font: "inherit",
            resize: "vertical",
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
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border: `1px solid ${style.borderColor ?? "currentColor"}`,
            background: "transparent",
            color: "inherit",
            font: "inherit",
          }}
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
    <form data-component-id={node.componentId} onSubmit={submit} style={{ display: "grid", gap: "8px", ...(style as object) }}>
      <span>{node.accessibility?.label ?? "Search"}</span>
      <input
        name="keyword"
        type="search"
        defaultValue={String(node.props?.value ?? "")}
        placeholder={String(node.props?.placeholder ?? "Search...")}
        style={{
          padding: "12px 16px",
          borderRadius: "12px",
          border: `1px solid ${style.borderColor ?? "currentColor"}`,
          background: "transparent",
          color: "inherit",
          font: "inherit",
        }}
      />
      <button type="submit" disabled={loading} style={{ padding: "10px 16px", cursor: "pointer" }}>
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
      data-component-id={node.componentId}
      aria-pressed={selected}
      style={{
        ...(style as object),
        border: `1px solid ${selected ? style.borderColor ?? "currentColor" : "currentColor"}`,
        borderRadius: "999px",
        cursor: "pointer",
        fontWeight: selected ? 600 : 400,
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
        borderRadius: "999px",
        border: `1px solid ${style.borderColor ?? "currentColor"}`,
        fontSize: "12px",
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
        borderRadius: "999px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
      }}
      aria-label={node.accessibility?.label}
    >
      {initials}
    </div>
  );
}

export function AnActList({ node, children }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  return (
    <div
      data-component-id={node.componentId ?? "core-ui-list"}
      data-runtime-element="an-act-list"
      style={{ display: "grid", gap: style.gap ?? "12px", ...(style as object) }}
      role="list"
      aria-label={node.accessibility?.label ?? String(node.props?.label ?? "List")}
    >
      {children}
    </div>
  );
}

export function AnActSection({ node, children }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  return (
    <section
      data-component-id="core-ui-section"
      data-section-id={node.props?.sectionId}
      data-section-purpose={node.props?.purpose}
      aria-label={String(node.props?.label ?? "Section")}
      style={{ display: "grid", gap: style.gap ?? "12px", ...(style as object) }}
    >
      {node.props?.label ? <h2 style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>{String(node.props.label)}</h2> : null}
      {children}
    </section>
  );
}

export function AnActEmptyState({ node, children, onRelay }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  return (
    <div
      data-component-id="core-ui-empty-state"
      style={{
        ...(style as object),
        display: "grid",
        gap: "16px",
        padding: "24px",
        textAlign: "center",
        borderRadius: "16px",
        border: `1px dashed ${style.borderColor ?? "currentColor"}`,
      }}
      role="status"
    >
      {children}
    </div>
  );
}

export function AnActLoading({ node }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  return (
    <div
      data-component-id={node.componentId}
      role="status"
      aria-live="polite"
      style={{ ...(style as object), display: "grid", gap: "8px", padding: "16px" }}
    >
      <strong>{String(node.props?.brandLine ?? "an act...")}</strong>
      <span>{String(node.props?.stageText ?? "Loading...")}</span>
    </div>
  );
}

export function AnActError({ node }: P1ComponentProps) {
  const style = node.style as CSSProperties;
  return (
    <div
      data-component-id="core-ui-error"
      role="alert"
      style={{
        ...(style as object),
        padding: "16px",
        borderRadius: "12px",
        border: `1px solid ${style.borderColor ?? "#dc2626"}`,
        backgroundColor: style.backgroundColor ?? "rgba(220,38,38,0.08)",
      }}
    >
      <strong>{String(node.props?.title ?? "Error")}</strong>
      <p style={{ margin: "8px 0 0" }}>{String(node.props?.detail ?? node.props?.message ?? "Something went wrong")}</p>
      {node.props?.code ? <code style={{ fontSize: "12px" }}>{String(node.props.code)}</code> : null}
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
      data-component-id={node.componentId}
      style={{ ...(style as object), border: `1px solid ${style.borderColor}`, borderRadius: "16px", padding: "16px", display: "grid", gap: "12px", cursor: opportunityId ? "pointer" : "default" }}
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
      <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
        <strong>{String(node.props?.title ?? "")}</strong>
        {liveFrame?.tier ? (
          <AnActLiveFrame
            node={{
              key: `${node.key}-live-frame`,
              element: "an-act-live-frame",
              componentId: "core-ui-live-frame",
              props: { uiTier: liveFrame.tier, label: String(liveFrame.tier) },
              style: { padding: "4px 12px", borderRadius: "999px" },
            }}
          />
        ) : null}
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "14px", opacity: 0.85 }}>
        {node.props?.rating != null ? <span>★ {String(node.props.rating)}</span> : null}
        {node.props?.distanceKm != null ? <span>{String(node.props.distanceKm)} km</span> : null}
        {node.props?.availability ? <span>{String(node.props.availability)}</span> : null}
        {node.props?.estimatedCostSar != null ? <span>{String(node.props.estimatedCostSar)} SAR</span> : null}
      </div>
      {badges.length > 0 ? (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
