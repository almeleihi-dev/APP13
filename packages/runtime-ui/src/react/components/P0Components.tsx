import React, { type CSSProperties, type ReactNode } from "react";
import type { RenderNode } from "../../render-node.js";
import { resolveComponentRelayIntent } from "@an-act/runtime-core";

export interface RelayIntent {
  actionId?: string;
  route?: string;
  body?: Record<string, unknown>;
}

export interface AnActButtonProps {
  node: RenderNode;
  onRelay?: (intent: RelayIntent) => void;
  screenId?: string;
}

export function AnActButton({ node, onRelay, screenId = "" }: AnActButtonProps) {
  const label = String(node.props?.label ?? node.props?.text ?? "");
  const variant = String(node.variant ?? node.props?.variant ?? "primary");
  const disabled = Boolean(node.props?.disabled);
  const style = node.style as CSSProperties;

  const handleClick = () => {
    if (disabled) {
      return;
    }
    const resolved = resolveComponentRelayIntent(node.props ?? {}, screenId);
    if (resolved) {
      onRelay?.(resolved);
      return;
    }
    onRelay?.({
      actionId: typeof node.props?.actionId === "string" ? node.props.actionId : undefined,
      route: typeof node.props?.route === "string" ? node.props.route : undefined,
      body: node.props?.payload as Record<string, unknown> | undefined,
    });
  };

  return (
    <button
      type="button"
      className={`an-act-button an-act-button--${variant}`}
      data-component-id={node.componentId}
      data-variant={variant}
      style={style}
      aria-label={node.accessibility?.label ?? label}
      disabled={disabled}
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
  screenId?: string;
}

export function AnActCard({ node, children, onRelay, screenId = "" }: AnActCardProps) {
  const style = node.style as CSSProperties;
  const elevated = node.variant === "elevated";
  const resolved = resolveComponentRelayIntent(node.props ?? {}, screenId);
  const route = typeof node.props?.route === "string" ? node.props.route : resolved?.route;
  const actionId = resolved?.actionId ?? (typeof node.props?.actionId === "string" ? node.props.actionId : undefined);
  const relayBody = resolved?.body;
  const interactive = Boolean(route || actionId || node.props?.opportunityId);

  return (
    <article
      className={`an-act-card${elevated ? " an-act-card--elevated" : ""}${interactive ? " an-act-card--interactive" : ""}`}
      data-component-id={node.componentId}
      style={style}
      role={node.accessibility?.role ?? "article"}
      aria-label={node.accessibility?.label}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onRelay?.({ route, actionId, body: relayBody }) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                onRelay?.({ route, actionId, body: relayBody });
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
      className="an-act-live-frame"
      data-component-id={node.componentId}
      data-ui-tier={uiTier}
      style={{ ...style, borderColor: style.borderColor ?? "currentColor", color: style.borderColor ?? "inherit" }}
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
  const titleStyle = node.props?.titleStyle as CSSProperties | undefined;
  const captionStyle = node.props?.captionStyle as CSSProperties | undefined;
  const childArray = React.Children.toArray(children);

  return (
    <header
      data-component-id={node.componentId}
      className="an-act-app-shell__header"
      style={{ position: "relative", ...style }}
      role="banner"
      aria-label={node.accessibility?.label}
    >
      {childArray[0] ? (
        <div style={{ ...(titleStyle as object), margin: 0, fontSize: titleStyle?.fontSize ?? "var(--an-act-typography-title-font-size)" }}>
          {childArray[0]}
        </div>
      ) : null}
      {childArray[1] ? (
        <div style={{ ...(captionStyle as object), margin: 0, opacity: 0.75 }}>
          {childArray[1]}
        </div>
      ) : null}
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
  const layoutClass = layout === "bottom" ? "an-act-navigation--bottom" : "an-act-navigation--top";

  return (
    <nav
      className={`an-act-navigation ${layoutClass}`}
      data-component-id={node.componentId}
      data-layout={layout}
      style={style}
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
            className="an-act-navigation__item"
            data-nav-id={id}
            aria-current={item.id === node.props?.activeId ? "page" : undefined}
            onClick={() => route && onRelay?.({ route })}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
