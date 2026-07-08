import type { ConnectionStatus, PartnerCategory } from "./partner-schema.js";
import type { LivingPartnerEcosystemContext } from "./partner-context.js";
import {
  hashPartnerSeed,
  resolveEligibilityScore,
  resolvePrimaryIndustry,
  resolvePrimarySkill,
} from "./partner-context.js";

export interface PartnerEngineSnapshot {
  readinessScore?: number;
  todaysBestAction?: { title: string; description: string };
  nextBestPartner?: { title: string; description: string };
  growthPath?: string[];
  expertRecommendations?: string[];
  challenges?: string[];
}

export interface PartnerRecommendation {
  partnerId: string;
  name: string;
  category: PartnerCategory | string;
  summary: string;
  trustScore: number;
  recommendationOnly: true;
  explainable: true;
}

export interface ConnectedPartner {
  partnerId: string;
  name: string;
  category: string;
  status: ConnectionStatus;
  connectedAt: string;
  expiresAt?: string;
}

export interface PermissionHistoryEntry {
  partnerId: string;
  action: string;
  recordedAt: string;
  userInitiated: true;
}

export interface PartnerSectionBase {
  sectionId: string;
  title: string;
  headline: string;
  description: string;
  explainable: true;
}

export interface TodaysBestPartnerSection extends PartnerSectionBase {
  sectionId: "todays_best_partner";
  partner: PartnerRecommendation;
  why: string;
  professionalBenefit: string;
  expectedOutcome: string;
}

export interface TrainingPartnersSection extends PartnerSectionBase {
  sectionId: "training_partners";
  partners: PartnerRecommendation[];
}

export interface GovernmentPartnersSection extends PartnerSectionBase {
  sectionId: "government_partners";
  partners: Array<PartnerRecommendation & { eligibility: string; programType: string }>;
}

export interface FinancialPartnersSection extends PartnerSectionBase {
  sectionId: "financial_partners";
  partners: Array<PartnerRecommendation & { partnerType: string }>;
}

export interface InsurancePartnersSection extends PartnerSectionBase {
  sectionId: "insurance_partners";
  partners: Array<PartnerRecommendation & { coverageType: string }>;
}

export interface CertificationPartnersSection extends PartnerSectionBase {
  sectionId: "certification_partners";
  partners: Array<PartnerRecommendation & { accreditation: string }>;
}

export interface EmploymentPartnersSection extends PartnerSectionBase {
  sectionId: "employment_partners";
  partners: Array<PartnerRecommendation & { opportunityType: string }>;
}

export interface ProfessionalAssociationsSection extends PartnerSectionBase {
  sectionId: "professional_associations";
  associations: Array<PartnerRecommendation & { field: string }>;
}

export interface TechnologyPartnersSection extends PartnerSectionBase {
  sectionId: "technology_partners";
  partners: Array<PartnerRecommendation & { benefitType: string }>;
}

export interface PartnerBenefitsSection extends PartnerSectionBase {
  sectionId: "partner_benefits";
  benefits: Array<{ benefitId: string; title: string; partner: string; summary: string; exclusive: boolean }>;
}

export interface EligibilityAnalysisSection extends PartnerSectionBase {
  sectionId: "eligibility_analysis";
  eligibilityScore: number;
  missingRequirements: string[];
  recommendedImprovements: string[];
  estimatedApprovalChance: number;
  explanations: string[];
}

export interface ConnectedPartnersSection extends PartnerSectionBase {
  sectionId: "connected_partners";
  approved: ConnectedPartner[];
  pending: ConnectedPartner[];
  expired: ConnectedPartner[];
  permissionHistory: PermissionHistoryEntry[];
}

export interface NextRecommendedPartnerSection extends PartnerSectionBase {
  sectionId: "next_recommended_partner";
  partner: PartnerRecommendation;
  why: string;
  expectedBenefit: string;
  estimatedEffortMinutes: number;
}

export type LivingPartnerEcosystemSection =
  | TodaysBestPartnerSection
  | TrainingPartnersSection
  | GovernmentPartnersSection
  | FinancialPartnersSection
  | InsurancePartnersSection
  | CertificationPartnersSection
  | EmploymentPartnersSection
  | ProfessionalAssociationsSection
  | TechnologyPartnersSection
  | PartnerBenefitsSection
  | EligibilityAnalysisSection
  | ConnectedPartnersSection
  | NextRecommendedPartnerSection;

function buildPartner(
  partnerId: string,
  name: string,
  category: PartnerCategory | string,
  summary: string,
  trustScore: number
): PartnerRecommendation {
  return {
    partnerId,
    name,
    category,
    summary,
    trustScore,
    recommendationOnly: true,
    explainable: true,
  };
}

export function buildTodaysBestPartnerSection(
  context: LivingPartnerEcosystemContext,
  engines: PartnerEngineSnapshot
): TodaysBestPartnerSection {
  const hash = hashPartnerSeed(context.dayKey, context.userId);
  const skill = resolvePrimarySkill(context);
  const name = engines.todaysBestAction?.title ?? `Regional ${skill} training partner`;
  const why =
    engines.todaysBestAction?.description ??
    `Best partner match for your journey stage and ${context.geographic.preferredWorkRegion} availability today.`;

  return {
    sectionId: "todays_best_partner",
    title: "Today's Best Partner",
    headline: name,
    description: "Exactly one highest-impact partner recommendation for today.",
    partner: buildPartner(
      `partner://best/${context.dayKey}`,
      name,
      "training",
      why,
      92 + (hash % 8)
    ),
    why,
    professionalBenefit: `Accelerates your ${skill} growth with trusted regional support.`,
    expectedOutcome: "Qualifies you for the next professional milestone with explainable partner guidance.",
    explainable: true,
  };
}

export function buildTrainingPartnersSection(context: LivingPartnerEcosystemContext): TrainingPartnersSection {
  const skill = resolvePrimarySkill(context);
  const hash = hashPartnerSeed(context.dayKey, context.userId);

  return {
    sectionId: "training_partners",
    title: "Training Partners",
    headline: "Recommended training centers and academies",
    description: "Universities, institutes, online providers, and professional academies.",
    partners: [
      buildPartner(
        `partner://train/1/${context.dayKey}`,
        `${context.geographic.city} Professional Academy`,
        "training",
        `Hands-on ${skill} training aligned with regional demand.`,
        88 - (hash % 5)
      ),
      buildPartner(
        `partner://train/2/${context.dayKey}`,
        "Regional Skills Institute",
        "training",
        "Sponsored professional development programs.",
        84 - (hash % 4)
      ),
      buildPartner(
        `partner://train/3/${context.dayKey}`,
        "Online Professional Learning Hub",
        "training",
        `Flexible ${skill} certification pathways.`,
        80 - (hash % 3)
      ),
    ],
    explainable: true,
  };
}

export function buildGovernmentPartnersSection(context: LivingPartnerEcosystemContext): GovernmentPartnersSection {
  const programs = context.geographic.governmentPrograms;
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "government_partners",
    title: "Government Partners",
    headline: `Public support in ${context.geographic.country}`,
    description: "Employment, development, entrepreneurship, and regional initiatives.",
    partners: [
      {
        ...buildPartner(
          `partner://gov/1/${context.dayKey}`,
          (programs[0] ?? "workforce_development_grant").replace(/_/g, " "),
          "government",
          `Government-backed ${skill} development in ${context.geographic.city}.`,
          90
        ),
        eligibility: `Verified professionals in ${context.geographic.country} with active identity.`,
        programType: "professional_development",
      },
      {
        ...buildPartner(
          `partner://gov/2/${context.dayKey}`,
          "Regional employment support agency",
          "government",
          "Public employment and entrepreneurship programs.",
          85
        ),
        eligibility: `Residents of ${context.geographic.preferredWorkRegion}.`,
        programType: "employment",
      },
      {
        ...buildPartner(
          `partner://gov/3/${context.dayKey}`,
          "Entrepreneurship initiative",
          "government",
          "Support for independent professionals and small businesses.",
          82
        ),
        eligibility: "Active APP13 passport with verified credentials.",
        programType: "entrepreneurship",
      },
    ],
    explainable: true,
  };
}

export function buildFinancialPartnersSection(context: LivingPartnerEcosystemContext): FinancialPartnersSection {
  return {
    sectionId: "financial_partners",
    title: "Financial Partners",
    headline: "Trusted financial support recommendations",
    description: "Recommendation only — partners execute, APP13 connects.",
    partners: [
      {
        ...buildPartner(
          `partner://fin/1/${context.dayKey}`,
          "Regional microfinance partner",
          "financial",
          `Business funding for professionals in ${context.geographic.city}.`,
          86
        ),
        partnerType: "microfinance",
      },
      {
        ...buildPartner(
          `partner://fin/2/${context.dayKey}`,
          "Professional growth loan partner",
          "financial",
          "Equipment and certification financing.",
          83
        ),
        partnerType: "professional_loan",
      },
      {
        ...buildPartner(
          `partner://fin/3/${context.dayKey}`,
          "Retirement saving partner",
          "financial",
          "Long-term financial planning for professionals.",
          80
        ),
        partnerType: "retirement_saving",
      },
    ],
    explainable: true,
  };
}

export function buildInsurancePartnersSection(context: LivingPartnerEcosystemContext): InsurancePartnersSection {
  const industry = resolvePrimaryIndustry(context);

  return {
    sectionId: "insurance_partners",
    title: "Insurance Partners",
    headline: "Professional protection recommendations",
    description: "Recommendation only — never sold inside APP13.",
    partners: [
      {
        ...buildPartner(
          `partner://ins/1/${context.dayKey}`,
          "Professional liability partner",
          "insurance",
          `Coverage for ${industry} professionals.`,
          87
        ),
        coverageType: "professional_liability",
      },
      {
        ...buildPartner(
          `partner://ins/2/${context.dayKey}`,
          "Medical insurance partner",
          "insurance",
          "Health coverage for working professionals.",
          84
        ),
        coverageType: "medical",
      },
      {
        ...buildPartner(
          `partner://ins/3/${context.dayKey}`,
          "Project insurance partner",
          "insurance",
          "Project and income protection coverage.",
          81
        ),
        coverageType: "project_income",
      },
    ],
    explainable: true,
  };
}

export function buildCertificationPartnersSection(context: LivingPartnerEcosystemContext): CertificationPartnersSection {
  const cert = context.onboarding.professionalBackground?.certificates[0]?.replace(/_/g, " ") ?? resolvePrimarySkill(context);

  return {
    sectionId: "certification_partners",
    title: "Certification Partners",
    headline: "Licensing and accreditation bodies",
    description: "Professional licensing, certification, and standards organizations.",
    partners: [
      {
        ...buildPartner(
          `partner://cert/1/${context.dayKey}`,
          `${cert} certification body`,
          "certification",
          "Official certification and licensing pathway.",
          91
        ),
        accreditation: "national_standards",
      },
      {
        ...buildPartner(
          `partner://cert/2/${context.dayKey}`,
          "Regional accreditation organization",
          "certification",
          `Standards compliance for ${context.geographic.country} professionals.`,
          86
        ),
        accreditation: "regional_standards",
      },
    ],
    explainable: true,
  };
}

export function buildEmploymentPartnersSection(context: LivingPartnerEcosystemContext): EmploymentPartnersSection {
  const industry = resolvePrimaryIndustry(context);
  const hash = hashPartnerSeed(context.dayKey, context.userId);

  return {
    sectionId: "employment_partners",
    title: "Employment Partners",
    headline: "Career and project connections",
    description: "Companies, recruiters, contracts, and long-term careers.",
    partners: [
      {
        ...buildPartner(
          `partner://emp/1/${context.dayKey}`,
          `${industry} regional employer network`,
          "employment",
          `Long-term career opportunities in ${context.geographic.city}.`,
          85 + (hash % 5)
        ),
        opportunityType: "long_term_career",
      },
      {
        ...buildPartner(
          `partner://emp/2/${context.dayKey}`,
          "Professional recruiter partner",
          "employment",
          "Matched placements based on your passport and journey.",
          82
        ),
        opportunityType: "recruiter",
      },
      {
        ...buildPartner(
          `partner://emp/3/${context.dayKey}`,
          "Contract project partner",
          "employment",
          "Temporary and contract professional engagements.",
          79
        ),
        opportunityType: "contract",
      },
    ],
    explainable: true,
  };
}

export function buildProfessionalAssociationsSection(
  context: LivingPartnerEcosystemContext
): ProfessionalAssociationsSection {
  const industry = resolvePrimaryIndustry(context);
  const fieldMap: Record<string, string> = {
    construction: "engineering",
    medical: "medical",
    legal: "legal",
  };
  const field = fieldMap[industry.split(" ")[0] ?? ""] ?? "technical";

  return {
    sectionId: "professional_associations",
    title: "Professional Associations",
    headline: "Industry associations and trade organizations",
    description: "Connect with peers in your professional field.",
    associations: [
      {
        ...buildPartner(
          `partner://assoc/1/${context.dayKey}`,
          `${industry} professional association`,
          "association",
          `Member benefits and networking in ${context.geographic.city}.`,
          88
        ),
        field,
      },
      {
        ...buildPartner(
          `partner://assoc/2/${context.dayKey}`,
          "Regional trade organization",
          "association",
          "Trade standards, advocacy, and professional community.",
          84
        ),
        field: "trade",
      },
    ],
    explainable: true,
  };
}

export function buildTechnologyPartnersSection(context: LivingPartnerEcosystemContext): TechnologyPartnersSection {
  return {
    sectionId: "technology_partners",
    title: "Technology Partners",
    headline: "Tools and resources for professionals",
    description: "Software discounts, cloud services, and equipment programs.",
    partners: [
      {
        ...buildPartner(
          `partner://tech/1/${context.dayKey}`,
          "Professional tools discount partner",
          "technology",
          "Discounted professional software and tools.",
          86
        ),
        benefitType: "software_discount",
      },
      {
        ...buildPartner(
          `partner://tech/2/${context.dayKey}`,
          "Cloud services partner",
          "technology",
          "Cloud infrastructure for professional workflows.",
          83
        ),
        benefitType: "cloud_services",
      },
      {
        ...buildPartner(
          `partner://tech/3/${context.dayKey}`,
          "Equipment program partner",
          "technology",
          "Professional equipment leasing and purchase programs.",
          80
        ),
        benefitType: "equipment",
      },
    ],
    explainable: true,
  };
}

export function buildPartnerBenefitsSection(context: LivingPartnerEcosystemContext): PartnerBenefitsSection {
  const skill = resolvePrimarySkill(context);

  return {
    sectionId: "partner_benefits",
    title: "Partner Benefits",
    headline: "Exclusive benefits from trusted partners",
    description: "Discounts, sponsored learning, funding, and priority services.",
    benefits: [
      {
        benefitId: `benefit://1/${context.dayKey}`,
        title: "Sponsored learning credit",
        partner: "Regional training partner",
        summary: `Free introductory ${skill} workshop.`,
        exclusive: true,
      },
      {
        benefitId: `benefit://2/${context.dayKey}`,
        title: "Professional tools discount",
        partner: "Technology partner",
        summary: "20% discount on professional software.",
        exclusive: false,
      },
      {
        benefitId: `benefit://3/${context.dayKey}`,
        title: "Priority certification review",
        partner: "Certification partner",
        summary: "Expedited certification pathway for qualified professionals.",
        exclusive: true,
      },
      {
        benefitId: `benefit://4/${context.dayKey}`,
        title: "Government program access",
        partner: context.geographic.governmentPrograms[0]?.replace(/_/g, " ") ?? "Government partner",
        summary: "Eligible for regional workforce development support.",
        exclusive: false,
      },
    ],
    explainable: true,
  };
}

export function buildEligibilityAnalysisSection(
  context: LivingPartnerEcosystemContext,
  engines: PartnerEngineSnapshot
): EligibilityAnalysisSection {
  const score = resolveEligibilityScore(context, engines.readinessScore);
  const missing: string[] = [];
  const iron = context.onboarding.ironVerification;

  if (!iron?.identityConfirmed) missing.push("Complete identity verification");
  if (!iron?.governmentVerificationStatus || iron.governmentVerificationStatus === "not_started") {
    missing.push("Government verification for full program eligibility");
  }
  if ((context.onboarding.professionalBackground?.licenses.length ?? 0) === 0) {
    missing.push(`Professional license for ${context.geographic.country}`);
  }
  if (engines.challenges?.length) {
    missing.push(...engines.challenges.slice(0, 2));
  }

  const improvements = [
    "Complete recommended next professional step",
    `Explore ${context.geographic.governmentPrograms[0]?.replace(/_/g, " ") ?? "regional workforce programs"}`,
    engines.growthPath?.[0] ?? "Strengthen verified credentials on your passport",
  ];

  return {
    sectionId: "eligibility_analysis",
    title: "Eligibility Analysis",
    headline: `Eligibility score: ${score}%`,
    description: "Explainable analysis for partner program qualification.",
    eligibilityScore: score,
    missingRequirements: missing.length > 0 ? missing : ["No critical requirements missing"],
    recommendedImprovements: improvements,
    estimatedApprovalChance: Math.min(95, score + 5),
    explanations: [
      `Score based on passport, verification, and ${context.geographic.preferredWorkRegion} partner requirements.`,
      "APP13 never prioritizes partners by payment — user benefit comes first.",
      missing.length === 0
        ? "You meet core eligibility for most recommended partners."
        : `Address ${missing.length} item(s) to improve partner approval chances.`,
    ],
    explainable: true,
  };
}

export function buildConnectedPartnersSection(
  approved: ConnectedPartner[],
  pending: ConnectedPartner[],
  expired: ConnectedPartner[],
  permissionHistory: PermissionHistoryEntry[]
): ConnectedPartnersSection {
  return {
    sectionId: "connected_partners",
    title: "Connected Partners",
    headline:
      approved.length + pending.length > 0
        ? `${approved.length} approved, ${pending.length} pending`
        : "No partner connections yet",
    description: "Current, pending, and expired partner connections with permission history.",
    approved,
    pending,
    expired,
    permissionHistory,
    explainable: true,
  };
}

export function buildNextRecommendedPartnerSection(
  context: LivingPartnerEcosystemContext,
  engines: PartnerEngineSnapshot
): NextRecommendedPartnerSection {
  const hash = hashPartnerSeed(context.dayKey, context.userId);
  const name = engines.nextBestPartner?.title ?? `Certification partner for ${resolvePrimarySkill(context)}`;
  const why =
    engines.nextBestPartner?.description ??
    `Highest professional impact partner for your next milestone in ${context.geographic.preferredWorkRegion}.`;

  return {
    sectionId: "next_recommended_partner",
    title: "Next Recommended Partner",
    headline: name,
    description: "Exactly one partner with highest professional impact.",
    partner: buildPartner(
      `partner://next/${context.dayKey}`,
      name,
      "certification",
      why,
      88 + (hash % 10)
    ),
    why,
    expectedBenefit: "Unlocks the next level of professional credibility and partner program access.",
    estimatedEffortMinutes: 45 + (hash % 4) * 15,
    explainable: true,
  };
}

export function buildAllPartnerEcosystemSections(
  context: LivingPartnerEcosystemContext,
  engines: PartnerEngineSnapshot,
  connected: {
    approved: ConnectedPartner[];
    pending: ConnectedPartner[];
    expired: ConnectedPartner[];
    permissionHistory: PermissionHistoryEntry[];
  }
): LivingPartnerEcosystemSection[] {
  return [
    buildTodaysBestPartnerSection(context, engines),
    buildTrainingPartnersSection(context),
    buildGovernmentPartnersSection(context),
    buildFinancialPartnersSection(context),
    buildInsurancePartnersSection(context),
    buildCertificationPartnersSection(context),
    buildEmploymentPartnersSection(context),
    buildProfessionalAssociationsSection(context),
    buildTechnologyPartnersSection(context),
    buildPartnerBenefitsSection(context),
    buildEligibilityAnalysisSection(context, engines),
    buildConnectedPartnersSection(
      connected.approved,
      connected.pending,
      connected.expired,
      connected.permissionHistory
    ),
    buildNextRecommendedPartnerSection(context, engines),
  ];
}

function sectionToView(section: LivingPartnerEcosystemSection): Record<string, unknown> {
  const base = {
    section_id: section.sectionId,
    title: section.title,
    headline: section.headline,
    description: section.description,
    explainable: section.explainable,
  };

  switch (section.sectionId) {
    case "todays_best_partner":
      return {
        ...base,
        partner: section.partner,
        why: section.why,
        professional_benefit: section.professionalBenefit,
        expected_outcome: section.expectedOutcome,
      };
    case "training_partners":
      return { ...base, partners: section.partners };
    case "government_partners":
      return { ...base, partners: section.partners };
    case "financial_partners":
      return { ...base, partners: section.partners };
    case "insurance_partners":
      return { ...base, partners: section.partners };
    case "certification_partners":
      return { ...base, partners: section.partners };
    case "employment_partners":
      return { ...base, partners: section.partners };
    case "professional_associations":
      return { ...base, associations: section.associations };
    case "technology_partners":
      return { ...base, partners: section.partners };
    case "partner_benefits":
      return { ...base, benefits: section.benefits };
    case "eligibility_analysis":
      return {
        ...base,
        eligibility_score: section.eligibilityScore,
        missing_requirements: section.missingRequirements,
        recommended_improvements: section.recommendedImprovements,
        estimated_approval_chance: section.estimatedApprovalChance,
        explanations: section.explanations,
      };
    case "connected_partners":
      return {
        ...base,
        approved: section.approved,
        pending: section.pending,
        expired: section.expired,
        permission_history: section.permissionHistory,
      };
    case "next_recommended_partner":
      return {
        ...base,
        partner: section.partner,
        why: section.why,
        expected_benefit: section.expectedBenefit,
        estimated_effort_minutes: section.estimatedEffortMinutes,
      };
    default:
      return base;
  }
}

export function toPartnerSectionView(section: LivingPartnerEcosystemSection) {
  return sectionToView(section);
}

export function toPartnerSectionsView(sections: LivingPartnerEcosystemSection[]) {
  return sections.map(toPartnerSectionView);
}
