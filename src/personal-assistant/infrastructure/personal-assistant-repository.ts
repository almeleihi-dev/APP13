import type { AssistantProfile } from "../domain/assistant-profile.js";
import { buildAssistantProfile } from "../domain/assistant-profile.js";
import { buildAssistantContext } from "../domain/assistant-context.js";
import type { AuthContext } from "../../shared/auth/index.js";

export class PersonalAssistantRepository {
  private readonly profiles = new Map<string, AssistantProfile>();
  private refreshCount = 0;

  getProfile(userId: string): AssistantProfile | undefined {
    return this.profiles.get(userId);
  }

  saveProfile(profile: AssistantProfile): void {
    this.profiles.set(profile.userId, profile);
  }

  listProfiles(): AssistantProfile[] {
    return [...this.profiles.values()];
  }

  getProfileCount(): number {
    return this.profiles.size;
  }

  getRefreshCount(): number {
    return this.refreshCount;
  }

  refreshProfile(authContext: AuthContext, generatedAt?: string): AssistantProfile {
    this.refreshCount += 1;
    const context = buildAssistantContext({
      authContext,
      generatedAt: generatedAt ?? new Date().toISOString(),
    });
    const profile = buildAssistantProfile(context);
    this.profiles.set(profile.userId, profile);
    return profile;
  }

  getOrRefreshProfile(authContext: AuthContext): AssistantProfile {
    const existing = this.profiles.get(authContext.userId);
    if (existing) return existing;
    return this.refreshProfile(authContext);
  }
}

export function createPersonalAssistantRepository(): PersonalAssistantRepository {
  return new PersonalAssistantRepository();
}

export const personalAssistantRepository = createPersonalAssistantRepository();
