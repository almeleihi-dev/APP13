import type { AuthContext } from "../../shared/auth/index.js";
import type { ActionIntelligenceCertificationService } from "../../action-intelligence-certification/application/action-intelligence-certification-service.js";
import type { ActionIntelligenceCertificationQuery } from "../../action-intelligence-certification/application/action-intelligence-certification-service.js";
import { createActionIntelligenceCertificationService } from "../../action-intelligence-certification/application/action-intelligence-certification-service.js";
import type { ActionIntelligenceCertificationOutput } from "../../action-intelligence-certification/domain/action-intelligence-certification-context.js";
import type { ActionIntelligenceFinalClosureContext } from "../domain/action-intelligence-final-closure-context.js";

export interface UpstreamClosureInputs {
  certification: ActionIntelligenceCertificationOutput;
}

export class ActionIntelligenceFinalClosureRepository {
  private readonly actionIntelligenceCertification: ActionIntelligenceCertificationService;

  constructor(deps?: { actionIntelligenceCertification?: ActionIntelligenceCertificationService }) {
    this.actionIntelligenceCertification =
      deps?.actionIntelligenceCertification ?? createActionIntelligenceCertificationService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: ActionIntelligenceFinalClosureContext,
    query: ActionIntelligenceCertificationQuery
  ): UpstreamClosureInputs {
    const certification = this.actionIntelligenceCertification.buildOutputForValidation(
      authContext,
      query
    );
    return { certification };
  }
}

export function createActionIntelligenceFinalClosureRepository(
  deps?: ConstructorParameters<typeof ActionIntelligenceFinalClosureRepository>[0]
): ActionIntelligenceFinalClosureRepository {
  return new ActionIntelligenceFinalClosureRepository(deps);
}
