export type {
  NegotiationAnalyzeInput,
  NegotiationAnalyzeResult,
  NegotiationAnalysisContext,
  NegotiationState,
  RecommendedEscrow,
  RiskProfile,
} from "./types.js";

export {
  calculatePriceGapPercent,
  resolveNegotiationState,
  buildAnalysisContext,
  calculateAgreementProbability,
  calculateRecommendedPrice,
  calculateRecommendedDays,
  resolveRecommendedEscrow,
  buildExplanation,
} from "./negotiation-rule-library.js";

export { generateCompromises } from "./compromise-library.js";

export {
  NegotiationIntelligenceService,
  createNegotiationIntelligenceService,
} from "./negotiation-intelligence-service.js";
