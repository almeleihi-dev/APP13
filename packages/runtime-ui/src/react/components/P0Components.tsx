import React, { type CSSProperties, type ReactNode } from "react";
import type { RenderNode } from "../../render-node.js";

export interface RelayIntent {
  actionId?: string;
  route?: string;
  body?: Record<string, unknown>;
}

export interface AnActButtonProps {
  node: RenderNode;
  onRelay?: (intent: RelayIntent) => void;
}

export function AnActButton({ node, onRelay }: AnActButtonProps) {
  const label = String(node.props?.label ?? node.props?.text ?? "");
  const style = node.style as CSSProperties;
  const handleClick = () => {
    onRelay?.({
      actionId: typeof node.props?.actionId === "string" ? node.props.actionId : undefined,
      route: typeof node.props?.route === "string" ? node.props.route : undefined,
      body: node.props?.payload as Record<string, unknown> | undefined,
    });
  };

  return (
    <button
      type="button"
      data-component-id={node.componentId}
      style={{ ...style, border: `1px solid ${style.borderColor ?? "transparent"}`, cursor: "pointer" }}
      aria-label={node.accessibility?.label ?? label}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}

export interface AnActCardProps {
  node: RenderNode;
  children?: ReactNode;
  onRelay?: (intent: RelayIntent) => void;
}

export function AnActCard({ node, children, onRelay }: AnActCardProps) {
  const style = node.style as CSSProperties;
  const route = typeof node.props?.route === "string" ? node.props.route : undefined;
  const interactive = Boolean(route || node.props?.actionId);

  return (
    <article
      data-component-id={node.componentId}
      style={{ ...style, border: `1px solid ${style.borderColor}`, display: "grid", gap: style.gap }}
      role={node.accessibility?.role ?? "article"}
      aria-label={node.accessibility?.label}
      tabIndex={interactive ? 0 : undefined}
      onClick={
        interactive
          ? () =>
              onRelay?.({
                route,
                actionId: typeof node.props?.actionId === "string" ? node.props.actionId : undefined,
              })
          : undefined
      }
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                onRelay?.({ route, actionId: typeof node.props?.actionId === "string" ? node.props.actionId : undefined });
              }
            }
          : undefined
      }
    >
      {children}
    </article>
  );
}

export interface AnActLiveFrameProps {
  node: RenderNode;
  children?: ReactNode;
}

export function AnActLiveFrame({ node, children }: AnActLiveFrameProps) {
  const style = node.style as CSSProperties;
  const uiTier = String(node.props?.uiTier ?? "silver");
  return (
    <div
      data-component-id={node.componentId}
      data-ui-tier={uiTier}
      style={{ ...style, border: `2px solid ${style.borderColor}`, display: "inline-flex", alignItems: "center" }}
      role="img"
      aria-label={node.accessibility?.label ?? String(node.props?.label ?? "Live Frame")}
    >
      {children}
    </div>
  );
}

export interface AnActHeaderProps {
  node: RenderNode;
  children?: ReactNode;
}

export function AnActHeader({ node, children }: AnActHeaderProps) {
  const style = node.style as CSSProperties;
  return (
    <header
      data-component-id={node.componentId}
      style={{ ...style, borderBottom: `1px solid ${style.borderColor}`, display: "grid", gap: "4px" }}
      role="banner"
      aria-label={node.accessibility?.label}
    >
      {children}
    </header>
  );
}

export interface AnActNavigationProps {
  node: RenderNode;
  onRelay?: (intent: RelayIntent) => void;
}

export function AnActNavigation({ node, onRelay }: AnActNavigationProps) {
  const style = node.style as CSSProperties;
  const layout = String(node.props?.layout ?? "top");
  const items = Array.isArray(node.props?.items) ? (node.props.items as Array<Record<string, unknown>>) : [];

  return (
    <nav
      data-component-id={node.componentId}
      data-layout={layout}
      style={{
        ...style,
        borderTop: layout === "bottom" ? `1px solid ${style.borderColor}` : undefined,
        borderBottom: layout === "top" ? `1px solid ${style.borderColor}` : undefined,
        display: "flex",
        alignItems: "center",
        gap: style.gap,
        justifyContent: layout === "bottom" ? "space-around" : "flex-start",
      }}
      aria-label={node.accessibility?.label ?? "Navigation"}
    >
      {items.map((item) => {
        const id = String(item.id ?? "");
        const label = String(item.label ?? id);
        const route = typeof item.route === "string" ? item.route : undefined;
        return (
          <button
            key={id}
            type="button"
            data-nav-id={id}
            aria-current={item.id === node.props?.activeId ? "page" : undefined}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "8px 12px",
              font: "inherit",
            }}
            onClick={() => route && onRelay?.({ route })}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
