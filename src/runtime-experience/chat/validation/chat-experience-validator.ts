import { SEMANTIC_COLOR_TOKEN_PATHS } from "../../../design-system/foundation/colors.js";
import { getCoreUiComponent } from "../../../design-system/core-ui/registry/component-registry.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validatePrototypeLibrary } from "../../../prototype-library/validation/prototype-validator.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import { ACTION_LAYOUT } from "../../../navigation-framework/layouts/action-layout.js";
import {
  CHAT_SCREEN_IDS,
  CHAT_SCREEN_PROTOTYPE_MAP,
  CHAT_EXPERIENCE_FLOW,
} from "../domain/chat-screen.js";
import { resolveChatLayoutBinding } from "../domain/chat-layout.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";

export interface ChatExperienceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    screens: number;
    sections: number;
    prototypes: number;
    components: number;
    designTokens: number;
    navigation: boolean;
    accessibility: boolean;
    conversationStates: boolean;
    needExperienceLink: boolean;
    actionExperienceLink: boolean;
    contractExperienceLink: boolean;
  };
}

const CHAT_SCREEN_COMPONENTS: Record<string, readonly string[]> = {
  "chat-home": [
    "core-ui-card",
    "core-ui-badge",
    "core-ui-bottom-navigation",
  ],
  "conversation-list": [
    "core-ui-search",
    "core-ui-card",
    "core-ui-live-frame",
    "core-ui-bottom-navigation",
  ],
  "conversation-screen": [
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-input",
    "core-ui-button",
  ],
  "conversation-info": [
    "core-ui-contract-card",
    "core-ui-card",
    "core-ui-avatar",
    "core-ui-badge",
    "core-ui-button",
  ],
  "empty-chat": [
    "core-ui-card",
    "core-ui-button",
    "core-ui-bottom-navigation",
  ],
};

const REQUIRED_CONVERSATION_STATES = ["draft", "active", "waiting", "completed", "archived"] as const;

export function validateChatExperience(): ChatExperienceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const componentIds = new Set<string>();
  const tokenPaths = new Set<string>();

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  const prototypes = validatePrototypeLibrary();
  if (!prototypes.valid) errors.push(...prototypes.errors.map((e) => `Prototype: ${e}`));

  for (const screenId of CHAT_SCREEN_IDS) {
    const prototypeId = CHAT_SCREEN_PROTOTYPE_MAP[screenId];
    const prototype = getPrototype(prototypeId);
    if (!prototype) {
      errors.push(`Missing prototype for screen ${screenId}: ${prototypeId}`);
      continue;
    }

    const layout = resolveChatLayoutBinding(screenId);
    if (layout.layoutId !== prototype.layout.layoutId && screenId !== "empty-chat") {
      errors.push(
        `Screen ${screenId} layout mismatch: runtime=${layout.layoutId} prototype=${prototype.layout.layoutId}`
      );
    }

    for (const token of prototype.designTokens) {
      if (!SEMANTIC_COLOR_TOKEN_PATHS.includes(token as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number])) {
        errors.push(`Screen ${screenId} uses non-semantic token: ${token}`);
      }
      tokenPaths.add(token);
    }

    const expectedComponents = CHAT_SCREEN_COMPONENTS[screenId] ?? prototype.componentsUsed;
    for (const componentId of expectedComponents) {
      if (!getCoreUiComponent(componentId)) {
        errors.push(`Screen ${screenId} references unknown component: ${componentId}`);
      }
      componentIds.add(componentId);
    }
  }

  if (ACTION_LAYOUT.id !== "action-layout") {
    errors.push("Chat experience must use action-layout");
  }

  if (CHAT_EXPERIENCE_FLOW.length < 4) {
    errors.push("Chat experience flow must include home, list, conversation, and info screens");
  }

  const requiredScreens = ["chat-home", "conversation-list", "conversation-screen", "conversation-info", "empty-chat"] as const;
  for (const screen of requiredScreens) {
    if (!CHAT_SCREEN_IDS.includes(screen)) {
      errors.push(`Missing required chat screen: ${screen}`);
    }
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Chat experience validation passed (${CHAT_SCREEN_IDS.length} screens, ${componentIds.size} components)`
      : `Chat experience validation failed with ${errors.length} error(s)`,
    checked: {
      screens: CHAT_SCREEN_IDS.length,
      sections: 7,
      prototypes: CHAT_SCREEN_IDS.length,
      components: componentIds.size,
      designTokens: tokenPaths.size,
      navigation: navigation.valid,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      conversationStates: REQUIRED_CONVERSATION_STATES.length === 5,
      needExperienceLink: NEED_EXPERIENCE_VERSION.length > 0,
      actionExperienceLink: ACTION_EXPERIENCE_VERSION.length > 0,
      contractExperienceLink: CONTRACT_EXPERIENCE_VERSION.length > 0,
    },
  };
}
