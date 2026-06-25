import { PROJECT_PHASE_KINDS } from "./project-schema.js";

export type ProjectPhaseKind = (typeof PROJECT_PHASE_KINDS)[number];

export interface ProjectTemplateNodeSpec {
  nodeId: string;
  label: string;
  professionId: string;
  primaryTaxonomyCode: string;
  phaseId: string;
  deliverable: string;
  durationWeight: number;
}

export interface ProjectTemplateEdgeSpec {
  fromNodeId: string;
  toNodeId: string;
  dependencyKind: "finish_to_start" | "start_to_start";
}

export interface ProjectTemplatePhaseSpec {
  phaseId: string;
  kind: ProjectPhaseKind;
  label: string;
  nodeIds: string[];
}

export interface ProjectTemplateSpec {
  templateId: string;
  label: string;
  keywords: string[];
  summary: string;
  phases: ProjectTemplatePhaseSpec[];
  nodes: ProjectTemplateNodeSpec[];
  edges: ProjectTemplateEdgeSpec[];
}

const TEMPLATE_SPECS: ProjectTemplateSpec[] = [
  {
    templateId: "build-company-website",
    label: "Build Company Website",
    keywords: ["build company website", "website project", "build website", "web presence"],
    summary: "Design, build, test, and deploy a company website.",
    phases: [
      { phaseId: "planning", kind: "planning", label: "Planning", nodeIds: ["design"] },
      { phaseId: "execution", kind: "execution", label: "Execution", nodeIds: ["develop", "test"] },
      { phaseId: "completion", kind: "completion", label: "Completion", nodeIds: ["deploy"] },
    ],
    nodes: [
      {
        nodeId: "design",
        label: "Visual design",
        professionId: "graphic-designer",
        primaryTaxonomyCode: "E.1.1",
        phaseId: "planning",
        deliverable: "Approved design assets",
        durationWeight: 2,
      },
      {
        nodeId: "develop",
        label: "Software development",
        professionId: "software-developer",
        primaryTaxonomyCode: "E.3.1",
        phaseId: "execution",
        deliverable: "Implemented website modules",
        durationWeight: 4,
      },
      {
        nodeId: "test",
        label: "Quality verification",
        professionId: "software-developer",
        primaryTaxonomyCode: "B.3.3",
        phaseId: "execution",
        deliverable: "Test report",
        durationWeight: 2,
      },
      {
        nodeId: "deploy",
        label: "Deployment",
        professionId: "software-developer",
        primaryTaxonomyCode: "E.3.1",
        phaseId: "completion",
        deliverable: "Live deployment confirmation",
        durationWeight: 1,
      },
    ],
    edges: [
      { fromNodeId: "design", toNodeId: "develop", dependencyKind: "finish_to_start" },
      { fromNodeId: "develop", toNodeId: "test", dependencyKind: "finish_to_start" },
      { fromNodeId: "test", toNodeId: "deploy", dependencyKind: "finish_to_start" },
    ],
  },
  {
    templateId: "home-renovation",
    label: "Home Renovation",
    keywords: ["home renovation", "renovation project", "remodel", "home remodel"],
    summary: "Coordinate surface, plumbing, and electrical renovation work.",
    phases: [
      { phaseId: "discovery", kind: "discovery", label: "Discovery", nodeIds: ["inspect"] },
      { phaseId: "execution", kind: "execution", label: "Execution", nodeIds: ["surface", "plumbing"] },
      { phaseId: "verification", kind: "verification", label: "Verification", nodeIds: ["electrical"] },
    ],
    nodes: [
      {
        nodeId: "inspect",
        label: "Property inspection",
        professionId: "property-inspector",
        primaryTaxonomyCode: "H.1.1",
        phaseId: "discovery",
        deliverable: "Renovation condition report",
        durationWeight: 2,
      },
      {
        nodeId: "surface",
        label: "Surface repair",
        professionId: "carpenter",
        primaryTaxonomyCode: "A.2.1",
        phaseId: "execution",
        deliverable: "Repaired surfaces",
        durationWeight: 3,
      },
      {
        nodeId: "plumbing",
        label: "Plumbing updates",
        professionId: "plumber",
        primaryTaxonomyCode: "B.1.2",
        phaseId: "execution",
        deliverable: "Updated plumbing fixtures",
        durationWeight: 3,
      },
      {
        nodeId: "electrical",
        label: "Electrical verification",
        professionId: "electrician",
        primaryTaxonomyCode: "B.2.1",
        phaseId: "verification",
        deliverable: "Electrical safety sign-off",
        durationWeight: 2,
      },
    ],
    edges: [
      { fromNodeId: "inspect", toNodeId: "surface", dependencyKind: "finish_to_start" },
      { fromNodeId: "inspect", toNodeId: "plumbing", dependencyKind: "finish_to_start" },
      { fromNodeId: "surface", toNodeId: "electrical", dependencyKind: "finish_to_start" },
      { fromNodeId: "plumbing", toNodeId: "electrical", dependencyKind: "finish_to_start" },
    ],
  },
  {
    templateId: "office-relocation",
    label: "Office Relocation",
    keywords: ["office move", "relocation project", "move office", "office relocation"],
    summary: "Plan relocation, coordinate event logistics, and clean new space.",
    phases: [
      { phaseId: "planning", kind: "planning", label: "Planning", nodeIds: ["coordinate"] },
      { phaseId: "execution", kind: "execution", label: "Execution", nodeIds: ["clean"] },
      { phaseId: "completion", kind: "completion", label: "Completion", nodeIds: ["maintain"] },
    ],
    nodes: [
      {
        nodeId: "coordinate",
        label: "Relocation coordination",
        professionId: "event-organizer",
        primaryTaxonomyCode: "F.1.2",
        phaseId: "planning",
        deliverable: "Relocation runbook",
        durationWeight: 2,
      },
      {
        nodeId: "clean",
        label: "Space sanitization",
        professionId: "cleaner",
        primaryTaxonomyCode: "A.4.2",
        phaseId: "execution",
        deliverable: "Sanitized office space",
        durationWeight: 1,
      },
      {
        nodeId: "maintain",
        label: "Maintenance handover",
        professionId: "home-maintenance",
        primaryTaxonomyCode: "A.4.1",
        phaseId: "completion",
        deliverable: "Maintenance checklist",
        durationWeight: 1,
      },
    ],
    edges: [
      { fromNodeId: "coordinate", toNodeId: "clean", dependencyKind: "finish_to_start" },
      { fromNodeId: "clean", toNodeId: "maintain", dependencyKind: "finish_to_start" },
    ],
  },
  {
    templateId: "care-program",
    label: "Care Program",
    keywords: ["care program", "elder care program", "care plan project"],
    summary: "Structured personal care and household support program.",
    phases: [
      { phaseId: "planning", kind: "planning", label: "Planning", nodeIds: ["assess"] },
      { phaseId: "execution", kind: "execution", label: "Execution", nodeIds: ["care", "household"] },
    ],
    nodes: [
      {
        nodeId: "assess",
        label: "Care assessment",
        professionId: "personal-assistant",
        primaryTaxonomyCode: "D.3.1",
        phaseId: "planning",
        deliverable: "Care support plan",
        durationWeight: 1,
      },
      {
        nodeId: "care",
        label: "Personal care sessions",
        professionId: "personal-assistant",
        primaryTaxonomyCode: "D.1.1",
        phaseId: "execution",
        deliverable: "Care session logs",
        durationWeight: 3,
      },
      {
        nodeId: "household",
        label: "Household management",
        professionId: "personal-assistant",
        primaryTaxonomyCode: "D.3.1",
        phaseId: "execution",
        deliverable: "Weekly household completion report",
        durationWeight: 2,
      },
    ],
    edges: [
      { fromNodeId: "assess", toNodeId: "care", dependencyKind: "finish_to_start" },
      { fromNodeId: "assess", toNodeId: "household", dependencyKind: "finish_to_start" },
    ],
  },
  {
    templateId: "learning-program",
    label: "Learning Program",
    keywords: ["learning program", "training program", "course of study", "tutoring program"],
    summary: "Structured tutoring program with verification milestones.",
    phases: [
      { phaseId: "planning", kind: "planning", label: "Planning", nodeIds: ["curriculum"] },
      { phaseId: "execution", kind: "execution", label: "Execution", nodeIds: ["tutor"] },
      { phaseId: "verification", kind: "verification", label: "Verification", nodeIds: ["review"] },
    ],
    nodes: [
      {
        nodeId: "curriculum",
        label: "Curriculum planning",
        professionId: "tutor",
        primaryTaxonomyCode: "G.1.1",
        phaseId: "planning",
        deliverable: "Approved curriculum",
        durationWeight: 1,
      },
      {
        nodeId: "tutor",
        label: "Tutoring sessions",
        professionId: "tutor",
        primaryTaxonomyCode: "G.1.1",
        phaseId: "execution",
        deliverable: "Session completion logs",
        durationWeight: 4,
      },
      {
        nodeId: "review",
        label: "Progress review",
        professionId: "tutor",
        primaryTaxonomyCode: "G.1.1",
        phaseId: "verification",
        deliverable: "Progress assessment report",
        durationWeight: 1,
      },
    ],
    edges: [
      { fromNodeId: "curriculum", toNodeId: "tutor", dependencyKind: "finish_to_start" },
      { fromNodeId: "tutor", toNodeId: "review", dependencyKind: "finish_to_start" },
    ],
  },
  {
    templateId: "annual-maintenance",
    label: "Annual Maintenance Program",
    keywords: ["annual maintenance", "maintenance program", "facility upkeep"],
    summary: "Scheduled maintenance with plumbing and electrical checkpoints.",
    phases: [
      { phaseId: "planning", kind: "planning", label: "Planning", nodeIds: ["schedule"] },
      { phaseId: "execution", kind: "execution", label: "Execution", nodeIds: ["maintain", "plumbing"] },
    ],
    nodes: [
      {
        nodeId: "schedule",
        label: "Maintenance scheduling",
        professionId: "home-maintenance",
        primaryTaxonomyCode: "A.4.1",
        phaseId: "planning",
        deliverable: "Annual maintenance schedule",
        durationWeight: 1,
      },
      {
        nodeId: "maintain",
        label: "Routine maintenance visits",
        professionId: "home-maintenance",
        primaryTaxonomyCode: "A.4.1",
        phaseId: "execution",
        deliverable: "Maintenance visit reports",
        durationWeight: 3,
      },
      {
        nodeId: "plumbing",
        label: "Plumbing checkpoint",
        professionId: "plumber",
        primaryTaxonomyCode: "B.1.2",
        phaseId: "execution",
        deliverable: "Plumbing inspection checklist",
        durationWeight: 2,
      },
    ],
    edges: [
      { fromNodeId: "schedule", toNodeId: "maintain", dependencyKind: "finish_to_start" },
      { fromNodeId: "schedule", toNodeId: "plumbing", dependencyKind: "finish_to_start" },
    ],
  },
];

export function buildSeedProjectTemplates(): ProjectTemplateSpec[] {
  return [...TEMPLATE_SPECS];
}

export function getProjectTemplateById(templateId: string): ProjectTemplateSpec | undefined {
  return TEMPLATE_SPECS.find((template) => template.templateId === templateId);
}

export function listProjectTemplateSpecs(): ProjectTemplateSpec[] {
  return [...TEMPLATE_SPECS];
}
