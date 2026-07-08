import type { ProviderTier } from "../../action-blueprint/domain/action-blueprint.js";

export interface ResourceRequirement {
  code: string;
  label: string;
  required: boolean;
}

export interface ResourceModel {
  tools: ResourceRequirement[];
  materials: ResourceRequirement[];
  licenses: ResourceRequirement[];
  personnel: ResourceRequirement[];
  summary: string;
}

const DOMAIN_TOOLS: Record<string, string[]> = {
  A: ["hand_tools", "safety_equipment", "measuring_tools"],
  B: ["trade_tools", "diagnostic_equipment", "testing_devices"],
  C: ["collaboration_suite", "documentation_tools"],
  D: ["care_supplies", "communication_device"],
  E: ["design_software", "creative_assets"],
  F: ["planning_tools", "vendor_directory"],
  G: ["curriculum_materials", "assessment_forms"],
  H: ["inspection_checklist", "camera", "reporting_template"],
};

const TIER_LICENSES: Record<ProviderTier, string[]> = {
  T1: ["identity_verification"],
  T2: ["trade_or_professional_credential", "identity_verification"],
  T3: ["advanced_professional_license", "identity_verification"],
};

export function buildResourceModel(input: {
  domain: string;
  minProviderTier: ProviderTier;
  requiredCredentials: string[];
  scopeInclusions: string[];
}): ResourceModel {
  const tools = (DOMAIN_TOOLS[input.domain] ?? ["general_toolkit"]).map((tool) => ({
    code: tool,
    label: tool.replace(/_/g, " "),
    required: true,
  }));

  const tierLicenses = TIER_LICENSES[input.minProviderTier] ?? TIER_LICENSES.T1;
  const licenses = [...new Set([...tierLicenses, ...input.requiredCredentials])].map((license) => ({
    code: license,
    label: license.replace(/_/g, " "),
    required: true,
  }));

  const materials = input.scopeInclusions.slice(0, 3).map((inclusion, index) => ({
    code: `material_${index + 1}`,
    label: inclusion,
    required: false,
  }));

  return {
    tools,
    materials,
    licenses,
    personnel: [
      { code: "primary_provider", label: "Primary service provider", required: true },
      { code: "customer_representative", label: "Customer representative", required: true },
    ],
    summary: `Resource model: ${tools.length} tools, ${licenses.length} licenses, ${materials.length} material hints.`,
  };
}
