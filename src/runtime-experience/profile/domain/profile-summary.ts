import type { ProfileSections } from "./profile-sections.js";

export interface ProfileStatistics {
  actionsCompleted: number;
  contractsSigned: number;
  responseRate: number;
  averageRating: number;
}

export interface ProfileSummary {
  id: string;
  displayName: string;
  avatar: string;
  liveFrame: "bronze" | "silver" | "gold" | "platinum";
  verification: {
    status: "verified" | "pending" | "unverified";
    badges: string[];
  };
  professionalScore: number;
  trustScore: number;
  completionScore: number;
  badges: string[];
  statistics: ProfileStatistics;
  recommendations: string[];
  confidence: number;
  recentActivity: Array<{ id: string; label: string; timestamp: string }>;
  sections: ProfileSections;
}

export function buildDefaultProfileSummary(userId: string): ProfileSummary {
  const suffix = userId.slice(-6);
  return {
    id: userId,
    displayName: "Licensed Professional",
    avatar: `avatar-${suffix}`,
    liveFrame: "gold",
    verification: {
      status: "verified",
      badges: ["Licensed", "Background Checked", "Insured"],
    },
    professionalScore: 92,
    trustScore: 88,
    completionScore: 85,
    badges: ["Top Performer", "Fast Responder", "Quality Pro"],
    statistics: {
      actionsCompleted: 47,
      contractsSigned: 42,
      responseRate: 0.94,
      averageRating: 4.8,
    },
    recommendations: ["Complete next Live Frame milestone", "Review recent achievements"],
    confidence: 0.91,
    recentActivity: [
      { id: "act-1", label: "Panel Upgrade completed", timestamp: "2026-06-20T14:00:00.000Z" },
      { id: "act-2", label: "Contract confirmed", timestamp: "2026-06-20T11:00:00.000Z" },
      { id: "act-3", label: "New match received", timestamp: "2026-06-20T09:15:00.000Z" },
    ],
    sections: {
      identity: {
        profileInformation: "Licensed electrical professional serving Riyadh region.",
        verificationStatus: "verified",
        licenses: ["Saudi Electrical License #EL-2024-8842"],
        certifications: ["Safety Certification 2025", "Panel Installation Specialist"],
        professionalBadges: ["Licensed", "Background Checked", "Insured"],
        memberSince: "2024-03-15T00:00:00.000Z",
      },
      liveFrame: {
        currentFrame: "gold",
        frameScore: 847,
        reputation: 4.8,
        ranking: "Top 12% in region",
        explanation: "Live Frame reflects professional performance, reliability, and customer satisfaction.",
        nextLevelProgress: 68,
      },
      achievements: {
        unlocked: [
          { id: "ach-1", title: "First Action", description: "Completed first action", unlocked: true, unlockedAt: "2024-04-01T00:00:00.000Z" },
          { id: "ach-2", title: "50 Actions", description: "Completed 50 actions", unlocked: false },
        ],
        recent: [
          { id: "ach-3", title: "Quality Pro", description: "Maintained 4.5+ rating for 30 days", unlocked: true, unlockedAt: "2026-06-15T00:00:00.000Z" },
        ],
        milestoneProgress: 72,
        recommended: [
          { id: "ach-4", title: "Gold Frame", description: "Reach Gold Live Frame tier", unlocked: false },
        ],
      },
      analytics: {
        activitySummary: "47 actions completed in the last 12 months",
        completionRate: 0.96,
        responseRate: 0.94,
        contractSummary: "42 contracts signed, 98% confirmation rate",
        timelineSummary: "Active across full AN ACT lifecycle",
        chartPlaceholders: ["Activity Chart", "Completion Chart", "Response Chart"],
      },
      history: {
        recentActions: [
          { id: `action-${suffix}`, title: "Panel Upgrade", status: "active" },
          { id: `action-prev-${suffix}`, title: "Outlet Repair", status: "completed" },
        ],
        completedActions: [
          { id: `action-done-${suffix}`, title: "Wiring Inspection", completedAt: "2026-06-18T16:00:00.000Z" },
        ],
        archivedActions: [
          { id: `action-arch-${suffix}`, title: "Initial Consultation", archivedAt: "2026-05-01T10:00:00.000Z" },
        ],
        timelineShortcuts: [
          { label: "View Timeline", route: "/timeline/home" },
          { label: "View Notifications", route: "/notification/home" },
        ],
      },
      settings: {
        appearance: true,
        notifications: true,
        privacy: true,
        accessibility: true,
        language: "en",
      },
    },
  };
}
