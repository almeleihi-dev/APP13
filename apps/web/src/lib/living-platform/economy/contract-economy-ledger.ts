import type {
  ActionContract,
  ContractEconomyLedger,
  ContractEconomyScope,
  ContractEconomySignal,
  LivingPlatformState,
} from "../types.js";
import {
  appendLivingActivity,
  createLivingId,
  nowIso,
  patchLivingPlatformState,
} from "../living-platform-storage.js";
import {
  contractEconomyScope,
  estimateContractValue,
  evidenceQualityScore,
  executionDaysForContract,
  resolveActionCategory,
} from "./action-category.js";

function reliabilityForContract(contract: ActionContract): number {
  let score = 70;
  if (contract.agreementState === "completed") score += 15;
  if (contract.evidence.some((item) => item.status === "confirmed")) score += 10;
  if (contract.executionState === "completed") score += 5;
  return Math.min(98, score);
}

export function buildContractEconomySignal(
  contract: ActionContract,
  state: LivingPlatformState,
): ContractEconomySignal {
  const category = resolveActionCategory(contract.actionDetails.name);
  return {
    signalId: createLivingId("sig"),
    contractId: contract.contractId,
    actionCategory: category.category,
    actionName: contract.actionDetails.name,
    scope: contractEconomyScope(contract),
    contractValue: estimateContractValue(contract, state),
    executionDays: executionDaysForContract(contract),
    evidenceConfirmed: contract.evidence.some((item) => item.status === "confirmed"),
    evidenceQuality: evidenceQualityScore(contract),
    providerPassportKey: contract.actionOwner.passportKey,
    requesterPassportKey: contract.requester.passportKey,
    reliabilityScore: reliabilityForContract(contract),
    completedAt: contract.completedAt ?? nowIso(),
  };
}

export function recordContractEconomySignal(contract: ActionContract): ContractEconomySignal | null {
  if (contract.agreementState !== "completed") return null;

  let signal: ContractEconomySignal | null = null;
  patchLivingPlatformState((state) => {
    if (state.economySignals.some((item) => item.contractId === contract.contractId)) {
      signal = state.economySignals.find((item) => item.contractId === contract.contractId) ?? null;
      return state;
    }

    signal = buildContractEconomySignal(contract, state);
    return appendLivingActivity(
      { ...state, economySignals: [signal, ...state.economySignals].slice(0, 500) },
      {
        kind: "economy",
        title: "Economy signal recorded",
        detail: `${signal.actionCategory} · $${signal.contractValue}`,
      },
    );
  });

  return signal;
}

export function buildContractEconomyLedger(state: LivingPlatformState): ContractEconomyLedger {
  const contracts = state.contracts;
  const completed = contracts.filter((contract) => contract.agreementState === "completed");
  const active = contracts.filter(
    (contract) => contract.agreementState === "accepted" || contract.agreementState === "pending_acceptance",
  );
  const failedCancelled = contracts.filter(
    (contract) => contract.agreementState === "cancelled",
  );

  const signals = state.economySignals;
  const completedValue = signals.reduce((sum, signal) => sum + signal.contractValue, 0);
  const totalValue = contracts.reduce(
    (sum, contract) => sum + estimateContractValue(contract, state),
    0,
  );

  const executionDays = signals.map((signal) => signal.executionDays);
  const averageExecutionDays =
    executionDays.length > 0
      ? Math.round(executionDays.reduce((a, b) => a + b, 0) / executionDays.length)
      : 0;

  const evidenceConfirmedCount = signals.filter((signal) => signal.evidenceConfirmed).length;
  const evidenceConfirmationRate =
    signals.length > 0 ? Math.round((evidenceConfirmedCount / signals.length) * 100) : 0;

  const byScope: Record<ContractEconomyScope, number> = {
    individual: 0,
    team: 0,
    project: 0,
  };
  for (const signal of signals) {
    byScope[signal.scope] += 1;
  }

  return {
    totalCreated: contracts.length,
    active: active.length,
    completed: completed.length,
    failedCancelled: failedCancelled.length,
    totalContractValue: totalValue,
    completedContractValue: completedValue,
    completionRate:
      contracts.length > 0 ? Math.round((completed.length / contracts.length) * 100) : 0,
    averageExecutionDays,
    evidenceConfirmationRate,
    byScope,
  };
}

export function mergeSignalsWithContracts(state: LivingPlatformState): ContractEconomySignal[] {
  const existing = new Map(state.economySignals.map((signal) => [signal.contractId, signal]));
  const merged: ContractEconomySignal[] = [...state.economySignals];

  for (const contract of state.contracts) {
    if (contract.agreementState !== "completed") continue;
    if (existing.has(contract.contractId)) continue;
    merged.push(buildContractEconomySignal(contract, state));
  }

  return merged;
}
