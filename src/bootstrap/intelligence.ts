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
import { createExecutionIntelligenceEngineModule } from "../execution-intelligence/module.js";
import { createOutcomeIntelligenceEngineModule } from "../outcome-intelligence/module.js";
import { createTrustIntelligenceEngineModule } from "../trust-intelligence/module.js";
import { createDecisionIntelligenceEngineModule } from "../decision-intelligence/module.js";
import { createRecommendationIntelligenceEngineModule } from "../recommendation-intelligence/module.js";
import { createInsightIntelligenceEngineModule } from "../insight-intelligence/module.js";
import { createPredictionIntelligenceEngineModule } from "../prediction-intelligence/module.js";
import { createStrategyIntelligenceEngineModule } from "../strategy-intelligence/module.js";
import { createLearningIntelligenceEngineModule } from "../learning-intelligence/module.js";
import { createOptimizationIntelligenceEngineModule } from "../optimization-intelligence/module.js";
import { createEvolutionIntelligenceEngineModule } from "../evolution-intelligence/module.js";
import { createOrchestrationIntelligenceEngineModule } from "../orchestration-intelligence/module.js";
import { createActionIntelligenceExperienceModule } from "../action-intelligence-experience/module.js";
import { createIntelligenceDashboardModule } from "../intelligence-dashboard/module.js";
import { createExecutiveIntelligenceCenterModule } from "../executive-intelligence-center/module.js";
import { createActionIntelligenceCertificationModule } from "../action-intelligence-certification/module.js";
import { createActionIntelligenceFinalClosureModule } from "../action-intelligence-final-closure/module.js";
import { createAiExperienceFoundationModule } from "../ai-experience/module.js";
import { createAiConversationExperienceModule } from "../ai-conversation-experience/module.js";
import { createAiGuidanceExperienceModule } from "../ai-guidance-experience/module.js";
import { createAiDecisionSupportExperienceModule } from "../ai-decision-support-experience/module.js";
import { createAiActionPlanningExperienceModule } from "../ai-action-planning-experience/module.js";
import { createAiExecutionCompanionExperienceModule } from "../ai-execution-companion-experience/module.js";
import { createAiProgressIntelligenceExperienceModule } from "../ai-progress-intelligence-experience/module.js";
import { createAiAdaptiveCoachingExperienceModule } from "../ai-adaptive-coaching-experience/module.js";
import { createAiInsightGenerationExperienceModule } from "../ai-insight-generation-experience/module.js";
import { createAiRecommendationIntelligenceExperienceModule } from "../ai-recommendation-intelligence-experience/module.js";
import { createAiPredictiveIntelligenceExperienceModule } from "../ai-predictive-intelligence-experience/module.js";
import { createAiExecutiveIntelligenceExperienceModule } from "../ai-executive-intelligence-experience/module.js";
import { createAiOrchestrationExperienceModule } from "../ai-orchestration-experience/module.js";
import { createAiDecisionIntelligenceExperienceModule } from "../ai-decision-intelligence-experience/module.js";
import { createAiStrategicIntelligenceExperienceModule } from "../ai-strategic-intelligence-experience/module.js";
import { createAiPredictiveForecastExperienceModule } from "../ai-predictive-forecast-experience/module.js";
import { createAiExecutiveAdvisoryExperienceModule } from "../ai-executive-advisory-experience/module.js";
import { createAiGovernanceAssuranceExperienceModule } from "../ai-governance-assurance-experience/module.js";
import { createAiAccountabilityLedgerExperienceModule } from "../ai-accountability-ledger-experience/module.js";
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
  | "executionIntelligenceEngine"
  | "outcomeIntelligenceEngine"
  | "trustIntelligenceEngine"
  | "decisionIntelligenceEngine"
  | "recommendationIntelligenceEngine"
  | "insightIntelligenceEngine"
  | "predictionIntelligenceEngine"
  | "strategyIntelligenceEngine"
  | "learningIntelligenceEngine"
  | "optimizationIntelligenceEngine"
  | "evolutionIntelligenceEngine"
  | "orchestrationIntelligenceEngine"
  | "actionIntelligenceExperience"
  | "intelligenceDashboard"
  | "executiveIntelligenceCenter"
  | "actionIntelligenceCertification"
  | "actionIntelligenceFinalClosure"
  | "aiExperienceFoundation"
  | "aiConversationExperience"
  | "aiGuidanceExperience"
  | "aiDecisionSupportExperience"
  | "aiActionPlanningExperience"
  | "aiExecutionCompanionExperience"
  | "aiProgressIntelligenceExperience"
  | "aiAdaptiveCoachingExperience"
  | "aiInsightGenerationExperience"
  | "aiRecommendationIntelligenceExperience"
  | "aiPredictiveIntelligenceExperience"
  | "aiExecutiveIntelligenceExperience"
  | "aiOrchestrationExperience"
  | "aiDecisionIntelligenceExperience"
  | "aiStrategicIntelligenceExperience"
  | "aiPredictiveForecastExperience"
  | "aiExecutiveAdvisoryExperience"
  | "aiGovernanceAssuranceExperience"
  | "aiAccountabilityLedgerExperience"
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
  const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
  const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
  const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
  const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
  const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
  const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
  const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
  const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
  const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
  const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
  const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
  const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
  const { actionIntelligenceExperience } = createActionIntelligenceExperienceModule();
  const { intelligenceDashboard } = createIntelligenceDashboardModule();
  const { executiveIntelligenceCenter } = createExecutiveIntelligenceCenterModule();
  const { actionIntelligenceCertification } = createActionIntelligenceCertificationModule({
    executiveIntelligenceCenter,
  });
  const { actionIntelligenceFinalClosure } = createActionIntelligenceFinalClosureModule({
    actionIntelligenceCertification,
  });
  const { aiExperienceFoundation } = createAiExperienceFoundationModule({
    actionIntelligenceFinalClosure,
  });
  const { aiConversationExperience } = createAiConversationExperienceModule({
    aiExperienceFoundation,
  });
  const { aiGuidanceExperience } = createAiGuidanceExperienceModule({
    aiConversationExperience,
  });
  const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule({
    aiGuidanceExperience,
  });
  const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule({
    aiDecisionSupportExperience,
  });
  const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule({
    aiActionPlanningExperience,
  });
  const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule({
    aiExecutionCompanionExperience,
  });
  const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule({
    aiProgressIntelligenceExperience,
  });
  const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule({
    aiAdaptiveCoachingExperience,
  });
  const { aiRecommendationIntelligenceExperience } =
    createAiRecommendationIntelligenceExperienceModule({
      aiInsightGenerationExperience,
    });
  const { aiPredictiveIntelligenceExperience } = createAiPredictiveIntelligenceExperienceModule({
    aiRecommendationIntelligenceExperience,
  });
  const { aiExecutiveIntelligenceExperience } = createAiExecutiveIntelligenceExperienceModule({
    aiPredictiveIntelligenceExperience,
  });
  const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule({
    aiExecutiveIntelligenceExperience,
  });
  const { aiDecisionIntelligenceExperience } = createAiDecisionIntelligenceExperienceModule({
    aiOrchestrationExperience,
  });
  const { aiStrategicIntelligenceExperience } = createAiStrategicIntelligenceExperienceModule({
    aiDecisionIntelligenceExperience,
  });
  const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule({
    aiStrategicIntelligenceExperience,
  });
  const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule({
    aiPredictiveForecastExperience,
  });
  const { aiGovernanceAssuranceExperience } = createAiGovernanceAssuranceExperienceModule({
    aiExecutiveAdvisoryExperience,
  });
  const { aiAccountabilityLedgerExperience } = createAiAccountabilityLedgerExperienceModule({
    aiGovernanceAssuranceExperience,
  });

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
    executionIntelligenceEngine,
    outcomeIntelligenceEngine,
    trustIntelligenceEngine,
    decisionIntelligenceEngine,
    recommendationIntelligenceEngine,
    insightIntelligenceEngine,
    predictionIntelligenceEngine,
    strategyIntelligenceEngine,
    learningIntelligenceEngine,
    optimizationIntelligenceEngine,
    evolutionIntelligenceEngine,
    orchestrationIntelligenceEngine,
    actionIntelligenceExperience,
    intelligenceDashboard,
    executiveIntelligenceCenter,
    actionIntelligenceCertification,
    actionIntelligenceFinalClosure,
    aiExperienceFoundation,
    aiConversationExperience,
    aiGuidanceExperience,
    aiDecisionSupportExperience,
    aiActionPlanningExperience,
    aiExecutionCompanionExperience,
    aiProgressIntelligenceExperience,
    aiAdaptiveCoachingExperience,
    aiInsightGenerationExperience,
    aiRecommendationIntelligenceExperience,
    aiPredictiveIntelligenceExperience,
    aiExecutiveIntelligenceExperience,
    aiOrchestrationExperience,
    aiDecisionIntelligenceExperience,
    aiStrategicIntelligenceExperience,
    aiPredictiveForecastExperience,
    aiExecutiveAdvisoryExperience,
    aiGovernanceAssuranceExperience,
    aiAccountabilityLedgerExperience,
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
