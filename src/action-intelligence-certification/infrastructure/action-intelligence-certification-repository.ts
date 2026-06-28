import type { AuthContext } from "../../shared/auth/index.js";
import type { ExecutiveIntelligenceCenterService } from "../../executive-intelligence-center/application/executive-intelligence-center-service.js";
import type { ExecutiveIntelligenceCenterQuery } from "../../executive-intelligence-center/application/executive-intelligence-center-service.js";
import { createExecutiveIntelligenceCenterService } from "../../executive-intelligence-center/application/executive-intelligence-center-service.js";
import type { ExecutiveIntelligenceCenterOutput } from "../../executive-intelligence-center/domain/executive-intelligence-center-context.js";
import type { ActionIntelligenceCertificationContext } from "../domain/action-intelligence-certification-context.js";

export interface UpstreamCertificationInputs {
  executive: ExecutiveIntelligenceCenterOutput;
}

export class ActionIntelligenceCertificationRepository {
  private readonly executiveIntelligenceCenter: ExecutiveIntelligenceCenterService;

  constructor(deps?: { executiveIntelligenceCenter?: ExecutiveIntelligenceCenterService }) {
    this.executiveIntelligenceCenter =
      deps?.executiveIntelligenceCenter ?? createExecutiveIntelligenceCenterService();
  }

  resolveUpstream(
    authContext: AuthContext,
    _context: ActionIntelligenceCertificationContext,
    query: ExecutiveIntelligenceCenterQuery
  ): UpstreamCertificationInputs {
    const executive = this.executiveIntelligenceCenter.buildOutputForValidation(authContext, query);
    return { executive };
  }
}

export function createActionIntelligenceCertificationRepository(
  deps?: ConstructorParameters<typeof ActionIntelligenceCertificationRepository>[0]
): ActionIntelligenceCertificationRepository {
  return new ActionIntelligenceCertificationRepository(deps);
}
