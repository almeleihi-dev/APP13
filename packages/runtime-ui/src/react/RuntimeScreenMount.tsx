import React from "react";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import { ComponentDispatcher } from "../component-dispatcher.js";
import { RuntimeScreenRenderer } from "../runtime-screen-renderer.js";
import type { RenderedRuntimeScreen } from "../render-node.js";
import { createReactComponentRenderers } from "./registry/p0-renderers.js";
import { RenderNodeTree, type RenderNodeTreeProps } from "./RenderNodeTree.js";

const reactDispatcher = new ComponentDispatcher(createReactComponentRenderers());
const screenRenderer = new RuntimeScreenRenderer(reactDispatcher);

export interface RuntimeScreenMountProps {
  screen: AnActRuntimeScreenView;
  onRelay?: RenderNodeTreeProps["onRelay"];
}

export function renderRuntimeScreenReact(screen: AnActRuntimeScreenView): RenderedRuntimeScreen {
  return screenRenderer.render(screen);
}

function isListSection(sectionId: string): boolean {
  return sectionId.includes("cards") || sectionId.includes("results") || sectionId.includes("opportunities");
}

export function RuntimeScreenMount({ screen, onRelay }: RuntimeScreenMountProps) {
  const rendered = screenRenderer.render(screen);
  const isEmptyState = rendered.screenId === "empty-state";

  return (
    <div
      data-screen-id={rendered.screenId}
      data-route={rendered.route}
      data-mode={rendered.mode}
      style={{
        display: "grid",
        gap: "16px",
        padding: "16px",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      {rendered.sections.map((section) => {
        const sectionNode = {
          key: section.id,
          element: "an-act-section",
          props: { sectionId: section.id, label: section.label, purpose: section.purpose },
          style: { gap: "12px" },
        };
        const nodes = section.nodes.map((node) => (
          <RenderNodeTree key={node.key} node={node} onRelay={onRelay} screenId={rendered.screenId} />
        ));

        if (isEmptyState && section.id === "empty-content") {
          return (
            <AnActEmptyStateWrapper key={section.id} label={section.label}>
              {nodes}
            </AnActEmptyStateWrapper>
          );
        }

        if (isListSection(section.id) && section.nodes.length > 1) {
          return (
            <section key={section.id} data-section-id={section.id} aria-label={section.label} style={{ display: "grid", gap: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>{section.label}</h2>
              <div data-component-id="core-ui-list" role="list" style={{ display: "grid", gap: "12px" }}>
                {nodes}
              </div>
            </section>
          );
        }

        return (
          <section key={section.id} data-section-id={section.id} data-section-purpose={section.purpose} aria-label={section.label} style={{ display: "grid", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>{section.label}</h2>
            {nodes}
          </section>
        );
      })}
    </div>
  );
}

function AnActEmptyStateWrapper({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div data-component-id="core-ui-empty-state" role="status" aria-label={label} style={{ display: "grid", gap: "16px", padding: "24px", borderRadius: "16px", border: "1px dashed currentColor" }}>
      {children}
    </div>
  );
}
