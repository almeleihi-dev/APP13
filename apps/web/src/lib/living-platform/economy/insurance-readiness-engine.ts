import type { ContractEconomySignal, InsuranceReadinessProfile, LivingPlatformState } from "../types.js";

export function buildInsuranceReadinessProfile(
  state: LivingPlatformState,
  signals: ContractEconomySignal[],
): InsuranceReadinessProfile {
  const contracts = state.contracts;
  const completed = contracts.filter((contract) => contract.agreementState === "completed").length;
  const cancelled = contracts.filter((contract) => contract.agreementState === "cancelled").length;
  const total = contracts.length;

  const failureRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
  const disputeFrequency = total > 0 ? Math.round((cancelled / Math.max(completed, 1)) * 100) / 100 : 0;

  const verifiedEvidencePercent =
    signals.length > 0
      ? Math.round((signals.filter((signal) => signal.evidenceConfirmed).length / signals.length) * 100)
      : 0;

  const providerReliability =
    signals.length > 0
      ? Math.round(signals.reduce((sum, signal) => sum + signal.reliabilityScore, 0) / signals.length)
      : 72;

  let overallReadiness = 45;
  overallReadiness += Math.min(25, verifiedEvidencePercent / 4);
  overallReadiness += Math.min(20, providerReliability / 5);
  overallReadiness -= Math.min(20, failureRate);
  overallReadiness = Math.max(10, Math.min(95, Math.round(overallReadiness)));

  let riskLevel: InsuranceReadinessProfile["riskLevel"] = "moderate";
  if (overallReadiness >= 75 && failureRate < 8) riskLevel = "low";
  if (overallReadiness < 50 || failureRate > 20) riskLevel = "elevated";

  const readinessSignals: string[] = [];
  if (verifiedEvidencePercent >= 70) readinessSignals.push("Strong verified evidence baseline");
  if (providerReliability >= 80) readinessSignals.push("Provider reliability supports future underwriting");
  if (failureRate <= 10) readinessSignals.push("Low failure rate observed");
  if (signals.length >= 5) readinessSignals.push("Sufficient contract history for risk modeling");
  if (readinessSignals.length === 0) {
    readinessSignals.push("Collect more completed contracts to strengthen insurance readiness");
  }

  return {
    overallReadiness,
    riskLevel,
    disputeFrequency,
    failureRate,
    verifiedEvidencePercent,
    providerReliability,
    readinessSignals,
  };
}
