import { describe, expect, it } from "vitest";
import { canExecuteWithBudget } from "@/lib/providers";

describe("canExecuteWithBudget", () => {
  it("blocks disabled providers", () => {
    const result = canExecuteWithBudget(
      {
        provider: "openai",
        enabled: false,
        dailyLimitUsd: 0,
        perTaskLimitUsd: 0,
        spentTodayUsd: 0,
      },
      0,
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("disabled");
  });

  it("blocks per-task overages", () => {
    const result = canExecuteWithBudget(
      {
        provider: "ollama",
        enabled: true,
        dailyLimitUsd: 10,
        perTaskLimitUsd: 1,
        spentTodayUsd: 0,
      },
      2,
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("per-task");
  });

  it("allows work within limits", () => {
    const result = canExecuteWithBudget(
      {
        provider: "ollama",
        enabled: true,
        dailyLimitUsd: 5,
        perTaskLimitUsd: 2,
        spentTodayUsd: 1,
      },
      1,
    );

    expect(result).toEqual({ allowed: true });
  });
});
