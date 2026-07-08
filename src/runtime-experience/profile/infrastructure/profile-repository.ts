import type { ProfileSummary } from "../domain/profile-summary.js";
import { buildDefaultProfileSummary } from "../domain/profile-summary.js";

export class ProfileRepository {
  private readonly profiles = new Map<string, ProfileSummary>();

  getProfile(userId: string): ProfileSummary {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, buildDefaultProfileSummary(userId));
    }
    return { ...(this.profiles.get(userId)!) };
  }

  refresh(userId: string, _refreshedAt: string): ProfileSummary {
    return this.getProfile(userId);
  }

  hasProfile(userId: string): boolean {
    return this.profiles.has(userId) || true;
  }
}

export function createProfileRepository(): ProfileRepository {
  return new ProfileRepository();
}

let singleton: ProfileRepository | undefined;

export function profileRepository(): ProfileRepository {
  if (!singleton) singleton = createProfileRepository();
  return singleton;
}
