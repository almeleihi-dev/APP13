import { buildBlueprintId } from "../../action-blueprint/domain/taxonomy-bridge.js";
import { getTemplateByActionCode } from "../../contract/templates/registry.js";
import { PROFESSION_ONTOLOGY_SCHEMA_VERSION } from "./profession-schema.js";
import type {
  ActionDecompositionClass,
  ActionFamilyDefinition,
  CapabilityDefinition,
  ProfessionCategory,
  ProfessionOntologyEntry,
  SkillDefinition,
} from "./profession-ontology.js";

interface SeedProfessionSpec {
  professionId: string;
  label: string;
  category: ProfessionCategory;
  summary: string;
  taxonomyCode: string;
  taxonomyDomain: string;
  slug: string;
  aliases: string[];
  keywords: string[];
  skills: string[];
  capabilities: Array<{ label: string; actionClass: ActionDecompositionClass }>;
  credentials: string[];
  licenses: string[];
  actionFamilies: Array<{ label: string; actionClass: ActionDecompositionClass; taxonomyCode: string }>;
  relatedProfessionIds?: string[];
}

function skill(id: string, label: string): SkillDefinition {
  return { skillId: id, label, hierarchyLevel: "skill" };
}

function capability(
  id: string,
  label: string,
  actionClass: ActionDecompositionClass
): CapabilityDefinition {
  return { capabilityId: id, label, hierarchyLevel: "capability", actionClass };
}

function actionFamily(
  id: string,
  label: string,
  actionClass: ActionDecompositionClass,
  taxonomyCode: string
): ActionFamilyDefinition {
  return { actionFamilyId: id, label, decompositionClass: actionClass, taxonomyCode };
}

function buildHierarchy(spec: SeedProfessionSpec): ProfessionOntologyEntry["hierarchy"] {
  const domainNodeId = `domain-${spec.taxonomyDomain}`;
  const subDomainNodeId = `subdomain-${spec.category}`;
  const professionNodeId = `profession-${spec.professionId}`;
  return {
    professionId: spec.professionId,
    nodes: [
      { nodeId: domainNodeId, level: "domain", label: `Domain ${spec.taxonomyDomain}` },
      {
        nodeId: subDomainNodeId,
        level: "sub_domain",
        label: spec.category.replace(/_/g, " "),
        parentNodeId: domainNodeId,
      },
      {
        nodeId: professionNodeId,
        level: "profession",
        label: spec.label,
        parentNodeId: subDomainNodeId,
      },
      ...spec.skills.map((label, index) => ({
        nodeId: `${spec.professionId}-skill-${index + 1}`,
        level: "skill" as const,
        label,
        parentNodeId: professionNodeId,
      })),
      ...spec.capabilities.map((entry, index) => ({
        nodeId: `${spec.professionId}-capability-${index + 1}`,
        level: "capability" as const,
        label: entry.label,
        parentNodeId: professionNodeId,
      })),
      ...spec.actionFamilies.map((entry, index) => ({
        nodeId: `${spec.professionId}-action-family-${index + 1}`,
        level: "action_family" as const,
        label: entry.label,
        parentNodeId: professionNodeId,
      })),
    ],
  };
}

function buildEntry(spec: SeedProfessionSpec): ProfessionOntologyEntry {
  const template = getTemplateByActionCode(spec.taxonomyCode);
  const minProviderTier = (template?.minProviderTier ?? "T1") as "T1" | "T2" | "T3";
  const blueprintId = buildBlueprintId(spec.taxonomyCode, spec.slug);

  return {
    professionId: spec.professionId,
    label: spec.label,
    category: spec.category,
    status: "published",
    summary: spec.summary,
    aliases: spec.aliases.map((label, index) => ({
      aliasId: `${spec.professionId}-alias-${index + 1}`,
      label,
      language: /[\u0600-\u06FF]/.test(label) ? "ar" : "en",
    })),
    keywords: spec.keywords.map((term, index) => ({
      keywordId: `${spec.professionId}-kw-${index + 1}`,
      term,
      weight: 1,
    })),
    skills: spec.skills.map((label, index) => skill(`${spec.professionId}-skill-${index + 1}`, label)),
    capabilities: spec.capabilities.map((entry, index) =>
      capability(`${spec.professionId}-cap-${index + 1}`, entry.label, entry.actionClass)
    ),
    credentials: spec.credentials.map((label) => ({
      code: label.toLowerCase().replace(/\s+/g, "_"),
      label,
      required: true,
    })),
    licenses: spec.licenses.map((label, index) => ({
      licenseId: `${spec.professionId}-license-${index + 1}`,
      label,
      required: true,
    })),
    relationships: (spec.relatedProfessionIds ?? []).map((targetProfessionId, index) => ({
      relationshipId: `${spec.professionId}-rel-${index + 1}`,
      targetProfessionId,
      kind: "related" as const,
    })),
    taxonomyBinding: {
      primaryTaxonomyDomain: spec.taxonomyDomain,
      primaryTaxonomyCode: spec.taxonomyCode,
      minProviderTier,
    },
    blueprintBindings: [
      {
        blueprintId,
        version: "1.0.0",
        label: `${spec.label} blueprint`,
      },
    ],
    actionFamilies: spec.actionFamilies.map((entry, index) =>
      actionFamily(`${spec.professionId}-af-${index + 1}`, entry.label, entry.actionClass, entry.taxonomyCode)
    ),
    hierarchy: buildHierarchy(spec),
    schemaVersion: PROFESSION_ONTOLOGY_SCHEMA_VERSION,
  };
}

const SEED_PROFESSIONS: SeedProfessionSpec[] = [
  {
    professionId: "plumber",
    label: "Plumber",
    category: "physical_trade",
    summary: "Installs and repairs plumbing systems.",
    taxonomyCode: "B.1.2",
    taxonomyDomain: "B",
    slug: "plumbing-service-repair",
    aliases: ["Plumbing Technician", "سباك"],
    keywords: ["plumber", "plumbing", "pipe", "leak", "drain"],
    skills: ["Pipe fitting", "Leak diagnosis", "Drain clearing"],
    capabilities: [
      { label: "Repair leaking pipes", actionClass: "physical" },
      { label: "Install fixtures", actionClass: "meso" },
      { label: "Diagnose blockages", actionClass: "cognitive" },
    ],
    credentials: ["trade certification"],
    licenses: ["plumbing license"],
    actionFamilies: [
      { label: "Emergency pipe repair", actionClass: "macro", taxonomyCode: "B.1.2" },
      { label: "Fixture installation", actionClass: "meso", taxonomyCode: "B.1.2" },
      { label: "Seal joint replacement", actionClass: "micro", taxonomyCode: "B.1.2" },
    ],
    relatedProfessionIds: ["home-maintenance"],
  },
  {
    professionId: "electrician",
    label: "Electrician",
    category: "technical_trade",
    summary: "Installs and maintains electrical systems.",
    taxonomyCode: "B.2.1",
    taxonomyDomain: "B",
    slug: "electrical-panel-upgrade",
    aliases: ["Electrical Technician", "كهربائي"],
    keywords: ["electrician", "electrical", "wiring", "panel", "circuit"],
    skills: ["Circuit wiring", "Panel upgrades", "Safety inspection"],
    capabilities: [
      { label: "Install electrical panels", actionClass: "physical" },
      { label: "Test circuits", actionClass: "digital" },
      { label: "Plan load distribution", actionClass: "cognitive" },
    ],
    credentials: ["electrician license"],
    licenses: ["journeyman electrician license"],
    actionFamilies: [
      { label: "Panel upgrade project", actionClass: "macro", taxonomyCode: "B.2.1" },
      { label: "Outlet installation", actionClass: "meso", taxonomyCode: "B.2.1" },
      { label: "Wire termination", actionClass: "fine_grained", taxonomyCode: "B.2.1" },
    ],
  },
  {
    professionId: "carpenter",
    label: "Carpenter",
    category: "physical_trade",
    summary: "Builds and repairs wooden structures and surfaces.",
    taxonomyCode: "A.2.1",
    taxonomyDomain: "A",
    slug: "surface-repair-standard",
    aliases: ["Joiner", "Woodworker"],
    keywords: ["carpenter", "carpentry", "wood", "frame", "cabinet"],
    skills: ["Framing", "Finish carpentry", "Surface repair"],
    capabilities: [
      { label: "Repair surfaces", actionClass: "physical" },
      { label: "Measure and cut materials", actionClass: "fine_grained" },
      { label: "Interpret build plans", actionClass: "cognitive" },
    ],
    credentials: ["trade certification"],
    licenses: [],
    actionFamilies: [
      { label: "Surface repair engagement", actionClass: "macro", taxonomyCode: "A.2.1" },
      { label: "Trim installation", actionClass: "meso", taxonomyCode: "A.2.1" },
    ],
  },
  {
    professionId: "software-developer",
    label: "Software Developer",
    category: "creative",
    summary: "Designs and builds custom software systems.",
    taxonomyCode: "E.3.1",
    taxonomyDomain: "E",
    slug: "custom-software-build",
    aliases: ["Software Engineer", "Programmer", "مطور برمجيات"],
    keywords: ["software", "developer", "programming", "typescript", "backend"],
    skills: ["API design", "TypeScript development", "System troubleshooting"],
    capabilities: [
      { label: "Implement features", actionClass: "digital" },
      { label: "Review architecture", actionClass: "cognitive" },
      { label: "Collaborate with stakeholders", actionClass: "interactive" },
    ],
    credentials: ["vendor certification"],
    licenses: [],
    actionFamilies: [
      { label: "Custom software build", actionClass: "macro", taxonomyCode: "E.3.1" },
      { label: "Module implementation", actionClass: "meso", taxonomyCode: "E.3.1" },
      { label: "Unit test authoring", actionClass: "micro", taxonomyCode: "E.3.1" },
      { label: "Bug fix commit", actionClass: "nano", taxonomyCode: "E.3.1" },
    ],
  },
  {
    professionId: "graphic-designer",
    label: "Graphic Designer",
    category: "creative",
    summary: "Produces visual design deliverables.",
    taxonomyCode: "E.1.1",
    taxonomyDomain: "E",
    slug: "graphic-design-deliverable",
    aliases: ["Visual Designer", "مصمم جرافيك"],
    keywords: ["graphic", "designer", "branding", "logo", "layout"],
    skills: ["Brand identity design", "Layout composition", "Visual storytelling"],
    capabilities: [
      { label: "Create logo packages", actionClass: "digital" },
      { label: "Iterate design concepts", actionClass: "cognitive" },
      { label: "Present concepts to clients", actionClass: "interactive" },
    ],
    credentials: ["design portfolio"],
    licenses: [],
    actionFamilies: [
      { label: "Brand design project", actionClass: "macro", taxonomyCode: "E.1.1" },
      { label: "Logo iteration", actionClass: "meso", taxonomyCode: "E.1.1" },
    ],
  },
  {
    professionId: "marketing-consultant",
    label: "Marketing Consultant",
    category: "advisory",
    summary: "Advises on marketing strategy and operations.",
    taxonomyCode: "C.1.1",
    taxonomyDomain: "C",
    slug: "strategy-consulting-advisory",
    aliases: ["Marketing Advisor", "Brand Strategist"],
    keywords: ["marketing", "consultant", "strategy", "campaign", "brand"],
    skills: ["Market analysis", "Campaign planning", "Positioning"],
    capabilities: [
      { label: "Develop marketing strategy", actionClass: "cognitive" },
      { label: "Facilitate workshops", actionClass: "interactive" },
      { label: "Deliver recommendation decks", actionClass: "digital" },
    ],
    credentials: ["marketing certification"],
    licenses: [],
    actionFamilies: [
      { label: "Strategy consulting engagement", actionClass: "macro", taxonomyCode: "C.1.1" },
      { label: "Campaign review", actionClass: "meso", taxonomyCode: "C.1.1" },
    ],
  },
  {
    professionId: "accountant",
    label: "Accountant",
    category: "advisory",
    summary: "Provides financial analysis and reporting advisory.",
    taxonomyCode: "C.1.2",
    taxonomyDomain: "C",
    slug: "operations-advisory-review",
    aliases: ["CPA", "Financial Accountant"],
    keywords: ["accountant", "accounting", "audit", "bookkeeping", "financial report"],
    skills: ["Financial analysis", "Reconciliation", "Reporting"],
    capabilities: [
      { label: "Prepare financial reports", actionClass: "digital" },
      { label: "Analyze ledgers", actionClass: "cognitive" },
      { label: "Advise on process controls", actionClass: "interactive" },
    ],
    credentials: ["CPA credential"],
    licenses: ["accounting license"],
    actionFamilies: [
      { label: "Operations advisory review", actionClass: "macro", taxonomyCode: "C.1.2" },
      { label: "Monthly reconciliation", actionClass: "meso", taxonomyCode: "C.1.2" },
    ],
  },
  {
    professionId: "lawyer",
    label: "Lawyer",
    category: "advisory",
    summary: "Provides legal consultation and document advisory.",
    taxonomyCode: "C.1.1",
    taxonomyDomain: "C",
    slug: "strategy-consulting-advisory",
    aliases: ["Attorney", "Legal Counsel", "محامي"],
    keywords: ["lawyer", "legal", "attorney", "counsel", "compliance"],
    skills: ["Legal analysis", "Contract review", "Compliance guidance"],
    capabilities: [
      { label: "Analyze legal risk", actionClass: "cognitive" },
      { label: "Draft advisory memos", actionClass: "digital" },
      { label: "Consult with clients", actionClass: "interactive" },
    ],
    credentials: ["bar admission"],
    licenses: ["legal practice license"],
    actionFamilies: [
      { label: "Legal advisory engagement", actionClass: "macro", taxonomyCode: "C.1.1" },
      { label: "Contract clause review", actionClass: "micro", taxonomyCode: "C.1.1" },
    ],
  },
  {
    professionId: "tutor",
    label: "Tutor",
    category: "knowledge",
    summary: "Delivers structured one-to-one instruction.",
    taxonomyCode: "G.1.1",
    taxonomyDomain: "G",
    slug: "one-to-one-tutoring-course",
    aliases: ["Private Teacher", "مدرس"],
    keywords: ["tutor", "tutoring", "lesson", "student", "curriculum"],
    skills: ["Lesson planning", "Student assessment", "Concept explanation"],
    capabilities: [
      { label: "Deliver tutoring sessions", actionClass: "interactive" },
      { label: "Assess student progress", actionClass: "cognitive" },
      { label: "Prepare practice exercises", actionClass: "digital" },
    ],
    credentials: ["subject matter credential"],
    licenses: [],
    actionFamilies: [
      { label: "Tutoring course", actionClass: "macro", taxonomyCode: "G.1.1" },
      { label: "Single lesson session", actionClass: "meso", taxonomyCode: "G.1.1" },
    ],
  },
  {
    professionId: "event-organizer",
    label: "Event Organizer",
    category: "operational",
    summary: "Coordinates single events and logistics.",
    taxonomyCode: "F.1.2",
    taxonomyDomain: "F",
    slug: "event-coordination-single",
    aliases: ["Event Coordinator", "Event Planner"],
    keywords: ["event", "organizer", "planning", "venue", "logistics"],
    skills: ["Vendor coordination", "Run-of-show planning", "Guest logistics"],
    capabilities: [
      { label: "Plan event timelines", actionClass: "cognitive" },
      { label: "Coordinate vendors", actionClass: "interactive" },
      { label: "Manage on-site logistics", actionClass: "physical" },
    ],
    credentials: ["event planning certification"],
    licenses: [],
    actionFamilies: [
      { label: "Single event coordination", actionClass: "macro", taxonomyCode: "F.1.2" },
      { label: "Vendor checkpoint", actionClass: "meso", taxonomyCode: "F.1.2" },
    ],
  },
  {
    professionId: "cleaner",
    label: "Cleaner",
    category: "physical_trade",
    summary: "Provides cleaning and sanitization services.",
    taxonomyCode: "A.4.2",
    taxonomyDomain: "A",
    slug: "cleaning-sanitization-residential",
    aliases: ["Cleaning Specialist", "Housekeeper", "منظف"],
    keywords: ["cleaner", "cleaning", "sanitize", "housekeeping", "janitor"],
    skills: ["Surface sanitization", "Housekeeping routines", "Disinfection protocols"],
    capabilities: [
      { label: "Sanitize spaces", actionClass: "physical" },
      { label: "Follow cleaning checklists", actionClass: "fine_grained" },
      { label: "Report completion", actionClass: "digital" },
    ],
    credentials: ["sanitation training"],
    licenses: [],
    actionFamilies: [
      { label: "Residential cleaning visit", actionClass: "macro", taxonomyCode: "A.4.2" },
      { label: "Room sanitization", actionClass: "meso", taxonomyCode: "A.4.2" },
    ],
  },
  {
    professionId: "photographer",
    label: "Photographer",
    category: "creative",
    summary: "Produces photographic deliverables.",
    taxonomyCode: "E.1.1",
    taxonomyDomain: "E",
    slug: "graphic-design-deliverable",
    aliases: ["Photo Producer", "Commercial Photographer"],
    keywords: ["photographer", "photography", "photo shoot", "camera", "portrait"],
    skills: ["Lighting setup", "Composition", "Post-processing"],
    capabilities: [
      { label: "Conduct photo shoots", actionClass: "physical" },
      { label: "Edit deliverables", actionClass: "digital" },
      { label: "Direct subjects", actionClass: "interactive" },
    ],
    credentials: ["photography portfolio"],
    licenses: [],
    actionFamilies: [
      { label: "Photo deliverable project", actionClass: "macro", taxonomyCode: "E.1.1" },
      { label: "Single portrait session", actionClass: "meso", taxonomyCode: "E.1.1" },
    ],
  },
  {
    professionId: "property-inspector",
    label: "Property Inspector",
    category: "inspection",
    summary: "Assesses property condition and produces inspection reports.",
    taxonomyCode: "H.1.1",
    taxonomyDomain: "H",
    slug: "property-condition-inspection",
    aliases: ["Home Inspector", "Building Inspector", "مفتش عقارات"],
    keywords: ["inspector", "inspection", "property", "condition", "assessment"],
    skills: ["Condition assessment", "Defect identification", "Report writing"],
    capabilities: [
      { label: "Inspect property systems", actionClass: "physical" },
      { label: "Document defects", actionClass: "digital" },
      { label: "Evaluate compliance", actionClass: "cognitive" },
    ],
    credentials: ["inspector certification"],
    licenses: ["home inspector license"],
    actionFamilies: [
      { label: "Property condition assessment", actionClass: "macro", taxonomyCode: "H.1.1" },
      { label: "Room inspection", actionClass: "meso", taxonomyCode: "H.1.1" },
    ],
  },
  {
    professionId: "personal-assistant",
    label: "Personal Assistant",
    category: "care_support",
    summary: "Supports daily household and personal operations.",
    taxonomyCode: "D.3.1",
    taxonomyDomain: "D",
    slug: "household-management-weekly",
    aliases: ["Executive Assistant", "Personal Aide"],
    keywords: ["personal assistant", "assistant", "household aid", "scheduling", " errands"],
    skills: ["Scheduling", "Household coordination", "Task prioritization"],
    capabilities: [
      { label: "Manage calendars", actionClass: "digital" },
      { label: "Coordinate errands", actionClass: "interactive" },
      { label: "Maintain household routines", actionClass: "physical" },
    ],
    credentials: ["background check"],
    licenses: [],
    actionFamilies: [
      { label: "Weekly household support", actionClass: "macro", taxonomyCode: "D.3.1" },
      { label: "Daily task completion", actionClass: "meso", taxonomyCode: "D.3.1" },
    ],
  },
  {
    professionId: "home-maintenance",
    label: "Home Maintenance",
    category: "physical_trade",
    summary: "Provides routine residential maintenance services.",
    taxonomyCode: "A.4.1",
    taxonomyDomain: "A",
    slug: "routine-maintenance-scheduled",
    aliases: ["Maintenance Technician", "Handyman"],
    keywords: ["home maintenance", "handyman", "maintenance visit", "upkeep", "repair visit"],
    skills: ["Routine inspections", "Minor repairs", "Preventive upkeep"],
    capabilities: [
      { label: "Perform maintenance visits", actionClass: "physical" },
      { label: "Log maintenance checklists", actionClass: "digital" },
      { label: "Identify follow-up repairs", actionClass: "cognitive" },
    ],
    credentials: ["maintenance certification"],
    licenses: [],
    actionFamilies: [
      { label: "Scheduled maintenance visit", actionClass: "macro", taxonomyCode: "A.4.1" },
      { label: "Filter replacement task", actionClass: "micro", taxonomyCode: "A.4.1" },
    ],
    relatedProfessionIds: ["plumber", "electrician", "carpenter"],
  },
];

export function buildSeedProfessionRegistry(): ProfessionOntologyEntry[] {
  return SEED_PROFESSIONS.map(buildEntry);
}

export function getSeedProfessionById(professionId: string): ProfessionOntologyEntry | undefined {
  return buildSeedProfessionRegistry().find((entry) => entry.professionId === professionId);
}

export function buildGlobalProfessionHierarchy(): Array<{
  level: string;
  label: string;
  profession_count: number;
}> {
  const entries = buildSeedProfessionRegistry();
  const domains = new Map<string, number>();
  for (const entry of entries) {
    const domain = entry.taxonomyBinding.primaryTaxonomyDomain;
    domains.set(domain, (domains.get(domain) ?? 0) + 1);
  }
  return [...domains.entries()].map(([domain, professionCount]) => ({
    level: "domain",
    label: `Domain ${domain}`,
    profession_count: professionCount,
  }));
}
