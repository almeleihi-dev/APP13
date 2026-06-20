/** Contract template types — Universal Schema v1 / Contract Engine v1 */

export type VerificationTier = "T0" | "T1" | "T2" | "T3" | "T4";

export interface TekrrFieldRequirement {
  dimension: "T" | "E" | "K" | "R" | "S";
  field: string;
}

export interface MilestoneTemplate {
  sequenceOrder: number;
  milestoneCode: string;
  name: string;
  responsibleParty: "customer" | "provider" | "system" | "both";
  tekrrDimension?: "T" | "E" | "K" | "R" | "S";
  blocking: boolean;
}

export interface ContractTemplate {
  templateId: string;
  actionCode: string;
  actionName: string;
  domain: string;
  version: string;
  minCustomerTier: VerificationTier;
  minProviderTier: VerificationTier;
  defaultRiskLevel: number;
  clauseModules: string[];
  jurisdictionPack: string;
  contractTermType: string;
  milestones: MilestoneTemplate[];
  tekrrDimensions: Array<"T" | "E" | "K" | "R" | "S">;
  requiredTekrrFields: TekrrFieldRequirement[];
  filingWindowDays: number;
}
