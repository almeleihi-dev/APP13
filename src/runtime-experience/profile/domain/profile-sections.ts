export const PROFILE_SECTION_IDS = [
  "identity",
  "live-frame",
  "achievements",
  "analytics",
  "history",
  "settings",
] as const;

export type ProfileSectionId = (typeof PROFILE_SECTION_IDS)[number];

export interface ProfileIdentitySection {
  profileInformation: string;
  verificationStatus: string;
  licenses: string[];
  certifications: string[];
  professionalBadges: string[];
  memberSince: string;
}

export interface ProfileLiveFrameSection {
  currentFrame: "bronze" | "silver" | "gold" | "platinum";
  frameScore: number;
  reputation: number;
  ranking: string;
  explanation: string;
  nextLevelProgress: number;
}

export interface ProfileAchievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ProfileAchievementsSection {
  unlocked: ProfileAchievement[];
  recent: ProfileAchievement[];
  milestoneProgress: number;
  recommended: ProfileAchievement[];
}

export interface ProfileAnalyticsSection {
  activitySummary: string;
  completionRate: number;
  responseRate: number;
  contractSummary: string;
  timelineSummary: string;
  chartPlaceholders: string[];
}

export interface ProfileHistorySection {
  recentActions: Array<{ id: string; title: string; status: string }>;
  completedActions: Array<{ id: string; title: string; completedAt: string }>;
  archivedActions: Array<{ id: string; title: string; archivedAt: string }>;
  timelineShortcuts: Array<{ label: string; route: string }>;
}

export interface ProfileSettingsSection {
  appearance: boolean;
  notifications: boolean;
  privacy: boolean;
  accessibility: boolean;
  language: string;
}

export interface ProfileSections {
  identity: ProfileIdentitySection;
  liveFrame: ProfileLiveFrameSection;
  achievements: ProfileAchievementsSection;
  analytics: ProfileAnalyticsSection;
  history: ProfileHistorySection;
  settings: ProfileSettingsSection;
}

export function isProfileSectionId(value: string): value is ProfileSectionId {
  return PROFILE_SECTION_IDS.includes(value as ProfileSectionId);
}
