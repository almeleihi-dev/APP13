export type ActionCatalogCategory = "legal" | "engineering" | "hr" | "finance" | "technology";

export interface CatalogAction {
  actionCode: string;
  actionName: string;
  category: ActionCatalogCategory;
  slug: string;
  keywords: string[];
}

export interface TaskDecompositionRule {
  id: string;
  taskKeywords: string[];
  actionSlugs: string[];
  preferredCategories?: ActionCatalogCategory[];
}

const CATEGORY_LABELS: Record<ActionCatalogCategory, string> = {
  legal: "Legal",
  engineering: "Engineering",
  hr: "HR",
  finance: "Finance",
  technology: "Technology",
};

function catalogEntry(
  category: ActionCatalogCategory,
  slug: string,
  keywords: string[]
): CatalogAction {
  return {
    category,
    slug,
    actionCode: `${category}.${slug}`,
    actionName: `${CATEGORY_LABELS[category]} — ${slug.charAt(0).toUpperCase()}${slug.slice(1)}`,
    keywords,
  };
}

export const ACTION_CATALOG: CatalogAction[] = [
  catalogEntry("legal", "draft", ["draft", "contract draft", "legal draft", "prepare agreement"]),
  catalogEntry("legal", "review", ["review", "legal review", "contract review", "due diligence"]),
  catalogEntry("legal", "negotiate", ["negotiate", "negotiation", "settlement", "terms"]),
  catalogEntry("legal", "analyze", ["analyze", "analysis", "legal analysis", "assessment"]),
  catalogEntry("legal", "represent", ["represent", "representation", "counsel", "advocate"]),
  catalogEntry("engineering", "inspect", ["inspect", "inspection", "site visit", "assessment"]),
  catalogEntry("engineering", "calculate", ["calculate", "calculation", "structural", "load"]),
  catalogEntry("engineering", "design", ["design", "blueprint", "architecture plan", "layout"]),
  catalogEntry("engineering", "supervise", ["supervise", "supervision", "oversight", "foreman"]),
  catalogEntry("engineering", "approve", ["approve", "approval", "sign-off", "certify"]),
  catalogEntry("hr", "recruit", ["recruit", "recruitment", "hiring", "talent acquisition"]),
  catalogEntry("hr", "interview", ["interview", "screening", "candidate interview"]),
  catalogEntry("hr", "evaluate", ["evaluate", "evaluation", "performance review", "assessment"]),
  catalogEntry("hr", "onboard", ["onboard", "onboarding", "orientation", "induction"]),
  catalogEntry("hr", "train", ["train", "training", "workshop", "upskill"]),
  catalogEntry("finance", "audit", ["audit", "auditing", "financial audit", "compliance review"]),
  catalogEntry("finance", "reconcile", ["reconcile", "reconciliation", "ledger match"]),
  catalogEntry("finance", "budget", ["budget", "budgeting", "forecast budget", "cost plan"]),
  catalogEntry("finance", "report", ["report", "reporting", "financial report", "statements"]),
  catalogEntry("finance", "forecast", ["forecast", "forecasting", "projection", "financial model"]),
  catalogEntry("technology", "code", ["code", "coding", "program", "develop", "implementation"]),
  catalogEntry("technology", "test", ["test", "testing", "qa", "quality assurance", "verify"]),
  catalogEntry("technology", "deploy", ["deploy", "deployment", "release", "launch", "go-live"]),
  catalogEntry("technology", "document", ["document", "documentation", "technical writing"]),
  catalogEntry("technology", "troubleshoot", ["troubleshoot", "debug", "incident", "fix issue"]),
];

export const TASK_DECOMPOSITION_RULES: TaskDecompositionRule[] = [
  {
    id: "build-company-website",
    taskKeywords: ["build company website", "company website", "build website", "website project"],
    actionSlugs: ["design", "code", "test", "deploy"],
    preferredCategories: ["engineering", "technology", "technology", "technology"],
  },
  {
    id: "financial-audit-cycle",
    taskKeywords: ["financial audit", "audit cycle", "annual audit"],
    actionSlugs: ["audit", "reconcile", "report"],
    preferredCategories: ["finance", "finance", "finance"],
  },
  {
    id: "hire-team-member",
    taskKeywords: ["hire employee", "recruit team member", "staff hiring"],
    actionSlugs: ["recruit", "interview", "evaluate", "onboard"],
    preferredCategories: ["hr", "hr", "hr", "hr"],
  },
];

const catalogByCode = new Map(ACTION_CATALOG.map((entry) => [entry.actionCode, entry]));
const catalogBySlug = new Map(ACTION_CATALOG.map((entry) => [entry.slug, entry]));

export function getCatalogActionByCode(actionCode: string): CatalogAction | undefined {
  return catalogByCode.get(actionCode);
}

export function getCatalogActionBySlug(
  slug: string,
  preferredCategory?: ActionCatalogCategory
): CatalogAction | undefined {
  if (preferredCategory) {
    const preferred = ACTION_CATALOG.find(
      (entry) => entry.slug === slug && entry.category === preferredCategory
    );
    if (preferred) return preferred;
  }
  return catalogBySlug.get(slug);
}

export function listCatalogActionsByCategory(category: ActionCatalogCategory): CatalogAction[] {
  return ACTION_CATALOG.filter((entry) => entry.category === category);
}

export function resolveDecompositionActions(
  slugs: string[],
  preferredCategories?: ActionCatalogCategory[]
): CatalogAction[] {
  return slugs.map((slug, index) => {
    const preferredCategory = preferredCategories?.[index];
    const action = getCatalogActionBySlug(slug, preferredCategory);
    if (!action) {
      throw new Error(`unknown catalog action slug: ${slug}`);
    }
    return action;
  });
}

export function normalizeSearchText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function keywordMatchStrength(text: string, keywords: string[]): number {
  const normalized = normalizeSearchText(text);
  if (!normalized) return 0;

  let matches = 0;
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeSearchText(keyword);
    if (normalized.includes(normalizedKeyword)) {
      matches += normalizedKeyword.includes(" ") ? 2 : 1;
    }
  }

  const maxWeight = keywords.reduce(
    (sum, keyword) => sum + (normalizeSearchText(keyword).includes(" ") ? 2 : 1),
    0
  );
  if (maxWeight === 0) return 0;
  return Math.min(1, matches / maxWeight);
}
