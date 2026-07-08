import type { SemanticColorTokenPath } from "@an-act/tokens";
import type { ResolvedTheme } from "@an-act/tokens";

export interface RenderStyle {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  padding?: string;
  margin?: string;
  gap?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: string;
  borderRadius?: string;
  boxShadow?: string;
  minHeight?: string;
  border?: string;
  display?: string;
  alignItems?: string;
  justifyContent?: string;
  flexDirection?: string;
  width?: string;
}

export interface RenderAccessibility {
  label?: string;
  role?: string;
  tabIndex?: number;
  describedBy?: string;
}

export interface RenderNode {
  key: string;
  element: string;
  componentId?: string;
  variant?: string;
  props?: Record<string, unknown>;
  style?: RenderStyle;
  accessibility?: RenderAccessibility;
  children?: RenderNode[];
}

export interface RenderContext {
  theme: ResolvedTheme;
  mode: "need" | "action" | "transition";
  resolveToken: (path: SemanticColorTokenPath) => string;
  screenId: string;
  route: string;
}

export interface RenderedRuntimeSection {
  id: string;
  label: string;
  purpose: string;
  nodes: RenderNode[];
}

export interface RenderedRuntimeScreen {
  screenId: string;
  route: string;
  mode: "need" | "action" | "transition";
  layoutId: string;
  regions: string[];
  sections: RenderedRuntimeSection[];
  navigation: Record<string, unknown>;
  accessibility: Record<string, unknown>;
  themeId: string;
  generatedAt: string;
}

export type ComponentRenderer = (
  instance: import("@an-act/runtime-core").RuntimeComponentInstance,
  context: RenderContext
) => RenderNode;
