/** Demo data for guest preview — clearly labeled, not persisted as real trust. */

export const GUEST_DEMO_PASSPORT = {
  fullName: "Alex Morgan",
  professionalTitle: "Structural Engineer",
  liveFrameTier: "Gold" as const,
  trustScore: "92%",
  completedActions: 24,
  certifications: ["PE License", "Live Frame Verified", "Contract-Backed Delivery"],
};

export const GUEST_DEMO_TEAM = {
  name: "BuildCore Team",
  liveFrameTier: "Gold" as const,
  trustScore: 89,
  members: 4,
  completedActions: 18,
};

export const GUEST_DEMO_PROJECT = {
  name: "Launch a Mobile App",
  phases: 4,
  actions: 16,
  progressPercent: 12,
  activePhase: "Discovery",
};

export const GUEST_DEMO_ECONOMY = {
  contractsGenerated: 1284,
  grossContractValue: "$2.4M",
  successRate: "96%",
  trendingCategory: "Software Development +22%",
};

export const GUEST_DEMO_LIVE_FRAME = {
  tier: "Gold" as const,
  health: "healthy" as const,
  monitoredActions: 6,
  lastSignal: "Evidence confirmed · 2h ago",
};
