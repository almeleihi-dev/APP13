import {
  resolveColor,
  resolveLiveFramePresentation,
  resolveSpacing,
  resolveTypography,
  type LiveFrameUiTier,
  type SemanticColorTokenPath,
} from "@an-act/tokens";
import type { CoreUiComponentId } from "@an-act/runtime-core";
import type { ComponentRenderer, RenderContext, RenderNode } from "../../render-node.js";
import { createDefaultComponentRenderers } from "../../registry/default-components.js";

function textChild(key: string, text: string): RenderNode {
  return { key, element: "text", props: { text } };
}

function p0Node(
  instance: {
    id: string;
    componentId: string;
    variant?: string;
    props: Record<string, unknown>;
    accessibility?: RenderNode["accessibility"];
  },
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

const renderButton: ComponentRenderer = (instance, ctx) => {
  const variant = instance.variant ?? "primary";
  const bgToken: SemanticColorTokenPath =
    variant === "secondary" ? "surface.primary" : variant === "ghost" ? "background.primary" : "interactive.default";
  const textToken: SemanticColorTokenPath =
    variant === "secondary" || variant === "ghost" ? "text.primary" : "text.inverse";
  const body = resolveTypography("body");
  return p0Node(instance, "an-act-button", {
    style: {
      color: ctx.resolveToken(textToken),
      backgroundColor: ctx.resolveToken(bgToken),
      borderColor: ctx.resolveToken("border.default"),
      padding: `${resolveSpacing("space-12")} ${resolveSpacing("space-24")}`,
      borderRadius: "12px",
      fontFamily: body.fontFamily,
      fontSize: body.fontSize,
      fontWeight: body.fontWeight,
      lineHeight: body.lineHeight,
      minHeight: "48px",
    },
    props: {
      ...instance.props,
      label: instance.props.label ?? instance.props.text,
      actionId: instance.props.actionId,
      route: instance.props.route,
    },
  });
};

const renderCard: ComponentRenderer = (instance, ctx) => {
  const titleStyle = resolveTypography("title");
  const bodyStyle = resolveTypography("body");
  const element = instance.props.opportunityId ? "an-act-opportunity-card" : "an-act-card";
  const children: RenderNode[] = element === "an-act-card"
    ? [textChild(`${instance.id}-title`, String(instance.props.title ?? instance.props.label ?? ""))]
    : [];
  if (element === "an-act-card" && instance.props.description) {
    children.push(textChild(`${instance.id}-desc`, String(instance.props.description)));
  }
  if (element === "an-act-card" && instance.props.summary) {
    children.push(textChild(`${instance.id}-summary`, String(instance.props.summary)));
  }
  return p0Node(instance, element, {
    style: {
      color: ctx.resolveToken("text.primary"),
      backgroundColor: ctx.resolveToken(instance.variant === "elevated" ? "surface.elevated" : "surface.primary"),
      borderColor: ctx.resolveToken("border.default"),
      padding: resolveSpacing("space-24"),
      borderRadius: "16px",
      fontFamily: bodyStyle.fontFamily,
      gap: resolveSpacing("space-8"),
    },
    props: {
      ...instance.props,
      titleStyle,
      bodyStyle,
      route: instance.props.route,
      actionId: instance.props.actionId,
    },
    children,
  });
};

const renderLiveFrame: ComponentRenderer = (instance, ctx) => {
  const uiTier = (typeof instance.props.uiTier === "string" ? instance.props.uiTier : "silver") as LiveFrameUiTier;
  const presentation = resolveLiveFramePresentation({ uiTier, mode: ctx.mode });
  const titleStyle = resolveTypography("title");
  return p0Node(instance, "an-act-live-frame", {
    style: {
      color: ctx.resolveToken("text.primary"),
      backgroundColor: ctx.resolveToken("surface.elevated"),
      borderColor: presentation.accentColor,
      padding: resolveSpacing("space-16"),
      borderRadius: "999px",
      fontFamily: titleStyle.fontFamily,
    },
    props: {
      uiTier: presentation.uiTier,
      label: instance.props.label ?? presentation.label,
      accentToken: presentation.accentToken,
    },
    children: [textChild(`${instance.id}-label`, String(instance.props.label ?? presentation.label))],
  });
};

const renderHeader: ComponentRenderer = (instance, ctx) => {
  const titleStyle = resolveTypography("title");
  const captionStyle = resolveTypography("caption");
  return p0Node(instance, "an-act-header", {
    style: {
      color: ctx.resolveToken("text.primary"),
      backgroundColor: ctx.resolveToken("background.primary"),
      borderColor: ctx.resolveToken("border.subtle"),
      padding: `${resolveSpacing("space-12")} ${resolveSpacing("space-16")}`,
      fontFamily: titleStyle.fontFamily,
      minHeight: "56px",
    },
    props: {
      title: instance.props.title,
      subtitle: instance.props.subtitle,
      titleStyle,
      captionStyle,
    },
    children: [
      textChild(`${instance.id}-title`, String(instance.props.title ?? "")),
      ...(instance.props.subtitle
        ? [textChild(`${instance.id}-subtitle`, String(instance.props.subtitle))]
        : []),
    ],
  });
};

const renderNavigation: ComponentRenderer = (instance, ctx) => {
  const isBottom = instance.componentId === "core-ui-bottom-navigation";
  const labelStyle = resolveTypography("caption");
  return p0Node(instance, "an-act-navigation", {
    style: {
      color: ctx.resolveToken("text.primary"),
      backgroundColor: ctx.resolveToken("background.primary"),
      borderColor: ctx.resolveToken("border.subtle"),
      padding: isBottom ? resolveSpacing("space-8") : `${resolveSpacing("space-12")} ${resolveSpacing("space-16")}`,
      gap: resolveSpacing("space-12"),
      minHeight: isBottom ? "64px" : "56px",
      fontFamily: labelStyle.fontFamily,
    },
    props: {
      ...instance.props,
      layout: isBottom ? "bottom" : "top",
      labelStyle,
    },
  });
};

export function createReactComponentRenderers(): Record<CoreUiComponentId, ComponentRenderer> {
  const defaults = createDefaultComponentRenderers();
  const renderers = { ...defaults };
  renderers["core-ui-button"] = renderButton;
  renderers["core-ui-card"] = renderCard;
  renderers["core-ui-live-frame"] = renderLiveFrame;
  renderers["core-ui-navigation-bar"] = (instance, ctx) => {
    if (instance.accessibility?.role === "banner" || instance.props.subtitle) {
      return renderHeader(instance, ctx);
    }
    return renderNavigation(instance, ctx);
  };
  renderers["core-ui-bottom-navigation"] = renderNavigation;
  renderers["core-ui-side-navigation"] = renderNavigation;
  renderers["core-ui-chip"] = (instance, ctx) =>
    p0Node(instance, "an-act-chip", {
      style: {
        color: ctx.resolveToken("text.primary"),
        backgroundColor: ctx.resolveToken(instance.props.selected ? "surface.elevated" : "surface.secondary"),
        borderColor: ctx.resolveToken(instance.props.selected ? "accent.primary" : "border.default"),
        padding: `${resolveSpacing("space-8")} ${resolveSpacing("space-16")}`,
      },
      props: instance.props,
    });
  renderers["core-ui-input"] = (instance, ctx) =>
    p0Node(instance, "an-act-input", {
      style: {
        color: ctx.resolveToken("text.primary"),
        borderColor: ctx.resolveToken("border.default"),
        gap: resolveSpacing("space-8"),
      },
      props: instance.props,
    });
  renderers["core-ui-search"] = (instance, ctx) =>
    p0Node(instance, "an-act-search", {
      style: {
        color: ctx.resolveToken("text.primary"),
        backgroundColor: ctx.resolveToken("surface.secondary"),
        borderColor: ctx.resolveToken("border.default"),
        padding: resolveSpacing("space-8"),
      },
      props: instance.props,
    });
  renderers["core-ui-badge"] = (instance, ctx) =>
    p0Node(instance, "an-act-badge", {
      style: {
        color: ctx.resolveToken("text.primary"),
        backgroundColor: ctx.resolveToken("surface.muted"),
        borderColor: ctx.resolveToken("border.subtle"),
      },
      props: instance.props,
    });
  renderers["core-ui-avatar"] = (instance, ctx) =>
    p0Node(instance, "an-act-avatar", {
      style: {
        color: ctx.resolveToken("text.inverse"),
        backgroundColor: ctx.resolveToken("accent.primary"),
      },
      props: instance.props,
    });
  renderers["core-ui-loading"] = (instance, ctx) =>
    p0Node(instance, "an-act-loading", {
      style: { color: ctx.resolveToken("text.primary"), backgroundColor: ctx.resolveToken("surface.secondary") },
      props: instance.props,
    });
  renderers["core-ui-progress"] = (instance, ctx) =>
    p0Node(instance, "an-act-progress", {
      style: { color: ctx.resolveToken("text.primary"), backgroundColor: ctx.resolveToken("surface.muted") },
      props: instance.props,
    });
  renderers["core-ui-contract-card"] = (instance, ctx) =>
    p0Node(instance, "an-act-card", {
      style: {
        color: ctx.resolveToken("text.primary"),
        backgroundColor: ctx.resolveToken("surface.elevated"),
        borderColor: ctx.resolveToken("accent.primary"),
        padding: resolveSpacing("space-24"),
        borderRadius: "16px",
      },
      props: instance.props,
      children: [textChild(`${instance.id}-title`, String(instance.props.title ?? "Contract"))],
    });
  return renderers;
}

export function createReactRenderContext(
  screenId: string,
  route: string,
  mode: "need" | "action" | "transition"
): RenderContext {
  return {
    theme: { id: mode === "action" ? "action-mode" : "need-mode", mode, colors: {} as RenderContext["theme"]["colors"] },
    mode,
    screenId,
    route,
    resolveToken: (path) => resolveColor(mode === "transition" ? "need" : mode, path),
  };
}
