import type { OnboardingResponses } from "../../onboarding/domain/onboarding-context.js";
import { livingOnboardingRepository } from "../../onboarding/infrastructure/living-onboarding-repository.js";
import type { LivingProfessionalIdentityContext } from "../domain/identity-context.js";
import type { LivingProfessionalIdentityExperience } from "../domain/identity-experience.js";
import {
  buildDefaultSharingPermissions,
  type IdentitySharingPermissions,
  updateSharingPermissions,
} from "../domain/identity-sections.js";

export class LivingProfessionalIdentityRepository {
  private readonly experiences = new Map<string, LivingProfessionalIdentityExperience>();
  private readonly sharingPermissions = new Map<string, IdentitySharingPermissions>();
  private refreshCount = 0;

  getOnboardingResponses(userId: string): OnboardingResponses {
    return { ...livingOnboardingRepository().getOrCreate(userId).responses };
  }

  getCachedExperience(userId: string, dayKey: string): LivingProfessionalIdentityExperience | undefined {
    const cached = this.experiences.get(userId);
    if (cached && cached.generatedAt.slice(0, 10) === dayKey) {
      return cached;
    }
    return undefined;
  }

  saveExperience(userId: string, experience: LivingProfessionalIdentityExperience): void {
    this.experiences.set(userId, experience);
  }

  listExperiences(): LivingProfessionalIdentityExperience[] {
    return [...this.experiences.values()];
  }

  getSharingPermissions(context: LivingProfessionalIdentityContext): IdentitySharingPermissions {
    const existing = this.sharingPermissions.get(context.userId);
    if (existing) return existing;

    const permissions = buildDefaultSharingPermissions(context);
    this.sharingPermissions.set(context.userId, permissions);
    return permissions;
  }

  updateSharingPermissions(
    userId: string,
    update: Partial<Omit<IdentitySharingPermissions, "updatedAt">>,
    updatedAt: string
  ): IdentitySharingPermissions {
    const existing = this.sharingPermissions.get(userId);
    if (!existing) {
      throw new Error("Sharing permissions not initialized");
    }
    const updated = updateSharingPermissions(existing, update, updatedAt);
    this.sharingPermissions.set(userId, updated);
    return updated;
  }

  incrementRefreshCount(): void {
    this.refreshCount += 1;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  getSharingProfileCount(): number {
    return this.sharingPermissions.size;
  }
}

let defaultRepository: LivingProfessionalIdentityRepository | undefined;

export function createLivingProfessionalIdentityRepository(): LivingProfessionalIdentityRepository {
  return new LivingProfessionalIdentityRepository();
}

export function livingProfessionalIdentityRepository(): LivingProfessionalIdentityRepository {
  if (!defaultRepository) {
    defaultRepository = createLivingProfessionalIdentityRepository();
  }
  return defaultRepository;
}
