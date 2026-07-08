import {
  createActionOntologyRepository,
  type ActionOntologyRepository,
} from "../../action-ontology/infrastructure/action-ontology-repository.js";
import { getPlanTemplate, listPlanTemplates } from "../domain/plan-templates.js";
import { PLANNING_SCENARIO_TO_CANONICAL } from "../application/c2-planning-bridge.js";
import type { PlanningScenarioId } from "../domain/action-planning-schema.js";
import { collectActionPlanningPaths } from "../domain/action-planning-screens.js";

export class ActionPlanningRepository {
  private readonly ontologyRepository: ActionOntologyRepository;

  constructor(deps?: { ontologyRepository?: ActionOntologyRepository }) {
    this.ontologyRepository =
      deps?.ontologyRepository ?? createActionOntologyRepository();
  }

  getCanonicalAction(canonicalActionId: string) {
    return this.ontologyRepository.getActionById(canonicalActionId);
  }

  getCanonicalActionForScenario(scenarioId: PlanningScenarioId) {
    const canonicalActionId = PLANNING_SCENARIO_TO_CANONICAL[scenarioId];
    return this.ontologyRepository.getActionById(canonicalActionId);
  }

  hasPlanTemplate(canonicalActionId: string): boolean {
    return getPlanTemplate(canonicalActionId) !== undefined;
  }

  listPlanningScenarios(): Array<{
    scenarioId: PlanningScenarioId;
    canonicalActionId: string;
    goal: string;
  }> {
    return (Object.entries(PLANNING_SCENARIO_TO_CANONICAL) as Array<
      [PlanningScenarioId, string]
    >).map(([scenarioId, canonicalActionId]) => ({
      scenarioId,
      canonicalActionId,
      goal: getPlanTemplate(canonicalActionId)?.goal ?? "",
    }));
  }

  getPlanTemplateCount(): number {
    return listPlanTemplates().length;
  }

  getArtifactPaths(rootDir: string): string[] {
    return collectActionPlanningPaths().map((relativePath) =>
      relativePath.startsWith("/") ? relativePath : `${rootDir}/${relativePath}`
    );
  }
}

export function createActionPlanningRepository(
  deps?: ConstructorParameters<typeof ActionPlanningRepository>[0]
): ActionPlanningRepository {
  return new ActionPlanningRepository(deps);
}
