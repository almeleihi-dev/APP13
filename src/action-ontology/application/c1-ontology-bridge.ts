import type { ScenarioId } from "../../unified-action-intelligence/domain/action-intelligence-schema.js";
import type { ActionFamilyId } from "../domain/action-ontology-schema.js";

export const C1_SCENARIO_TO_CANONICAL_ACTION: Record<ScenarioId, string> = {
  moving_a_room: "act.move.room_contents",
  cleaning_an_apartment: "act.clean.apartment_full",
  delivering_a_document: "act.deliver.document_secure",
  fixing_small_home_issue: "act.maint.fix_minor_issue",
  preparing_professional_service_request: "act.pro.prepare_service_request",
};

export const C1_SCENARIO_TO_FAMILY: Record<ScenarioId, ActionFamilyId> = {
  moving_a_room: "moving",
  cleaning_an_apartment: "cleaning",
  delivering_a_document: "delivery",
  fixing_small_home_issue: "maintenance",
  preparing_professional_service_request: "professional_service_request",
};

export function resolveCanonicalActionIdFromScenario(
  scenarioId: ScenarioId
): string {
  return C1_SCENARIO_TO_CANONICAL_ACTION[scenarioId];
}

export function resolveFamilyFromScenario(scenarioId: ScenarioId): ActionFamilyId {
  return C1_SCENARIO_TO_FAMILY[scenarioId];
}
