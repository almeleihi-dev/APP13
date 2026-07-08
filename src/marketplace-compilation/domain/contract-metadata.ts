export { buildContractMetadata } from "./category-metadata.js";

export interface ContractMetadataView {
  template_id: string;
  contract_type: string;
  jurisdiction_pack: string;
  clause_modules: string[];
  tekrr_dimensions: string[];
  milestone_count: number;
  filing_window_days: number;
  summary: string;
}

export function toContractMetadataView(metadata: ReturnType<typeof import("./category-metadata.js").buildContractMetadata>): ContractMetadataView {
  return {
    template_id: metadata.templateId,
    contract_type: metadata.contractType,
    jurisdiction_pack: metadata.jurisdictionPack,
    clause_modules: metadata.clauseModules,
    tekrr_dimensions: metadata.tekrrDimensions,
    milestone_count: metadata.milestoneCount,
    filing_window_days: metadata.filingWindowDays,
    summary: metadata.summary,
  };
}
