import { escrowRepository } from "../financial/infrastructure/escrow-repository.js";
import { executionRepository } from "../execution/infrastructure/execution-repository.js";
import { complaintRepository } from "../complaint/infrastructure/complaint-repository.js";
import type { ExperienceDependencies } from "./experience-dependencies.js";
import { DisputeExperienceService } from "./dispute-experience-service.js";
import { EscrowExperienceService } from "./escrow-experience-service.js";
import { EvidenceExperienceService } from "./evidence-experience-service.js";
import { ExecutionExperienceService } from "./execution-experience-service.js";
import { PlatformExperienceService } from "./platform-experience-service.js";
import { TrustExperienceService } from "./trust-experience-service.js";

export interface ExperienceServices {
  escrow: EscrowExperienceService;
  execution: ExecutionExperienceService;
  evidence: EvidenceExperienceService;
  dispute: DisputeExperienceService;
  trust: TrustExperienceService;
  platform: PlatformExperienceService;
}

export function createExperienceServices(
  deps: Omit<ExperienceDependencies, "escrowRepository" | "executionRepository" | "complaintRepository">
): ExperienceServices {
  const fullDeps: ExperienceDependencies = {
    ...deps,
    escrowRepository,
    executionRepository,
    complaintRepository,
  };

  return {
    escrow: new EscrowExperienceService(fullDeps),
    execution: new ExecutionExperienceService(fullDeps),
    evidence: new EvidenceExperienceService(fullDeps),
    dispute: new DisputeExperienceService(fullDeps),
    trust: new TrustExperienceService(fullDeps),
    platform: new PlatformExperienceService(fullDeps),
  };
}

export type { ExperienceDependencies };
