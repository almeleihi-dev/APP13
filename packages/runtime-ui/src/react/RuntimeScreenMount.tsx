import React from "react";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import { ComponentDispatcher } from "../component-dispatcher.js";
import { RuntimeScreenRenderer } from "../runtime-screen-renderer.js";
import type { RenderedRuntimeScreen } from "../render-node.js";
import { ListSectionProvider } from "./list-section-context.js";
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
  return (
    sectionId.includes("cards") ||
    sectionId.includes("results") ||
    sectionId.includes("opportunities") ||
    sectionId.includes("activity")
  );
}

export function RuntimeScreenMount({ screen, onRelay }: RuntimeScreenMountProps) {
  const rendered = screenRenderer.render(screen);

  const isEmptyState = rendered.screenId === "empty-state";

  return (
    <div
      className="an-act-screen an-act-screen--premium an-act-screen--p12"
      data-screen-id={rendered.screenId}
      data-route={rendered.route}
      data-mode={rendered.mode}
    >
      {rendered.sections.map((section, sectionIndex) => {
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
            <section
              key={section.id}
              className="an-act-section an-act-section--premium an-act-section--p12 an-act-section--stagger"
              data-section-id={section.id}
              aria-label={section.label}
              style={{ animationDelay: `${sectionIndex * 40}ms` }}
            >
              <h2 className="an-act-section__label">{section.label}</h2>
              <ListSectionProvider>
                <div data-component-id="core-ui-list" role="list" className="an-act-section an-act-opportunity-list">
                  {nodes}
                </div>
              </ListSectionProvider>
            </section>
          );
        }

        return (
          <section
            key={section.id}
            className="an-act-section an-act-section--premium an-act-section--p12 an-act-section--stagger"
            data-section-id={section.id}
            data-section-purpose={section.purpose}
            aria-label={section.label}
            style={{ animationDelay: `${sectionIndex * 40}ms` }}
          >
            <h2 className="an-act-section__label">{section.label}</h2>
            {nodes}
          </section>
        );
      })}
    </div>
  );
}

function AnActEmptyStateWrapper({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      data-component-id="core-ui-empty-state"
      className="an-act-card an-act-empty-state"
      role="status"
      aria-label={label}
      style={{ borderStyle: "dashed", boxShadow: "var(--an-act-elevation-none)" }}
    >
      {children}
    </div>
  );
}
