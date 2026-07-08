import { assertRuntimeScreenView } from "@an-act/runtime-core";
import type { AnActRuntimeScreenView } from "@an-act/runtime-core";
import { ComponentDispatcher, createComponentDispatcher } from "./component-dispatcher.js";
import type { RenderedRuntimeScreen, RenderedRuntimeSection } from "./render-node.js";
import { createRenderContext } from "./registry/default-components.js";

export class RuntimeScreenRenderer {
  private readonly dispatcher: ComponentDispatcher;

  constructor(dispatcher?: ComponentDispatcher) {
    this.dispatcher = dispatcher ?? createComponentDispatcher();
  }

  render(screen: AnActRuntimeScreenView | unknown): RenderedRuntimeScreen {
    const view = assertRuntimeScreenView(screen);
    const context = createRenderContext(view.screenId, view.route, view.mode);

    const sections: RenderedRuntimeSection[] = view.sections.map((section) => ({
      id: section.id,
      label: section.label,
      purpose: section.purpose,
      nodes: section.components.map((component) => this.dispatcher.dispatch(component, context)),
    }));

    return {
      screenId: view.screenId,
      route: view.route,
      mode: view.mode,
      layoutId: view.layoutId,
      regions: [...view.regions],
      sections,
      navigation: { ...view.navigation },
      accessibility: { ...view.accessibility },
      themeId: context.theme.id,
      generatedAt: view.generatedAt,
    };
  }
}

export function renderRuntimeScreen(screen: AnActRuntimeScreenView | unknown): RenderedRuntimeScreen {
  return new RuntimeScreenRenderer().render(screen);
}
