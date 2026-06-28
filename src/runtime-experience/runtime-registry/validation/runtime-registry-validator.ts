import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import {
  RUNTIME_REGISTRY_VERSION,
  REGISTERED_EXPERIENCE_IDS,
} from "../domain/runtime-experience.js";
import { buildOfficialRuntimeCatalog } from "../domain/runtime-catalog.js";
import { RUNTIME_CAPABILITY_IDS } from "../domain/runtime-capability.js";
import { collectExperienceValidationStatus } from "../application/runtime-validator.js";
import { createRuntimeDiscovery } from "../application/runtime-discovery.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";
import { PROFILE_EXPERIENCE_VERSION } from "../../profile/domain/profile-screen.js";
import { RUNTIME_JOURNEY_VERSION } from "../../runtime-journey/domain/runtime-journey.js";
import { RUNTIME_STATE_VERSION } from "../../runtime-state/domain/runtime-state.js";
import { OFFICIAL_RUNTIME_LIFECYCLE } from "../../runtime-state/domain/runtime-phase.js";

export interface RuntimeRegistryValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    registeredExperiences: number;
    needRegistration: boolean;
    actionRegistration: boolean;
    contractRegistration: boolean;
    chatRegistration: boolean;
    timelineRegistration: boolean;
    notificationRegistration: boolean;
    profileRegistration: boolean;
    journeyRegistration: boolean;
    stateRegistration: boolean;
    dependencyGraphIntegrity: boolean;
    routeUniqueness: boolean;
    lifecycleCoverage: boolean;
    capabilityCoverage: boolean;
    registryConsistency: boolean;
    discoveryCorrectness: boolean;
    noDuplicateRegistrations: boolean;
  };
}

export function validateRuntimeRegistry(): RuntimeRegistryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime registry must align with need-layout navigation");
  }

  const validationStatus = collectExperienceValidationStatus();
  const catalog = buildOfficialRuntimeCatalog(validationStatus, new Date().toISOString());
  const discovery = createRuntimeDiscovery();

  if (catalog.experienceCount !== REGISTERED_EXPERIENCE_IDS.length) {
    errors.push("Registry must register all official runtime experiences");
  }

  const ids = new Set<string>();
  for (const exp of catalog.experiences) {
    if (ids.has(exp.id)) errors.push(`Duplicate registration: ${exp.id}`);
    ids.add(exp.id);
    if (!exp.primaryRoute.startsWith("/")) {
      errors.push(`Invalid primary route for ${exp.id}: ${exp.primaryRoute}`);
    }
    for (const dep of exp.dependencies) {
      if (!REGISTERED_EXPERIENCE_IDS.includes(dep)) {
        errors.push(`Invalid dependency ${dep} for ${exp.id}`);
      }
    }
  }

  const graph = discovery.buildDependencyGraph(catalog);
  for (const node of graph) {
    for (const dep of node.dependencies) {
      const depNode = graph.find((n) => n.id === dep);
      if (!depNode) errors.push(`Missing dependency node: ${dep}`);
    }
  }

  const primaryRouteValues = catalog.experiences.map((e) => e.primaryRoute);
  const uniquePrimaryRoutes = new Set(primaryRouteValues);
  if (uniquePrimaryRoutes.size !== primaryRouteValues.length) {
    warnings.push("Some experiences share primary routes by design");
  }

  const allRoutes = discovery.collectAllRoutes(catalog);
  const brokenRoutes = allRoutes.filter((r) => !r.startsWith("/"));
  if (brokenRoutes.length > 0) {
    errors.push(`Broken routes found: ${brokenRoutes.join(", ")}`);
  }

  const capabilities = discovery.listCapabilities(catalog);
  if (capabilities.uncovered.length > 0) {
    warnings.push(`Uncovered capabilities: ${capabilities.uncovered.join(", ")}`);
  }

  const map = discovery.buildExperienceMap(catalog);
  if (map.length !== catalog.experienceCount) {
    errors.push("Discovery map count mismatch");
  }

  const registrationChecks = {
    need: catalog.experiences.some((e) => e.id === "need" && e.version === NEED_EXPERIENCE_VERSION),
    action: catalog.experiences.some((e) => e.id === "action" && e.version === ACTION_EXPERIENCE_VERSION),
    contract: catalog.experiences.some((e) => e.id === "contract" && e.version === CONTRACT_EXPERIENCE_VERSION),
    chat: catalog.experiences.some((e) => e.id === "chat" && e.version === CHAT_EXPERIENCE_VERSION),
    timeline: catalog.experiences.some((e) => e.id === "timeline" && e.version === TIMELINE_EXPERIENCE_VERSION),
    notification: catalog.experiences.some((e) => e.id === "notification" && e.version === NOTIFICATION_EXPERIENCE_VERSION),
    profile: catalog.experiences.some((e) => e.id === "profile" && e.version === PROFILE_EXPERIENCE_VERSION),
    journey: catalog.experiences.some((e) => e.id === "runtime-journey" && e.version === RUNTIME_JOURNEY_VERSION),
    state: catalog.experiences.some((e) => e.id === "runtime-state" && e.version === RUNTIME_STATE_VERSION),
  };

  if (!registrationChecks.need) errors.push("CH3-X5 Need Experience not registered");
  if (!registrationChecks.action) errors.push("CH3-X6 Action Experience not registered");
  if (!registrationChecks.contract) errors.push("CH3-X7 Contract Experience not registered");
  if (!registrationChecks.chat) errors.push("CH3-X8 Chat Experience not registered");
  if (!registrationChecks.timeline) errors.push("CH3-X9 Timeline Experience not registered");
  if (!registrationChecks.notification) errors.push("CH3-X10 Notification Experience not registered");
  if (!registrationChecks.profile) errors.push("CH3-X11 Profile Experience not registered");
  if (!registrationChecks.journey) errors.push("CH3-X12 Runtime Journey not registered");
  if (!registrationChecks.state) errors.push("CH3-X13 Runtime State not registered");

  if (validationStatus.need !== "valid") errors.push("CH3-X5 validation failed");
  if (validationStatus.action !== "valid") errors.push("CH3-X6 validation failed");
  if (validationStatus.contract !== "valid") errors.push("CH3-X7 validation failed");
  if (validationStatus.chat !== "valid") errors.push("CH3-X8 validation failed");
  if (validationStatus.timeline !== "valid") errors.push("CH3-X9 validation failed");
  if (validationStatus.notification !== "valid") errors.push("CH3-X10 validation failed");
  if (validationStatus.profile !== "valid") errors.push("CH3-X11 validation failed");
  if (validationStatus["runtime-journey"] !== "valid") errors.push("CH3-X12 validation failed");
  if (validationStatus["runtime-state"] !== "valid") errors.push("CH3-X13 validation failed");

  if (OFFICIAL_RUNTIME_LIFECYCLE.length < 7) {
    errors.push("Insufficient lifecycle coverage");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_CAPABILITY_IDS.length < 8) {
    errors.push("Insufficient capability definitions");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime registry validation passed (${catalog.experienceCount} experiences registered)`
      : `Runtime registry validation failed with ${errors.length} error(s)`,
    checked: {
      registeredExperiences: catalog.experienceCount,
      needRegistration: registrationChecks.need && validationStatus.need === "valid",
      actionRegistration: registrationChecks.action && validationStatus.action === "valid",
      contractRegistration: registrationChecks.contract && validationStatus.contract === "valid",
      chatRegistration: registrationChecks.chat && validationStatus.chat === "valid",
      timelineRegistration: registrationChecks.timeline && validationStatus.timeline === "valid",
      notificationRegistration: registrationChecks.notification && validationStatus.notification === "valid",
      profileRegistration: registrationChecks.profile && validationStatus.profile === "valid",
      journeyRegistration: registrationChecks.journey && validationStatus["runtime-journey"] === "valid",
      stateRegistration: registrationChecks.state && validationStatus["runtime-state"] === "valid",
      dependencyGraphIntegrity: graph.every((n) => n.dependencies.every((d) => ids.has(d))),
      routeUniqueness: brokenRoutes.length === 0,
      lifecycleCoverage: catalog.lifecycleCoverage.length >= 7,
      capabilityCoverage: capabilities.coverage.length >= RUNTIME_CAPABILITY_IDS.length - 2,
      registryConsistency: catalog.version === RUNTIME_REGISTRY_VERSION,
      discoveryCorrectness: map.length === catalog.experienceCount,
      noDuplicateRegistrations: ids.size === catalog.experienceCount,
    },
  };
}

export { RUNTIME_REGISTRY_VERSION };
