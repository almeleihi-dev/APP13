import { getTemplateByActionCode } from "../../contract/templates/registry.js";
import { getActionType } from "../../action/domain/action.js";
import type { ActionBlueprint } from "../../action-blueprint/domain/action-blueprint.js";
import type { GlobalRegistryEntry } from "../../blueprint-governance/domain/blueprint-registry.js";

export interface CategoryMetadata {
  category: string;
  subCategory: string;
  taxonomyCode: string;
  domain: string;
  actionName: string;
  navigationPath: string[];
  summary: string;
}

export function buildCategoryMetadata(blueprint: ActionBlueprint): CategoryMetadata {
  const actionType = getActionType(blueprint.primaryTaxonomyCode);
  const domainCategories: Record<string, { category: string; subCategory: string }> = {
    A: { category: "Home & Property", subCategory: "Maintenance & Repair" },
    B: { category: "Technical & Trade", subCategory: "Skilled Services" },
    C: { category: "Professional Services", subCategory: "Advisory & Consulting" },
    D: { category: "Care & Support", subCategory: "Personal & Household Care" },
    E: { category: "Creative & Digital", subCategory: "Design & Development" },
    F: { category: "Coordination & Events", subCategory: "Planning & Logistics" },
    G: { category: "Education & Training", subCategory: "Tutoring & Learning" },
    H: { category: "Inspection & Assessment", subCategory: "Evaluation & Reporting" },
  };
  const placement = domainCategories[blueprint.domain] ?? {
    category: "General Services",
    subCategory: "Other",
  };

  return {
    category: placement.category,
    subCategory: placement.subCategory,
    taxonomyCode: blueprint.primaryTaxonomyCode,
    domain: blueprint.domain,
    actionName: actionType?.actionName ?? blueprint.title,
    navigationPath: [placement.category, placement.subCategory, blueprint.primaryTaxonomyCode],
    summary: `Category placement for ${blueprint.primaryTaxonomyCode} in ${placement.category}.`,
  };
}

export function listCategoryCatalog(): CategoryMetadata[] {
  const codes = [
    "A.2.1", "B.1.2", "C.1.1", "D.1.1", "E.3.1", "F.1.2", "G.1.1", "H.1.1",
  ];
  return codes.map((code) => {
    const actionType = getActionType(code);
    const domain = actionType?.domain ?? "A";
    const domainCategories: Record<string, { category: string; subCategory: string }> = {
      A: { category: "Home & Property", subCategory: "Maintenance & Repair" },
      B: { category: "Technical & Trade", subCategory: "Skilled Services" },
      C: { category: "Professional Services", subCategory: "Advisory & Consulting" },
      D: { category: "Care & Support", subCategory: "Personal & Household Care" },
      E: { category: "Creative & Digital", subCategory: "Design & Development" },
      F: { category: "Coordination & Events", subCategory: "Planning & Logistics" },
      G: { category: "Education & Training", subCategory: "Tutoring & Learning" },
      H: { category: "Inspection & Assessment", subCategory: "Evaluation & Reporting" },
    };
    const placement = domainCategories[domain] ?? { category: "General Services", subCategory: "Other" };
    return {
      category: placement.category,
      subCategory: placement.subCategory,
      taxonomyCode: code,
      domain,
      actionName: actionType?.actionName ?? code,
      navigationPath: [placement.category, placement.subCategory, code],
      summary: `Catalog entry for ${code}.`,
    };
  });
}

export function deriveCategoryFromRegistry(entry: GlobalRegistryEntry): CategoryMetadata {
  return {
    category: entry.domain === "A" ? "Home & Property" : buildCategoryMetadataFromDomain(entry.domain).category,
    subCategory: buildCategoryMetadataFromDomain(entry.domain).subCategory,
    taxonomyCode: entry.primaryTaxonomyCode,
    domain: entry.domain,
    actionName: entry.title,
    navigationPath: [
      buildCategoryMetadataFromDomain(entry.domain).category,
      buildCategoryMetadataFromDomain(entry.domain).subCategory,
      entry.primaryTaxonomyCode,
    ],
    summary: `Registry-derived category for ${entry.registryId}.`,
  };
}

function buildCategoryMetadataFromDomain(domain: string) {
  const map: Record<string, { category: string; subCategory: string }> = {
    A: { category: "Home & Property", subCategory: "Maintenance & Repair" },
    B: { category: "Technical & Trade", subCategory: "Skilled Services" },
    C: { category: "Professional Services", subCategory: "Advisory & Consulting" },
    D: { category: "Care & Support", subCategory: "Personal & Household Care" },
    E: { category: "Creative & Digital", subCategory: "Design & Development" },
    F: { category: "Coordination & Events", subCategory: "Planning & Logistics" },
    G: { category: "Education & Training", subCategory: "Tutoring & Learning" },
    H: { category: "Inspection & Assessment", subCategory: "Evaluation & Reporting" },
  };
  return map[domain] ?? { category: "General Services", subCategory: "Other" };
}

export function buildContractMetadata(blueprint: ActionBlueprint) {
  const template = getTemplateByActionCode(blueprint.primaryTaxonomyCode);
  return {
    templateId: template?.templateId ?? blueprint.tekrrBinding.templateId,
    contractType: template?.contractTermType ?? "fixed",
    jurisdictionPack: template?.jurisdictionPack ?? "US-GENERIC-v1",
    clauseModules: template?.clauseModules ?? [],
    tekrrDimensions: blueprint.tekrrBinding.dimensions,
    milestoneCount: blueprint.milestonePattern.length,
    filingWindowDays: template?.filingWindowDays ?? 30,
    summary: `Contract metadata compiled from template ${template?.templateId ?? blueprint.tekrrBinding.templateId}.`,
  };
}
