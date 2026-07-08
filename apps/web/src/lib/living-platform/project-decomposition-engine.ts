import type { ProjectExecutionPath, ProjectPhase } from "./types.js";
import { createLivingId } from "./living-platform-storage.js";
import { normalizeMultilingualInput } from "../../i18n/multilingual-input.js";

export interface ProjectTemplateMicroSpec {
  name: string;
  baseCost: number;
  baseDays: number;
  skill: string;
}

export interface ProjectTemplateSubPhaseSpec {
  name: string;
  microActions: ProjectTemplateMicroSpec[];
}

export interface ProjectTemplatePhaseSpec {
  name: string;
  subPhases: ProjectTemplateSubPhaseSpec[];
}

export interface ProjectTemplateSpec {
  templateId: string;
  label: string;
  keywords: string[];
  summary: string;
  phases: ProjectTemplatePhaseSpec[];
}

const PATH_MULTIPLIERS: Record<
  ProjectExecutionPath,
  { cost: number; days: number }
> = {
  fast: { cost: 1.4, days: 0.65 },
  balanced: { cost: 1.0, days: 1.0 },
  step_by_step: { cost: 0.75, days: 1.35 },
};

export const PROJECT_TEMPLATES: ProjectTemplateSpec[] = [
  {
    templateId: "build-house",
    label: "Build a House",
    keywords: ["house", "build a house", "build home", "construct home", "residential"],
    summary: "Living structure for residential construction from planning through finish.",
    phases: [
      {
        name: "Planning & Permits",
        subPhases: [
          {
            name: "Site & design",
            microActions: [
              { name: "Site assessment", baseCost: 2400, baseDays: 5, skill: "Surveying" },
              { name: "Architectural plans", baseCost: 5200, baseDays: 14, skill: "Architecture" },
            ],
          },
          {
            name: "Approvals",
            microActions: [
              { name: "Permit submission", baseCost: 1800, baseDays: 7, skill: "Permitting" },
              { name: "Regulatory review", baseCost: 1200, baseDays: 10, skill: "Compliance" },
            ],
          },
        ],
      },
      {
        name: "Foundation & Structure",
        subPhases: [
          {
            name: "Foundation",
            microActions: [
              { name: "Excavation & foundation pour", baseCost: 9800, baseDays: 12, skill: "Construction" },
              { name: "Structural inspection", baseCost: 1600, baseDays: 2, skill: "Inspection" },
            ],
          },
          {
            name: "Framing",
            microActions: [
              { name: "Frame erection", baseCost: 12400, baseDays: 18, skill: "Carpentry" },
              { name: "Roof structure", baseCost: 7600, baseDays: 10, skill: "Roofing" },
            ],
          },
        ],
      },
      {
        name: "Systems & Envelope",
        subPhases: [
          {
            name: "Core systems",
            microActions: [
              { name: "Electrical rough-in", baseCost: 6400, baseDays: 8, skill: "Electrical" },
              { name: "Plumbing rough-in", baseCost: 5800, baseDays: 8, skill: "Plumbing" },
            ],
          },
          {
            name: "Envelope",
            microActions: [
              { name: "Exterior weatherproofing", baseCost: 4200, baseDays: 6, skill: "Construction" },
              { name: "HVAC installation", baseCost: 5400, baseDays: 5, skill: "HVAC" },
            ],
          },
        ],
      },
      {
        name: "Interior & Finish",
        subPhases: [
          {
            name: "Interior build-out",
            microActions: [
              { name: "Drywall & paint", baseCost: 4800, baseDays: 10, skill: "Finishing" },
              { name: "Flooring & fixtures", baseCost: 6200, baseDays: 12, skill: "Interior" },
            ],
          },
          {
            name: "Close-out",
            microActions: [
              { name: "Final inspection", baseCost: 1400, baseDays: 2, skill: "Inspection" },
              { name: "Occupancy certification", baseCost: 900, baseDays: 3, skill: "Compliance" },
            ],
          },
        ],
      },
    ],
  },
  {
    templateId: "launch-app",
    label: "Launch an App",
    keywords: ["app", "launch an app", "software", "mobile app", "product launch", "startup app"],
    summary: "Decompose a digital product launch into contracted professional actions.",
    phases: [
      {
        name: "Discovery",
        subPhases: [
          {
            name: "Market validation",
            microActions: [
              { name: "User research sprint", baseCost: 3200, baseDays: 7, skill: "Research" },
              { name: "Competitive analysis", baseCost: 1800, baseDays: 4, skill: "Strategy" },
            ],
          },
          {
            name: "Requirements",
            microActions: [
              { name: "Product requirements doc", baseCost: 2600, baseDays: 6, skill: "Product" },
              { name: "Technical feasibility review", baseCost: 2200, baseDays: 3, skill: "Engineering" },
            ],
          },
        ],
      },
      {
        name: "Design",
        subPhases: [
          {
            name: "Experience design",
            microActions: [
              { name: "UX flows & wireframes", baseCost: 3800, baseDays: 8, skill: "UX Design" },
              { name: "Visual UI system", baseCost: 4200, baseDays: 10, skill: "UI Design" },
            ],
          },
          {
            name: "Architecture",
            microActions: [
              { name: "System architecture", baseCost: 3400, baseDays: 5, skill: "Architecture" },
              { name: "Security review", baseCost: 2400, baseDays: 3, skill: "Security" },
            ],
          },
        ],
      },
      {
        name: "Build",
        subPhases: [
          {
            name: "Development",
            microActions: [
              { name: "Core feature build", baseCost: 9800, baseDays: 21, skill: "Engineering" },
              { name: "API integration", baseCost: 4600, baseDays: 8, skill: "Backend" },
            ],
          },
          {
            name: "Quality",
            microActions: [
              { name: "QA test cycle", baseCost: 2800, baseDays: 6, skill: "QA" },
              { name: "Performance audit", baseCost: 2200, baseDays: 4, skill: "DevOps" },
            ],
          },
        ],
      },
      {
        name: "Launch",
        subPhases: [
          {
            name: "Release",
            microActions: [
              { name: "Production deployment", baseCost: 3200, baseDays: 3, skill: "DevOps" },
              { name: "App store submission", baseCost: 1800, baseDays: 5, skill: "Release" },
            ],
          },
          {
            name: "Growth setup",
            microActions: [
              { name: "Analytics instrumentation", baseCost: 1600, baseDays: 3, skill: "Analytics" },
              { name: "Launch campaign setup", baseCost: 2400, baseDays: 5, skill: "Marketing" },
            ],
          },
        ],
      },
    ],
  },
  {
    templateId: "open-business",
    label: "Open a Business",
    keywords: ["business", "open a business", "startup", "company", "launch business", "store"],
    summary: "Structure a business launch into phased contracted actions.",
    phases: [
      {
        name: "Strategy",
        subPhases: [
          {
            name: "Validation",
            microActions: [
              { name: "Market validation study", baseCost: 2800, baseDays: 7, skill: "Strategy" },
              { name: "Financial model draft", baseCost: 2200, baseDays: 5, skill: "Finance" },
            ],
          },
          {
            name: "Planning",
            microActions: [
              { name: "Business plan authoring", baseCost: 3400, baseDays: 8, skill: "Business" },
              { name: "Risk assessment", baseCost: 1600, baseDays: 3, skill: "Compliance" },
            ],
          },
        ],
      },
      {
        name: "Setup",
        subPhases: [
          {
            name: "Legal & registration",
            microActions: [
              { name: "Entity registration", baseCost: 1800, baseDays: 5, skill: "Legal" },
              { name: "Tax & licensing setup", baseCost: 1400, baseDays: 4, skill: "Accounting" },
            ],
          },
          {
            name: "Brand foundation",
            microActions: [
              { name: "Brand identity design", baseCost: 3200, baseDays: 8, skill: "Branding" },
              { name: "Digital presence setup", baseCost: 2600, baseDays: 6, skill: "Web" },
            ],
          },
        ],
      },
      {
        name: "Launch",
        subPhases: [
          {
            name: "Operations",
            microActions: [
              { name: "Operations playbook", baseCost: 2400, baseDays: 5, skill: "Operations" },
              { name: "Vendor onboarding", baseCost: 1800, baseDays: 4, skill: "Procurement" },
            ],
          },
          {
            name: "Go-to-market",
            microActions: [
              { name: "Launch event coordination", baseCost: 2200, baseDays: 6, skill: "Events" },
              { name: "First customer outreach", baseCost: 1600, baseDays: 5, skill: "Sales" },
            ],
          },
        ],
      },
      {
        name: "Growth",
        subPhases: [
          {
            name: "Optimization",
            microActions: [
              { name: "Performance review", baseCost: 1800, baseDays: 4, skill: "Analytics" },
              { name: "Process improvement sprint", baseCost: 2200, baseDays: 5, skill: "Operations" },
            ],
          },
          {
            name: "Scale",
            microActions: [
              { name: "Team hiring plan", baseCost: 2000, baseDays: 5, skill: "HR" },
              { name: "Growth channel test", baseCost: 2600, baseDays: 7, skill: "Marketing" },
            ],
          },
        ],
      },
    ],
  },
];

export function matchProjectTemplate(goal: string): ProjectTemplateSpec {
  const normalized = goal.trim().toLowerCase();
  const canonical = normalizeMultilingualInput(goal).trim().toLowerCase();
  const search = `${normalized} ${canonical}`;
  for (const template of PROJECT_TEMPLATES) {
    if (template.keywords.some((keyword) => search.includes(keyword))) {
      return template;
    }
  }
  return PROJECT_TEMPLATES[1]!;
}

export function buildProjectPhases(
  template: ProjectTemplateSpec,
  path: ProjectExecutionPath,
): ProjectPhase[] {
  const multipliers = PATH_MULTIPLIERS[path];

  return template.phases.map((phaseSpec, phaseIndex) => {
    const subPhases = phaseSpec.subPhases.map((subSpec) => ({
      subPhaseId: createLivingId("sub"),
      name: subSpec.name,
      microActions: subSpec.microActions.map((micro) => ({
        microActionId: createLivingId("mic"),
        name: micro.name,
        ownerPassportKey: null,
        teamId: null,
        contractScope: "individual" as const,
        estimatedCost: Math.round(micro.baseCost * multipliers.cost),
        estimatedDays: Math.max(1, Math.round(micro.baseDays * multipliers.days)),
        contractId: null,
        evidenceIds: [],
        status: "pending" as const,
      })),
    }));

    const phaseCost = subPhases.reduce(
      (sum, sub) => sum + sub.microActions.reduce((s, m) => s + m.estimatedCost, 0),
      0,
    );
    const phaseDays = subPhases.reduce(
      (sum, sub) => sum + sub.microActions.reduce((s, m) => s + m.estimatedDays, 0),
      0,
    );

    return {
      phaseId: createLivingId("ph"),
      name: phaseSpec.name,
      order: phaseIndex,
      status: phaseIndex === 0 ? "available" : "locked",
      subPhases,
      estimatedCost: phaseCost,
      estimatedDays: phaseDays,
      paidAmount: 0,
      evidence: [],
    };
  });
}

export function deriveProjectName(goal: string, template: ProjectTemplateSpec): string {
  const trimmed = goal.trim();
  if (trimmed.length > 0 && trimmed.length <= 64) return trimmed;
  return template.label;
}
