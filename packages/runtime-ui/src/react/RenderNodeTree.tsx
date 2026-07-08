import React, { type ReactNode } from "react";
import type { RenderNode } from "../render-node.js";
import {
  AnActButton,
  AnActCard,
  AnActHeader,
  AnActLiveFrame,
  AnActNavigation,
} from "./components/P0Components.js";
import {
  AnActAvatar,
  AnActBadge,
  AnActChip,
  AnActEmptyState,
  AnActError,
  AnActInput,
  AnActList,
  AnActLoading,
  AnActOpportunityCard,
  AnActSearch,
  AnActSection,
  type RelayIntent,
} from "./components/P1Components.js";

export interface RenderNodeTreeProps {
  node: RenderNode;
  onRelay?: (intent: RelayIntent) => void;
  screenId?: string;
}

export function RenderNodeTree({ node, onRelay, screenId = "" }: RenderNodeTreeProps): ReactNode {
  const children = node.children?.map((child) => (
    <RenderNodeTree key={child.key} node={child} onRelay={onRelay} screenId={screenId} />
  ));

  switch (node.element) {
    case "an-act-button":
      return <AnActButton node={node} onRelay={onRelay} screenId={screenId} />;
    case "an-act-card":
      return (
        <AnActCard node={node} onRelay={onRelay} screenId={screenId}>
          {children}
        </AnActCard>
      );
    case "an-act-opportunity-card":
      return <AnActOpportunityCard node={node} onRelay={onRelay} />;
    case "an-act-live-frame":
      return <AnActLiveFrame node={node}>{children}</AnActLiveFrame>;
    case "an-act-header":
      return <AnActHeader node={node}>{children}</AnActHeader>;
    case "an-act-navigation":
      return <AnActNavigation node={node} onRelay={onRelay} />;
    case "an-act-input":
      return <AnActInput node={node} onRelay={onRelay} />;
    case "an-act-search":
      return <AnActSearch node={node} onRelay={onRelay} />;
    case "an-act-chip":
      return <AnActChip node={node} onRelay={onRelay} />;
    case "an-act-badge":
      return <AnActBadge node={node} />;
    case "an-act-avatar":
      return <AnActAvatar node={node} />;
    case "an-act-list":
      return <AnActList node={node}>{children}</AnActList>;
    case "an-act-section":
      return <AnActSection node={node}>{children}</AnActSection>;
    case "an-act-empty-state":
      return (
        <AnActEmptyState node={node} onRelay={onRelay}>
          {children}
        </AnActEmptyState>
      );
    case "an-act-loading":
      return <AnActLoading node={node} />;
    case "an-act-error":
      return <AnActError node={node} />;
    case "an-act-progress": {
      const value = Number(node.props?.value ?? 0);
      return (
        <div data-component-id={node.componentId} role="progressbar" aria-valuenow={value} style={node.style as object}>
          <div style={{ height: "4px", background: "currentColor", opacity: 0.2, borderRadius: "999px" }}>
            <div style={{ width: `${Math.round(value * 100)}%`, height: "100%", background: "currentColor", borderRadius: "999px" }} />
          </div>
          {node.props?.stageTexts ? <span style={{ fontSize: "12px" }}>{String(node.props.stageText ?? "")}</span> : null}
        </div>
      );
    }
    case "text":
      return <span data-runtime-text={node.key}>{String(node.props?.text ?? "")}</span>;
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
