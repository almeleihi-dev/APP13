import type { RegisteredExperienceId, RegisteredRuntimeExperience } from "../../runtime-registry/domain/runtime-experience.js";
import type { CoordinatorDelegationTarget } from "../domain/runtime-coordinator.js";
import type { RuntimeRegistryService } from "../../runtime-registry/application/runtime-registry-service.js";
import type { AuthContext } from "../../../shared/auth/index.js";

export interface ResolvedExperience {
  id: RegisteredExperienceId | CoordinatorDelegationTarget;
  name: string;
  primaryRoute: string;
  mode: string;
  available: boolean;
}

export class ExperienceResolver {
  resolveByRoute(
    authContext: AuthContext,
    registry: RuntimeRegistryService,
    route: string
  ): ResolvedExperience | undefined {
    const catalog = registry.getCatalog(authContext);
    for (const exp of catalog.experiences) {
      if (exp.primaryRoute === route || exp.supportedRoutes.includes(route)) {
        return this.toResolved(exp);
      }
    }
    if (route.startsWith("/runtime-journey")) {
      return { id: "runtime-journey", name: "Runtime Journey", primaryRoute: "/runtime/launch", mode: "Orchestration", available: true };
    }
    if (route.startsWith("/runtime-state")) {
      return { id: "runtime-state", name: "Runtime State", primaryRoute: "/runtime-state", mode: "State", available: true };
    }
    if (route.startsWith("/runtime-registry")) {
      return { id: "runtime-registry", name: "Runtime Registry", primaryRoute: "/runtime-registry", mode: "Discovery", available: true };
    }
    return undefined;
  }

  resolveActiveFromState(stateView: {
    current_step_id?: string;
    active_experience?: string;
    current_route?: string;
  }): CoordinatorDelegationTarget {
    const experience = stateView.active_experience ?? stateView.current_step_id;
    if (experience === "journey") return "runtime-journey";
    if (experience === "need") return "need";
    if (experience === "action") return "action";
    if (experience === "contract") return "contract";
    if (experience === "chat") return "chat";
    if (experience === "timeline") return "timeline";
    if (experience === "notification") return "notification";
    if (experience === "profile") return "profile";
    return "runtime-state";
  }

  private toResolved(exp: RegisteredRuntimeExperience): ResolvedExperience {
    return {
      id: exp.id,
      name: exp.name,
      primaryRoute: exp.primaryRoute,
      mode: exp.mode,
      available: exp.available,
    };
  }
}

export function createExperienceResolver(): ExperienceResolver {
  return new ExperienceResolver();
}
