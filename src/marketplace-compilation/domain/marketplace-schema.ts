export const MARKETPLACE_COMPILATION_SCHEMA_VERSION = "marketplace-compilation-v1" as const;

export const LISTING_PUBLISH_STATUSES = [
  "draft",
  "compiled",
  "published",
  "deprecated",
  "archived",
] as const;

export const LISTING_VISIBILITY_LEVELS = ["private", "restricted", "public"] as const;

export const EXECUTION_COMPLEXITY_LEVELS = ["low", "moderate", "high", "expert"] as const;

export const MARKETPLACE_COMPILATION_ROUTES = [
  "/marketplace-compilation",
  "/marketplace-compilation/overview",
  "/marketplace-compilation/compile",
  "/marketplace-compilation/validate",
  "/marketplace-compilation/preview",
  "/marketplace-compilation/listings",
  "/marketplace-compilation/listings/:listingId",
  "/marketplace-compilation/search-index",
  "/marketplace-compilation/categories",
  "/marketplace-compilation/schema",
  "/marketplace-compilation/publish",
  "/marketplace-compilation/deprecate",
] as const;

export const MARKETPLACE_COMPILATION_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://app13.dev/schemas/marketplace-compilation-v1.json",
  title: "MarketplaceListing",
  type: "object",
  required: ["schema_version", "id", "blueprint_id", "title"],
  properties: {
    schema_version: { type: "string", const: MARKETPLACE_COMPILATION_SCHEMA_VERSION },
    id: { type: "string" },
    blueprint_id: { type: "string" },
    title: { type: "string" },
  },
  additionalProperties: true,
} as const;

export const DOMAIN_CATEGORY_MAP: Record<string, { category: string; subCategory: string }> = {
  A: { category: "Home & Property", subCategory: "Maintenance & Repair" },
  B: { category: "Technical & Trade", subCategory: "Skilled Services" },
  C: { category: "Professional Services", subCategory: "Advisory & Consulting" },
  D: { category: "Care & Support", subCategory: "Personal & Household Care" },
  E: { category: "Creative & Digital", subCategory: "Design & Development" },
  F: { category: "Coordination & Events", subCategory: "Planning & Logistics" },
  G: { category: "Education & Training", subCategory: "Tutoring & Learning" },
  H: { category: "Inspection & Assessment", subCategory: "Evaluation & Reporting" },
};
