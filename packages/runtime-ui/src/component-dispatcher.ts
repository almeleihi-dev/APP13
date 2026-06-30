import type { CoreUiComponentId } from "@an-act/runtime-core";
import type { RuntimeComponentInstance } from "@an-act/runtime-core";
import { CORE_UI_COMPONENT_IDS } from "@an-act/runtime-core";
import type { ComponentRenderer, RenderContext, RenderNode } from "./render-node.js";
import { createDefaultComponentRenderers } from "./registry/default-components.js";

export class ComponentDispatcher {
  private readonly registry = new Map<string, ComponentRenderer>();

  constructor(initial?: Partial<Record<CoreUiComponentId, ComponentRenderer>>) {
    const defaults = createDefaultComponentRenderers();
    for (const id of CORE_UI_COMPONENT_IDS) {
      this.registry.set(id, initial?.[id] ?? defaults[id]);
    }
  }

  register(componentId: CoreUiComponentId, renderer: ComponentRenderer): void {
    this.registry.set(componentId, renderer);
  }

  has(componentId: string): boolean {
    return this.registry.has(componentId);
  }

  dispatch(instance: RuntimeComponentInstance, context: RenderContext): RenderNode {
    const renderer = this.registry.get(instance.componentId);
    if (!renderer) {
      return {
        key: instance.id,
        element: "unknown-component",
        componentId: instance.componentId,
        props: instance.props,
        accessibility: instance.accessibility,
        children: [
          {
            key: `${instance.id}-fallback`,
            element: "text",
            props: { text: `Unregistered component: ${instance.componentId}` },
          },
        ],
      };
    }
    return renderer(instance, context);
  }

  listRegistered(): string[] {
    return [...this.registry.keys()];
  }
}

export function createComponentDispatcher(
  overrides?: Partial<Record<CoreUiComponentId, ComponentRenderer>>
): ComponentDispatcher {
  return new ComponentDispatcher(overrides);
}
