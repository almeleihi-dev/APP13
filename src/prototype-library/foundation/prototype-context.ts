import type { AnActMode } from "../../design-system/foundation/transitions.js";
import { buildScreenContext } from "../../navigation-framework/foundation/screen-context.js";

export interface PrototypeContext {
  mode: AnActMode | "transition";
  reducedMotion: boolean;
  breakpoint: "compact" | "regular" | "expanded";
}

export function buildPrototypeContext(input?: Partial<PrototypeContext>): PrototypeContext {
  const mode = input?.mode ?? "need";
  return {
    mode,
    reducedMotion: input?.reducedMotion ?? false,
    breakpoint: input?.breakpoint ?? "compact",
  };
}

export function resolvePrototypeLayoutId(mode: PrototypeContext["mode"]): string {
  if (mode === "action") return "action-layout";
  if (mode === "transition") return "transition-layout";
  return "need-layout";
}

export function buildPrototypeScreenContext(mode: AnActMode | "transition" = "need") {
  if (mode === "transition") return buildScreenContext({ mode: "need", reducedMotion: false });
  return buildScreenContext({ mode, reducedMotion: false });
}
