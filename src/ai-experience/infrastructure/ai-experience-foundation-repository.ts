import type { AuthContext } from "../../shared/auth/index.js";
import type { ActionIntelligenceFinalClosureService } from "../../action-intelligence-final-closure/application/action-intelligence-final-closure-service.js";
import type { ActionIntelligenceFinalClosureQuery } from "../../action-intelligence-final-closure/application/action-intelligence-final-closure-service.js";
import { createActionIntelligenceFinalClosureService } from "../../action-intelligence-final-closure/application/action-intelligence-final-closure-service.js";
import type { ActionIntelligenceFinalClosureOutput } from "../../action-intelligence-final-closure/domain/action-intelligence-final-closure-context.js";
import type { AiExperienceFoundationContext } from "../domain/ai-experience-foundation-context.js";

export interface UpstreamAiExperienceInputs {
  closure: ActionIntelligenceFinalClosureOutput;
}

export class AiExperienceFoundationRepository {
  private readonly actionIntelligenceFinalClosure: ActionIntelligenceFinalClosureService;

  constructor(deps?: { actionIntelligenceFinalClosure?: ActionIntelligenceFinalClosureService }) {
    this.actionIntelligenceFinalClosure =
      deps?.actionIntelligenceFinalClosure ?? createActionIntelligenceFinalClosureService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: AiExperienceFoundationContext,
    query: ActionIntelligenceFinalClosureQuery
  ): UpstreamAiExperienceInputs {
    const closure = this.actionIntelligenceFinalClosure.buildOutputForValidation(
      authContext,
      query
    );
    return { closure };
  }
}

export function createAiExperienceFoundationRepository(
  deps?: ConstructorParameters<typeof AiExperienceFoundationRepository>[0]
): AiExperienceFoundationRepository {
  return new AiExperienceFoundationRepository(deps);
}
