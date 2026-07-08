import type { LearningProfile } from "../domain/learning-profile.js";
import { buildLearningProfile } from "../domain/learning-profile.js";
import { buildLearningContext } from "../domain/learning-context.js";
import type { AuthContext } from "../../shared/auth/index.js";

export class LearnByActionRepository {
  private readonly profiles = new Map<string, LearningProfile>();
  private refreshCount = 0;

  getProfile(userId: string): LearningProfile | undefined {
    return this.profiles.get(userId);
  }

  saveProfile(profile: LearningProfile): void {
    this.profiles.set(profile.userId, profile);
  }

  listProfiles(): LearningProfile[] {
    return [...this.profiles.values()];
  }

  getProfileCount(): number {
    return this.profiles.size;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  refreshProfile(authContext: AuthContext, generatedAt?: string): LearningProfile {
    this.refreshCount += 1;
    const context = buildLearningContext({
      authContext,
      generatedAt: generatedAt ?? new Date().toISOString(),
    });
    const profile = buildLearningProfile(context);
    this.profiles.set(profile.userId, profile);
    return profile;
  }

  getOrRefreshProfile(authContext: AuthContext): LearningProfile {
    const existing = this.profiles.get(authContext.userId);
    if (existing) return existing;
    return this.refreshProfile(authContext);
  }
}

export function createLearnByActionRepository(): LearnByActionRepository {
  return new LearnByActionRepository();
}

export const learnByActionRepository = createLearnByActionRepository();
