import type { DevelopmentProfile } from "../domain/development-profile.js";
import { buildDevelopmentProfile } from "../domain/development-profile.js";
import { buildDevelopmentContext } from "../domain/development-context.js";
import type { AuthContext } from "../../shared/auth/index.js";

export class DevelopMeRepository {
  private readonly profiles = new Map<string, DevelopmentProfile>();
  private refreshCount = 0;

  getProfile(userId: string): DevelopmentProfile | undefined {
    return this.profiles.get(userId);
  }

  saveProfile(profile: DevelopmentProfile): void {
    this.profiles.set(profile.userId, profile);
  }

  listProfiles(): DevelopmentProfile[] {
    return [...this.profiles.values()];
  }

  getProfileCount(): number {
    return this.profiles.size;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  refreshProfile(authContext: AuthContext, generatedAt?: string): DevelopmentProfile {
    this.refreshCount += 1;
    const context = buildDevelopmentContext({
      authContext,
      generatedAt: generatedAt ?? new Date().toISOString(),
    });
    const profile = buildDevelopmentProfile(context);
    this.profiles.set(profile.userId, profile);
    return profile;
  }

  getOrRefreshProfile(authContext: AuthContext): DevelopmentProfile {
    const existing = this.profiles.get(authContext.userId);
    if (existing) return existing;
    return this.refreshProfile(authContext);
  }
}

export function createDevelopMeRepository(): DevelopMeRepository {
  return new DevelopMeRepository();
}

export const developMeRepository = createDevelopMeRepository();
