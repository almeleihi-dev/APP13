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

export function RuntimeScreenMount({ screen, onRelay }: RuntimeScreenMountProps) {
  const rendered = screenRenderer.render(screen);

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
      {rendered.sections.map((section) => (
        <section
          key={section.id}
          data-section-id={section.id}
          data-section-purpose={section.purpose}
          aria-label={section.label}
          style={{ display: "grid", gap: "12px" }}
        >
          {section.nodes.map((node) => (
            <RenderNodeTree key={node.key} node={node} onRelay={onRelay} />
          ))}
        </section>
      ))}
    </div>
  );
}
