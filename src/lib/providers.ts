import type { ProviderName } from "@/lib/domain";

export interface ProviderBudgetConfig {
  provider: ProviderName;
  enabled: boolean;
  perTaskLimitUsd: number;
  dailyLimitUsd: number;
  spentTodayUsd: number;
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
}

export function canExecuteWithBudget(
  config: ProviderBudgetConfig,
  estimatedTaskCostUsd: number,
): BudgetCheckResult {
  if (!config.enabled) {
    return { allowed: false, reason: `${config.provider} is disabled` };
  }

  if (estimatedTaskCostUsd > config.perTaskLimitUsd) {
    return {
      allowed: false,
      reason: `Estimated cost $${estimatedTaskCostUsd.toFixed(2)} exceeds per-task limit`,
    };
  }

  if (config.spentTodayUsd + estimatedTaskCostUsd > config.dailyLimitUsd) {
    return { allowed: false, reason: "Daily budget exhausted" };
  }

  return { allowed: true };
}

export const defaultProviderConfigs: ProviderBudgetConfig[] = [
  { provider: "openai", enabled: false, perTaskLimitUsd: 0, dailyLimitUsd: 0, spentTodayUsd: 0 },
  { provider: "anthropic", enabled: false, perTaskLimitUsd: 0, dailyLimitUsd: 0, spentTodayUsd: 0 },
  { provider: "azure", enabled: false, perTaskLimitUsd: 0, dailyLimitUsd: 0, spentTodayUsd: 0 },
  { provider: "ollama", enabled: false, perTaskLimitUsd: 0, dailyLimitUsd: 0, spentTodayUsd: 0 },
];
