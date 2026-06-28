import { createActionBlueprintModule } from "../action-blueprint/module.js";
import { createProfessionOntologyModule } from "../profession-ontology/module.js";
import { createProjectDecompositionModule } from "../project-decomposition/module.js";
import { createTekrrIntelligenceModule } from "../tekrr-intelligence/module.js";
import { createExecutionBlueprintModule } from "../execution-blueprint/module.js";
import { createBlueprintGovernanceModule } from "../blueprint-governance/module.js";
import { createMarketplaceCompilationModule } from "../marketplace-compilation/module.js";
import { createIntelligentPricingModule } from "../intelligent-pricing/module.js";
import { createIntelligentCommissionModule } from "../intelligent-commission/module.js";
import { createPersonalAssistantModule } from "../personal-assistant/module.js";
import { createDevelopMeModule } from "../develop-me/module.js";
import { createLearnByActionModule } from "../learn-by-action/module.js";
import { createExpertNetworkModule } from "../expert-network/module.js";
import { createTeamBuilderModule } from "../team-builder/module.js";
import { createKnowledgeBankModule } from "../knowledge-bank/module.js";
import { createIntelligenceOrchestrationModule } from "../intelligence-orchestration/module.js";
import { createUnifiedActionIntelligenceModule } from "../unified-action-intelligence/module.js";
import { createActionOntologyModule } from "../action-ontology/module.js";
import { createActionPlanningModule } from "../action-planning/module.js";
import { createDynamicPricingModule } from "../dynamic-pricing/module.js";
import { createContractIntelligenceEngineModule } from "../contract-intelligence/module.js";
import { createActionIntelligenceService } from "../action/intelligence/action-intelligence-service.js";
import { createRequirementIntelligenceService } from "../action/intelligence/requirement/requirement-intelligence-service.js";
import { createContractIntelligenceService } from "../contract/intelligence/contract-intelligence-service.js";
import { createTrustIntelligenceService } from "../trust/intelligence/trust-intelligence-service.js";
import { createMatchingIntelligenceService } from "../matching/intelligence/matching-intelligence-service.js";
import { createPricingIntelligenceService } from "../pricing/intelligence/pricing-intelligence-service.js";
import { createNegotiationIntelligenceService } from "../negotiation/intelligence/negotiation-intelligence-service.js";
import { createWorkflowIntelligenceService } from "../orchestrator/intelligence/workflow-intelligence-service.js";
import { createProviderIntelligenceService } from "../provider/intelligence/provider-intelligence-service.js";
import type { IntelligenceDependencies } from "./dependencies.js";

export function bootstrapIntelligenceModules(): Pick<
  IntelligenceDependencies,
  | "actionBlueprint"
  | "professionOntology"
  | "projectDecomposition"
  | "tekrrIntelligence"
  | "executionBlueprint"
  | "blueprintGovernance"
  | "marketplaceCompilation"
  | "intelligentPricing"
  | "intelligentCommission"
  | "personalAssistant"
  | "developMe"
  | "learnByAction"
  | "expertNetwork"
  | "teamBuilder"
  | "knowledgeBank"
  | "intelligenceOrchestration"
  | "unifiedActionIntelligence"
  | "actionOntology"
  | "actionPlanning"
  | "dynamicPricing"
  | "contractIntelligenceEngine"
> {
  const { actionBlueprint } = createActionBlueprintModule();
  const { professionOntology } = createProfessionOntologyModule();
  const { projectDecomposition } = createProjectDecompositionModule();
  const { tekrrIntelligence } = createTekrrIntelligenceModule();
  const { executionBlueprint } = createExecutionBlueprintModule();
  const { blueprintGovernance } = createBlueprintGovernanceModule();
  const { marketplaceCompilation } = createMarketplaceCompilationModule();
  const { intelligentPricing } = createIntelligentPricingModule();
  const { intelligentCommission } = createIntelligentCommissionModule();
  const { personalAssistant } = createPersonalAssistantModule();
  const { developMe } = createDevelopMeModule();
  const { learnByAction } = createLearnByActionModule();
  const { expertNetwork } = createExpertNetworkModule();
  const { teamBuilder } = createTeamBuilderModule();
  const { knowledgeBank } = createKnowledgeBankModule();
  const { intelligenceOrchestration } = createIntelligenceOrchestrationModule();
  const { unifiedActionIntelligence } = createUnifiedActionIntelligenceModule();
  const { actionOntology } = createActionOntologyModule();
  const { actionPlanning } = createActionPlanningModule();
  const { dynamicPricing } = createDynamicPricingModule();
  const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();

  return {
    actionBlueprint,
    professionOntology,
    projectDecomposition,
    tekrrIntelligence,
    executionBlueprint,
    blueprintGovernance,
    marketplaceCompilation,
    intelligentPricing,
    intelligentCommission,
    personalAssistant,
    developMe,
    learnByAction,
    expertNetwork,
    teamBuilder,
    knowledgeBank,
    intelligenceOrchestration,
    unifiedActionIntelligence,
    actionOntology,
    actionPlanning,
    dynamicPricing,
    contractIntelligenceEngine,
  };
}

export function bootstrapIntelligenceServices(): Pick<
  IntelligenceDependencies,
  | "actionIntelligence"
  | "requirementIntelligence"
  | "contractIntelligence"
  | "trustIntelligence"
  | "matchingIntelligence"
  | "pricingIntelligence"
  | "negotiationIntelligence"
  | "workflowIntelligence"
  | "providerIntelligence"
> {
  const actionIntelligence = createActionIntelligenceService();
  const requirementIntelligence = createRequirementIntelligenceService();
  const contractIntelligence = createContractIntelligenceService(
    actionIntelligence,
    requirementIntelligence
  );
  const trustIntelligence = createTrustIntelligenceService();
  const matchingIntelligence = createMatchingIntelligenceService();
  const pricingIntelligence = createPricingIntelligenceService();
  const negotiationIntelligence = createNegotiationIntelligenceService();
  const workflowIntelligence = createWorkflowIntelligenceService();
  const providerIntelligence = createProviderIntelligenceService();

  return {
    actionIntelligence,
    requirementIntelligence,
    contractIntelligence,
    trustIntelligence,
    matchingIntelligence,
    pricingIntelligence,
    negotiationIntelligence,
    workflowIntelligence,
    providerIntelligence,
  };
}
