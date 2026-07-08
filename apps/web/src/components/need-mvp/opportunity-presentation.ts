import type { OpportunitySnapshot } from "./types.js";
import { getPublishedAction } from "../../lib/living-platform/professional-action-store.js";

export interface OpportunityStory {
  whoNeedsThis: string;
  whyNow: string;
  expectedOutcome: string;
}

export interface ProviderPassportProfile {
  providerName: string;
  serviceName: string;
  summary: string;
  rating: string;
  certifications: string[];
  liveFrameTier: string;
  photoUrl?: string;
  avatarInitials?: string;
}

export interface OpportunityDetailView extends OpportunitySnapshot {
  description: string;
  passportSummary: string;
  passportProfile: ProviderPassportProfile;
  trustIndicators: string[];
  certifications: string[];
  reviews: Array<{ author: string; rating: number; excerpt: string }>;
  estimatedArrival: string;
  story: OpportunityStory;
  professionalLevel: string;
  responseTime: string;
  experienceYears: number;
}

const DETAIL_COPY: Record<
  string,
  Partial<
    Omit<OpportunityDetailView, keyof OpportunitySnapshot> & {
      experienceYears?: number;
      responseTime?: string;
      professionalLevel?: string;
    }
  >
> = {
  "opp-1": {
    description:
      "Licensed electrician for residential panel upgrades, safety inspections, and code-compliant installations with Live Frame verification.",
    passportSummary: "12 years experience · 248 completed actions · Gold Live Frame tier · Riyadh region",
    trustIndicators: ["Government license verified", "Insurance active", "Live Frame continuous monitoring"],
    certifications: ["Licensed", "Insured", "Live Frame Verified"],
    experienceYears: 12,
    professionalLevel: "Established Professional",
    responseTime: "Under 2 hours",
    story: {
      whoNeedsThis: "Homeowners and property managers needing safe electrical work.",
      whyNow: "Seasonal inspection demand and panel upgrade requests are active in your area.",
      expectedOutcome: "Code-compliant installation with Live Frame documentation and warranty coverage.",
    },
    reviews: [
      { author: "Sarah A.", rating: 5, excerpt: "Professional, on time, and explained every step clearly." },
      { author: "Omar K.", rating: 5, excerpt: "Panel upgrade completed safely with full documentation." },
    ],
  },
  "opp-2": {
    description:
      "Executive business consultant specializing in growth strategy, operational readiness, and contract-backed engagements.",
    passportSummary: "15 years experience · 132 advisory sessions · Platinum Live Frame tier",
    trustIndicators: ["Contract-ready profile", "Executive references verified", "Knowledge Bank contributor"],
    experienceYears: 15,
    professionalLevel: "Elite Operator",
    responseTime: "Same day",
    story: {
      whoNeedsThis: "Founders and operators preparing for growth, funding, or operational scale.",
      whyNow: "Q3 planning cycles drive demand for strategic advisory with verified credentials.",
      expectedOutcome: "Actionable roadmap with contract-backed engagement terms.",
    },
    reviews: [
      { author: "Layla M.", rating: 5, excerpt: "Clear roadmap and actionable recommendations within the first session." },
      { author: "Faisal R.", rating: 4, excerpt: "Strong strategic framing for our expansion plan." },
    ],
  },
  "opp-3": {
    description:
      "Digital marketing specialist for campaign strategy, performance analytics, and brand growth programs.",
    passportSummary: "8 years experience · 96 campaigns delivered · Silver Live Frame tier",
    trustIndicators: ["Portfolio verified", "Client satisfaction 4.6+", "Platform identity linked"],
    experienceYears: 8,
    professionalLevel: "Active Professional",
    responseTime: "Within 4 hours",
    story: {
      whoNeedsThis: "Brands launching campaigns or scaling performance marketing.",
      whyNow: "Campaign season increases demand for verified marketing professionals.",
      expectedOutcome: "Campaign strategy with measurable KPIs and Live Frame–monitored delivery.",
    },
    reviews: [
      { author: "Noura H.", rating: 5, excerpt: "Great communication and measurable campaign results." },
      { author: "Ahmed T.", rating: 4, excerpt: "Solid strategy and quick turnaround on deliverables." },
    ],
  },
  "opp-4": {
    description:
      "HVAC maintenance package including inspection, filter replacement, and seasonal system optimization.",
    passportSummary: "10 years experience · 310 service visits · Gold Live Frame tier",
    trustIndicators: ["Licensed technician", "Same-day availability", "Maintenance warranty included"],
    experienceYears: 10,
    professionalLevel: "Established Professional",
    responseTime: "Same day",
    story: {
      whoNeedsThis: "Residential and commercial clients preparing for seasonal HVAC maintenance.",
      whyNow: "Pre-season tune-ups reduce emergency repair costs and improve efficiency.",
      expectedOutcome: "Full system inspection, optimization, and documented service report.",
    },
    reviews: [
      { author: "Hana S.", rating: 5, excerpt: "Thorough inspection and very transparent pricing." },
      { author: "Khalid B.", rating: 4, excerpt: "Reliable service and friendly team." },
    ],
  },
};

export function parseProviderTitle(title: string): { providerName: string; serviceName: string } {
  const parts = title.split("—").map((part) => part.trim());
  if (parts.length >= 2) {
    return { providerName: parts[0]!, serviceName: parts.slice(1).join(" — ") };
  }
  return { providerName: title, serviceName: "Professional service" };
}

export function snapshotFromRelayBody(body: Record<string, unknown> | undefined): OpportunitySnapshot | null {
  if (!body?.opportunity_id || typeof body.opportunity_id !== "string") {
    return null;
  }
  const snapshot = (body.snapshot as Record<string, unknown> | undefined) ?? body;
  const title = String(snapshot.title ?? "Professional provider");
  const parsed = parseProviderTitle(title);
  const badges = Array.isArray(snapshot.badges)
    ? snapshot.badges.map((badge) => {
        if (typeof badge === "string") {
          return badge;
        }
        if (badge && typeof badge === "object" && "label" in badge) {
          return String((badge as { label?: string }).label ?? "");
        }
        return "";
      }).filter(Boolean)
    : [];

  const liveFrame = snapshot.liveFrame as { tier?: string } | undefined;

  return {
    opportunityId: body.opportunity_id,
    title,
    providerName: String(snapshot.providerName ?? parsed.providerName),
    serviceName: String(snapshot.serviceName ?? parsed.serviceName),
    liveFrameTier: liveFrame?.tier ? String(liveFrame.tier) : undefined,
    rating: typeof snapshot.rating === "number" ? snapshot.rating : undefined,
    distanceKm: typeof snapshot.distanceKm === "number" ? snapshot.distanceKm : undefined,
    availability: snapshot.availability ? String(snapshot.availability) : undefined,
    estimatedMinutes: typeof snapshot.estimatedMinutes === "number" ? snapshot.estimatedMinutes : undefined,
    estimatedCostSar: typeof snapshot.estimatedCostSar === "number" ? snapshot.estimatedCostSar : undefined,
    badges,
  };
}

export function enrichOpportunityDetails(snapshot: OpportunitySnapshot): OpportunityDetailView {
  const published = getPublishedAction(snapshot.opportunityId);
  if (published) {
    const { creator, blueprint } = published;
    const tier = creator.liveFrameTier;
    return {
      ...snapshot,
      providerName: creator.fullName,
      serviceName: blueprint.name.trim(),
      liveFrameTier: tier,
      description: blueprint.purpose.trim(),
      passportSummary: `${creator.professionalTitle} · ${creator.classification} · ${creator.location}`,
      passportProfile: {
        providerName: creator.fullName,
        serviceName: blueprint.name.trim(),
        summary: blueprint.purpose.trim(),
        rating: "New action",
        certifications: creator.certifications,
        liveFrameTier: tier,
        photoUrl: creator.photoUrl,
        avatarInitials: creator.fullName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join(""),
      },
      trustIndicators: [
        ...creator.trustIndicators,
        "Creator passport attached",
        blueprint.evidence.trim() ? "Evidence defined" : "Public beta action",
      ],
      certifications: creator.certifications,
      reviews: [],
      estimatedArrival: blueprint.estimatedDuration.trim() || "Scheduled on request",
      story: {
        whoNeedsThis: blueprint.targetCustomer.trim(),
        whyNow: "Published professional action available in the public beta marketplace.",
        expectedOutcome: blueprint.expectedOutcome.trim(),
      },
      professionalLevel:
        tier === "Platinum" ? "Elite Operator" : tier === "Gold" ? "Established Professional" : "Active Professional",
      responseTime: blueprint.estimatedDuration.trim() || "On request",
      experienceYears: 0,
    };
  }

  const copy = DETAIL_COPY[snapshot.opportunityId] ?? {};
  const minutes = snapshot.estimatedMinutes ?? 90;
  const tier = snapshot.liveFrameTier ?? "Silver";
  const rating = snapshot.rating ?? 4.8;
  const experienceYears = copy.experienceYears ?? 5;
  const professionalLevel = copy.professionalLevel ?? "Active Professional";
  const responseTime = copy.responseTime ?? "Within 24 hours";

  const passportSummary =
    copy.passportSummary ??
    "Professional passport on file · Platform-verified identity · Live Frame tier active";

  const passportProfile: ProviderPassportProfile = {
    providerName: snapshot.providerName,
    serviceName: snapshot.serviceName,
    summary: passportSummary,
    rating: rating.toFixed(1),
    certifications: copy.certifications ?? snapshot.badges ?? ["Platform verified"],
    liveFrameTier: tier,
  };

  const story: OpportunityStory = copy.story ?? {
    whoNeedsThis: "Professionals and customers seeking verified, monitored service delivery.",
    whyNow: "Demand is active in the Action Marketplace public beta catalog.",
    expectedOutcome: "Verified service completion with Live Frame monitoring and trust documentation.",
  };

  return {
    ...snapshot,
    description:
      copy.description ??
      `${snapshot.providerName} offers ${snapshot.serviceName.toLowerCase()} with verified credentials and Live Frame trust monitoring.`,
    passportSummary,
    passportProfile,
    trustIndicators: copy.trustIndicators ?? ["Identity verified", "Live Frame active", "Platform trust score eligible"],
    certifications: copy.certifications ?? snapshot.badges ?? ["Platform verified"],
    reviews: copy.reviews ?? [
      { author: "Verified customer", rating, excerpt: "Reliable professional service through AN ACT." },
    ],
    estimatedArrival: snapshot.availability ?? `Estimated arrival in ${minutes} minutes`,
    story,
    professionalLevel,
    responseTime,
    experienceYears,
  };
}

/** Featured providers for marketplace browse — honest beta catalog samples. */
export interface MarketplaceFeaturedProvider {
  id: string;
  searchKeyword: string;
  providerName: string;
  serviceName: string;
  liveFrameTier: string;
  rating: number;
  responseTime: string;
  experienceYears: number;
  availability: string;
}

export const MARKETPLACE_FEATURED_PROVIDERS: MarketplaceFeaturedProvider[] = [
  {
    id: "opp-1",
    searchKeyword: "electrician",
    providerName: "Ahmed Al-Rashid",
    serviceName: "Licensed Electrician",
    liveFrameTier: "Gold",
    rating: 4.9,
    responseTime: "Under 2 hours",
    experienceYears: 12,
    availability: "Today",
  },
  {
    id: "opp-2",
    searchKeyword: "consultant",
    providerName: "Layla Mansour",
    serviceName: "Executive Consultant",
    liveFrameTier: "Platinum",
    rating: 5.0,
    responseTime: "Same day",
    experienceYears: 15,
    availability: "This week",
  },
  {
    id: "opp-4",
    searchKeyword: "HVAC",
    providerName: "Khalid Hassan",
    serviceName: "HVAC Specialist",
    liveFrameTier: "Gold",
    rating: 4.8,
    responseTime: "Same day",
    experienceYears: 10,
    availability: "Today",
  },
];

export function createTrackingId(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `REQ-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}
