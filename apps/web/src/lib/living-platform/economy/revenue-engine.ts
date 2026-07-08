import type { ContractEconomySignal, PlatformRevenueMetrics } from "../types.js";
import { PLATFORM_FEE_PERCENT } from "../types.js";

export function buildPlatformRevenueMetrics(
  signals: ContractEconomySignal[],
  totalContracts: number,
): PlatformRevenueMetrics {
  const grossContractValue = signals.reduce((sum, signal) => sum + signal.contractValue, 0);
  const platformRevenueEstimate = Math.round(grossContractValue * (PLATFORM_FEE_PERCENT / 100));
  const averageContractValue =
    signals.length > 0 ? Math.round(grossContractValue / signals.length) : 0;

  const timestamps = signals.map((signal) => new Date(signal.completedAt).getTime()).filter(Boolean);
  let contractsPerDay = 0;
  let contractsPerMinute = 0;

  if (timestamps.length >= 2) {
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);
    const daySpan = Math.max(1, (max - min) / (1000 * 60 * 60 * 24));
    contractsPerDay = Math.round((signals.length / daySpan) * 10) / 10;
    contractsPerMinute = Math.round((contractsPerDay / (24 * 60)) * 1000) / 1000;
  } else if (signals.length === 1) {
    contractsPerDay = 1;
    contractsPerMinute = Math.round((1 / (24 * 60)) * 1000) / 1000;
  }

  const economyGrowthIndex = Math.round(
    grossContractValue / 1000 + totalContracts * 4 + platformRevenueEstimate / 10,
  );

  return {
    grossContractValue,
    platformRevenueEstimate,
    averageContractValue,
    contractsPerDay,
    contractsPerMinute,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    economyGrowthIndex,
  };
}
