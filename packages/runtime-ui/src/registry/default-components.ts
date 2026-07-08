import { resolveColor, resolveLiveFramePresentation, resolveSpacing, resolveTheme } from "@an-act/tokens";
import type { CoreUiComponentId } from "@an-act/runtime-core";
import type { ComponentRenderer, RenderContext, RenderNode } from "../render-node.js";

function baseNode(
  instance: { id: string; componentId: string; variant?: string; props: Record<string, unknown>; accessibility?: RenderNode["accessibility"] },
  element: string,
  extra?: Partial<RenderNode>
): RenderNode {
  return {
    key: instance.id,
    element,
    componentId: instance.componentId,
    variant: instance.variant,
    props: instance.props,
    accessibility: instance.accessibility,
    ...extra,
  };
}

function textChild(key: string, text: string): RenderNode {
  return { key, element: "text", props: { text } };
}

const renderButton: ComponentRenderer = (instance, ctx) =>
  baseNode(instance, "button", {
    style: {
      color: ctx.resolveToken("text.inverse"),
      backgroundColor: ctx.resolveToken("interactive.default"),
      padding: resolveSpacing("space-16"),
      borderRadius: "8px",
    },
    children: [textChild(`${instance.id}-label`, String(instance.props.label ?? instance.props.text ?? "Button"))],
  });

const renderCard: ComponentRenderer = (instance, ctx) =>
  baseNode(instance, "card", {
    style: {
      backgroundColor: ctx.resolveToken("surface.primary"),
      borderColor: ctx.resolveToken("border.default"),
      padding: resolveSpacing("space-24"),
      borderRadius: "12px",
    },
    children: [
      textChild(`${instance.id}-title`, String(instance.props.title ?? instance.props.label ?? "Card")),
    ],
  });

const renderLiveFrame: ComponentRenderer = (instance, ctx) => {
  const uiTier =
    typeof instance.props.uiTier === "string"
      ? (instance.props.uiTier as import("@an-act/tokens").LiveFrameUiTier)
      : "silver";
  const presentation = resolveLiveFramePresentation({ uiTier, mode: ctx.mode });
  return baseNode(instance, "live-frame", {
    style: {
      borderColor: presentation.accentColor,
      backgroundColor: ctx.resolveToken("surface.elevated"),
      padding: resolveSpacing("space-16"),
      borderRadius: "16px",
    },
    props: {
      ...instance.props,
      uiTier: presentation.uiTier,
      label: presentation.label,
      accentToken: presentation.accentToken,
    },
    children: [textChild(`${instance.id}-label`, presentation.label)],
  });
};

function renderGeneric(element: string): ComponentRenderer {
  return (instance, ctx) =>
    baseNode(instance, element, {
      style: {
        color: ctx.resolveToken("text.primary"),
        backgroundColor: ctx.resolveToken("surface.secondary"),
        padding: resolveSpacing("space-8"),
      },
      children: [textChild(`${instance.id}-label`, instance.componentId.replace("core-ui-", ""))],
    });
}

export function createDefaultComponentRenderers(): Record<CoreUiComponentId, ComponentRenderer> {
  const genericMap: Record<string, string> = {
    "core-ui-chip": "chip",
    "core-ui-badge": "badge",
    "core-ui-input": "input",
    "core-ui-search": "search",
    "core-ui-avatar": "avatar",
    "core-ui-progress": "progress",
    "core-ui-loading": "loading",
    "core-ui-toast": "toast",
    "core-ui-dialog": "dialog",
    "core-ui-modal": "modal",
    "core-ui-sheet": "sheet",
    "core-ui-navigation-bar": "navigation-bar",
    "core-ui-bottom-navigation": "bottom-navigation",
    "core-ui-floating-action-button": "fab",
    "core-ui-timeline-card": "timeline-card",
    "core-ui-contract-card": "contract-card",
    "core-ui-achievement-card": "achievement-card",
    "core-ui-analytics-card": "analytics-card",
    "core-ui-recommendation-card": "recommendation-card",
    "core-ui-side-navigation": "side-navigation",
  };
  const renderers = {} as Record<CoreUiComponentId, ComponentRenderer>;
  renderers["core-ui-button"] = renderButton;
  renderers["core-ui-card"] = renderCard;
  renderers["core-ui-live-frame"] = renderLiveFrame;

  for (const [componentId, element] of Object.entries(genericMap)) {
    renderers[componentId as CoreUiComponentId] = renderGeneric(element);
  }

  return renderers;
}

export function createRenderContext(
  screenId: string,
  route: string,
  mode: "need" | "action" | "transition"
): RenderContext {
  const theme = resolveTheme(mode);
  return {
    theme,
    mode,
    screenId,
    route,
    resolveToken: (path) => resolveColor(mode, path),
  };
}
