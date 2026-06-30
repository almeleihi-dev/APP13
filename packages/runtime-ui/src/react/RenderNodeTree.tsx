import React, { type ReactNode } from "react";
import type { RenderNode } from "../render-node.js";
import {
  AnActButton,
  AnActCard,
  AnActHeader,
  AnActLiveFrame,
  AnActNavigation,
  type RelayIntent,
} from "./components/P0Components.js";

export interface RenderNodeTreeProps {
  node: RenderNode;
  onRelay?: (intent: RelayIntent) => void;
}

export function RenderNodeTree({ node, onRelay }: RenderNodeTreeProps): ReactNode {
  const children = node.children?.map((child) => (
    <RenderNodeTree key={child.key} node={child} onRelay={onRelay} />
  ));

  switch (node.element) {
    case "an-act-button":
      return <AnActButton node={node} onRelay={onRelay} />;
    case "an-act-card":
      return (
        <AnActCard node={node} onRelay={onRelay}>
          {children}
        </AnActCard>
      );
    case "an-act-live-frame":
      return <AnActLiveFrame node={node}>{children}</AnActLiveFrame>;
    case "an-act-header":
      return <AnActHeader node={node}>{children}</AnActHeader>;
    case "an-act-navigation":
      return <AnActNavigation node={node} onRelay={onRelay} />;
    case "text":
      return <span data-runtime-text={node.key}>{String(node.props?.text ?? "")}</span>;
    case "search":
      return (
        <label data-component-id={node.componentId} style={{ display: "grid", gap: "8px", ...(node.style as object) }}>
          <span>{node.accessibility?.label ?? "Search"}</span>
          <input
            type="search"
            placeholder={String(node.props?.placeholder ?? "")}
            readOnly
            onClick={() => {
              const route = typeof node.props?.route === "string" ? node.props.route : undefined;
              if (route) {
                onRelay?.({ route });
              }
            }}
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              border: `1px solid ${node.style?.borderColor ?? "currentColor"}`,
              background: "transparent",
              color: "inherit",
              font: "inherit",
            }}
          />
        </label>
      );
    case "chip":
      return (
        <button
          type="button"
          data-component-id={node.componentId}
          style={{ ...(node.style as object), border: "1px solid currentColor", borderRadius: "999px", cursor: "pointer" }}
          onClick={() => {
            const category = node.props?.category;
            if (category) {
              onRelay?.({ actionId: "need.search", body: { category: String(category) } });
            }
          }}
        >
          {String(node.props?.label ?? "")}
        </button>
      );
    default:
      return (
        <div
          data-component-id={node.componentId}
          data-runtime-element={node.element}
          style={node.style as object}
          aria-label={node.accessibility?.label}
        >
          {children}
        </div>
      );
  }
}
