import type { ContractRuntimeScreenView, ContractScreenSection } from "../domain/contract-screen.js";
import { CONTRACT_SCREEN_PROTOTYPE_MAP, CONTRACT_SCREEN_ROUTES } from "../domain/contract-screen.js";
import { resolveContractLayoutBinding } from "../domain/contract-layout.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildContractNavigationView, buildNavigationAccessibility } from "../application/contract-navigation.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import type { ContractScreenId } from "../domain/contract-screen.js";

export interface BuildContractScreenViewInput {
  screenId: ContractScreenId;
  sections: ContractScreenSection[];
  navigation: NavigationState;
  generatedAt: string;
  reducedMotion?: boolean;
}

export function buildRuntimeScreenView(input: BuildContractScreenViewInput): ContractRuntimeScreenView {
  const layout = resolveContractLayoutBinding(input.screenId);
  const prototype = getPrototype(CONTRACT_SCREEN_PROTOTYPE_MAP[input.screenId]);
  if (!prototype) {
    throw new Error(`Missing prototype for screen: ${input.screenId}`);
  }
  const navView = buildContractNavigationView(input.navigation, input.screenId);
  const accessibility = buildNavigationAccessibility();

  return {
    screenId: input.screenId,
    prototypeId: CONTRACT_SCREEN_PROTOTYPE_MAP[input.screenId],
    route: CONTRACT_SCREEN_ROUTES[input.screenId],
    mode: layout.mode,
    layoutId: layout.layoutId,
    designTokens: [...prototype.designTokens],
    typography: prototype.typography,
    spacing: prototype.spacing,
    regions: [...layout.regions],
    sections: input.sections,
    navigation: navView,
    accessibility: {
      ...accessibility,
      reducedMotion: input.reducedMotion ?? accessibility.reducedMotion,
    },
    generatedAt: input.generatedAt,
  };
}

export function buildComponentInstance(input: {
  id: string;
  componentId: string;
  variant?: string;
  props: Record<string, unknown>;
  label?: string;
  role?: string;
}): import("../domain/contract-screen.js").RuntimeComponentInstance {
  return {
    id: input.id,
    componentId: input.componentId,
    variant: input.variant,
    props: input.props,
    accessibility: {
      label: input.label,
      role: input.role,
      tabIndex: 0,
    },
  };
}
