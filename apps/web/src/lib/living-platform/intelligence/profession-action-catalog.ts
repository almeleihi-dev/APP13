import type { ActionInventoryBucket, TrustRequirementLevel } from "../types.js";
import { normalizeMultilingualInput } from "../../../i18n/multilingual-input.js";

export interface ProfessionActionSpec {
  title: string;
  description: string;
  bucket: ActionInventoryBucket;
  requiredProof: string;
  baseConfidence: number;
  trustRequirement: TrustRequirementLevel;
  verificationRequired: boolean;
}

export interface ProfessionProfile {
  profileId: string;
  label: string;
  matchKeywords: string[];
  actions: ProfessionActionSpec[];
}

export const PROFESSION_PROFILES: ProfessionProfile[] = [
  {
    profileId: "structural-engineer",
    label: "Structural Engineer",
    matchKeywords: ["structural", "civil", "engineer", "structural engineer", "civil engineer", "bauingenieur", "zivilingenieur", "مهندس", "مهندس إنشاءات"],
    actions: [
      {
        title: "Structural assessment report",
        description: "Evaluate load paths, structural integrity, and remediation recommendations.",
        bucket: "ready_now",
        requiredProof: "Engineering portfolio or prior assessment samples",
        baseConfidence: 86,
        trustRequirement: "elevated",
        verificationRequired: false,
      },
      {
        title: "Foundation load analysis",
        description: "Calculate foundation loads and produce stamped-ready calculation packages.",
        bucket: "ready_now",
        requiredProof: "Structural engineering credentials",
        baseConfidence: 84,
        trustRequirement: "elevated",
        verificationRequired: false,
      },
      {
        title: "Sealed structural drawing review",
        description: "Review and seal structural drawings for permitting submission.",
        bucket: "needs_verification",
        requiredProof: "Professional Engineer (PE) license",
        baseConfidence: 78,
        trustRequirement: "verified",
        verificationRequired: true,
      },
      {
        title: "High-rise structural design",
        description: "Lead structural design for multi-story commercial or residential towers.",
        bucket: "unlockable",
        requiredProof: "Advanced structural project history + PE license",
        baseConfidence: 68,
        trustRequirement: "verified",
        verificationRequired: true,
      },
    ],
  },
  {
    profileId: "certified-accountant",
    label: "Certified Accountant",
    matchKeywords: ["accountant", "accounting", "cpa", "certified accountant", "bookkeeper", "finance", "steuerberater", "buchhalter", "محاسب", "محاسب قانوني"],
    actions: [
      {
        title: "Bookkeeping reconciliation",
        description: "Reconcile accounts, categorize transactions, and produce monthly close packs.",
        bucket: "ready_now",
        requiredProof: "Accounting certification or client references",
        baseConfidence: 88,
        trustRequirement: "standard",
        verificationRequired: false,
      },
      {
        title: "Tax preparation support",
        description: "Prepare individual or small-business tax filings with supporting schedules.",
        bucket: "ready_now",
        requiredProof: "Tax preparer credentials or PTIN",
        baseConfidence: 85,
        trustRequirement: "elevated",
        verificationRequired: false,
      },
      {
        title: "Audited financial statements",
        description: "Deliver reviewed or audited financial statements for compliance and investors.",
        bucket: "needs_verification",
        requiredProof: "CPA license or audit firm affiliation",
        baseConfidence: 76,
        trustRequirement: "verified",
        verificationRequired: true,
      },
      {
        title: "Forensic accounting investigation",
        description: "Investigate financial irregularities with documented findings for legal review.",
        bucket: "unlockable",
        requiredProof: "Forensic accounting certification + case history",
        baseConfidence: 65,
        trustRequirement: "verified",
        verificationRequired: true,
      },
    ],
  },
  {
    profileId: "interior-designer",
    label: "Interior Designer",
    matchKeywords: ["interior", "designer", "interior designer", "interior design", "spatial", "decor"],
    actions: [
      {
        title: "Space planning consultation",
        description: "Optimize floor plans, circulation, and functional zoning for residential or commercial spaces.",
        bucket: "ready_now",
        requiredProof: "Design portfolio or prior client work",
        baseConfidence: 87,
        trustRequirement: "standard",
        verificationRequired: false,
      },
      {
        title: "Material and finish selection board",
        description: "Curate materials, finishes, fixtures, and palettes with procurement-ready specifications.",
        bucket: "ready_now",
        requiredProof: "Sample board or specification sheet",
        baseConfidence: 84,
        trustRequirement: "standard",
        verificationRequired: false,
      },
      {
        title: "Licensed interior design submission",
        description: "Prepare permit-ready interior design packages for regulatory submission.",
        bucket: "needs_verification",
        requiredProof: "Interior design license or NCIDQ certification",
        baseConfidence: 74,
        trustRequirement: "verified",
        verificationRequired: true,
      },
      {
        title: "Commercial fit-out design",
        description: "Lead full commercial interior fit-out from concept through contractor coordination.",
        bucket: "unlockable",
        requiredProof: "Commercial portfolio + licensed supervision",
        baseConfidence: 70,
        trustRequirement: "elevated",
        verificationRequired: true,
      },
    ],
  },
  {
    profileId: "app-developer",
    label: "Software / App Developer",
    matchKeywords: ["developer", "app developer", "software", "software developer", "mobile developer", "engineer", "programmer", "entwickler", "softwareentwickler", "مطور", "مطور تطبيقات"],
    actions: [
      {
        title: "Software feature delivery",
        description: "Build and ship a scoped software feature with tests and deployment evidence.",
        bucket: "ready_now",
        requiredProof: "Repository or delivery evidence",
        baseConfidence: 90,
        trustRequirement: "standard",
        verificationRequired: false,
      },
      {
        title: "API integration",
        description: "Integrate third-party APIs with authentication, error handling, and monitoring.",
        bucket: "ready_now",
        requiredProof: "Integration case study or live endpoint",
        baseConfidence: 86,
        trustRequirement: "standard",
        verificationRequired: false,
      },
      {
        title: "Mobile app store submission",
        description: "Prepare and submit mobile builds to App Store and Google Play with compliance checks.",
        bucket: "needs_verification",
        requiredProof: "Prior successful store release",
        baseConfidence: 78,
        trustRequirement: "elevated",
        verificationRequired: true,
      },
      {
        title: "System architecture design",
        description: "Design scalable system architecture with security and performance review.",
        bucket: "unlockable",
        requiredProof: "Senior engineering experience + architecture samples",
        baseConfidence: 72,
        trustRequirement: "elevated",
        verificationRequired: false,
      },
    ],
  },
  {
    profileId: "legal-translator",
    label: "Legal Translator",
    matchKeywords: ["translator", "legal translator", "interpreter", "translation", "legal translation"],
    actions: [
      {
        title: "Legal document translation",
        description: "Translate contracts, affidavits, and legal correspondence with terminology accuracy.",
        bucket: "ready_now",
        requiredProof: "Translation portfolio or language certification",
        baseConfidence: 88,
        trustRequirement: "elevated",
        verificationRequired: false,
      },
      {
        title: "Certified translation affidavit",
        description: "Deliver certified translations with notarized or sworn translator attestation.",
        bucket: "ready_now",
        requiredProof: "Sworn translator registration",
        baseConfidence: 85,
        trustRequirement: "verified",
        verificationRequired: false,
      },
      {
        title: "Sworn legal translation",
        description: "Produce court-admissible sworn translations for legal proceedings.",
        bucket: "needs_verification",
        requiredProof: "Court-certified translator license",
        baseConfidence: 76,
        trustRequirement: "verified",
        verificationRequired: true,
      },
      {
        title: "Court interpretation session",
        description: "Provide consecutive or simultaneous interpretation in legal hearings.",
        bucket: "unlockable",
        requiredProof: "Court interpreter certification + session history",
        baseConfidence: 68,
        trustRequirement: "verified",
        verificationRequired: true,
      },
    ],
  },
];

export function matchProfessionProfile(text: string): ProfessionProfile | null {
  const canonical = normalizeMultilingualInput(text);
  const normalized = canonical.trim().toLowerCase();
  if (!normalized) return null;

  let best: ProfessionProfile | null = null;
  let bestScore = 0;

  for (const profile of PROFESSION_PROFILES) {
    let score = 0;
    for (const keyword of profile.matchKeywords) {
      if (normalized.includes(keyword)) score += keyword.includes(" ") ? 3 : 1;
    }
    if (normalized.includes(profile.label.toLowerCase())) score += 4;
    if (score > bestScore) {
      bestScore = score;
      best = profile;
    }
  }

  return bestScore > 0 ? best : null;
}
