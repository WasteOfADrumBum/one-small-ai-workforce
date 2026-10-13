export const AGENT_ROLES = [
  "Chief of Staff",
  "Researcher",
  "Project Manager",
  "Developer",
  "Designer",
  "QA/Reviewer",
  "Documentation Writer",
  "Analyst",
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

export type ProviderName = "openai" | "anthropic" | "ollama" | "azure";

export interface ModelRoutingRule {
  complexity: "low" | "medium" | "high";
  preferredProvider: ProviderName;
  model: string;
}

export interface BudgetPolicy {
  perTaskUsd: number;
  dailyCapUsd: number;
  maxRetries: number;
}

export interface TaskContract {
  id: string;
  title: string;
  description: string;
  role: AgentRole;
  requiresApproval: boolean;
  dependsOn?: string;
}

export interface ApprovalContract {
  proposedAction: string;
  impactSummary: string;
}
