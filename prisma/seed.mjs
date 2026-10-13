import { PrismaClient, AgentStatus } from "@prisma/client";

const prisma = new PrismaClient();

const AGENTS = [
  {
    slug: "chief-of-staff",
    name: "Chief of Staff",
    role: "Chief of Staff",
    status: AgentStatus.AVAILABLE,
    capabilities: ["planning", "delegation", "model-routing", "risk-control"],
    modelPreferences: ["ollama/llama3", "openai/gpt-4.1"],
    permissions: ["read:project", "write:workflow", "request:approval"],
  },
  {
    slug: "researcher",
    name: "Researcher",
    role: "Researcher",
    status: AgentStatus.AVAILABLE,
    capabilities: ["repository-analysis", "requirements-discovery"],
    modelPreferences: ["ollama/mistral"],
    permissions: ["read:repository", "read:issues"],
  },
  {
    slug: "project-manager",
    name: "Project Manager",
    role: "Project Manager",
    status: AgentStatus.AVAILABLE,
    capabilities: ["task-breakdown", "acceptance-criteria", "sprint-planning"],
    modelPreferences: ["ollama/llama3"],
    permissions: ["read:requirements", "write:task"],
  },
  {
    slug: "developer",
    name: "Developer",
    role: "Developer",
    status: AgentStatus.AVAILABLE,
    capabilities: ["implementation", "tests", "pull-requests"],
    modelPreferences: ["ollama/codellama", "openai/gpt-4.1-mini"],
    permissions: ["write:code", "run:tests"],
  },
  {
    slug: "designer",
    name: "Designer",
    role: "Designer",
    status: AgentStatus.AVAILABLE,
    capabilities: ["ui-ux", "accessibility", "design-system"],
    modelPreferences: ["ollama/llama3"],
    permissions: ["write:design", "read:ui"],
  },
  {
    slug: "qa-reviewer",
    name: "QA Reviewer",
    role: "QA/Reviewer",
    status: AgentStatus.AVAILABLE,
    capabilities: ["quality-assurance", "security-review", "accessibility-testing"],
    modelPreferences: ["ollama/llama3"],
    permissions: ["run:tests", "read:code"],
  },
  {
    slug: "documentation-writer",
    name: "Documentation Writer",
    role: "Documentation Writer",
    status: AgentStatus.AVAILABLE,
    capabilities: ["release-notes", "architecture-docs"],
    modelPreferences: ["ollama/mistral"],
    permissions: ["write:docs", "read:code"],
  },
  {
    slug: "analyst",
    name: "Analyst",
    role: "Analyst",
    status: AgentStatus.AVAILABLE,
    capabilities: ["performance-analysis", "cost-analysis", "debt-tracking"],
    modelPreferences: ["ollama/llama3"],
    permissions: ["read:metrics", "write:insights"],
  },
];

async function main() {
  await prisma.project.upsert({
    where: { slug: "taskforge" },
    update: {},
    create: {
      slug: "taskforge",
      name: "TaskForge",
      description: "Primary managed engineering project for One Small AI Workforce.",
      repository: "WasteOfADrumBum/TaskForge",
      jiraUrl: "https://taskforgejms.atlassian.net",
      demoMode: true,
    },
  });

  for (const agent of AGENTS) {
    await prisma.agent.upsert({
      where: { slug: agent.slug },
      update: {
        name: agent.name,
        role: agent.role,
        status: agent.status,
        capabilities: agent.capabilities,
        modelPreferences: agent.modelPreferences,
        permissions: agent.permissions,
      },
      create: agent,
    });
  }

  const providers = ["openai", "anthropic", "azure", "ollama"];
  for (const provider of providers) {
    await prisma.providerConfig.upsert({
      where: { provider },
      update: { enabled: false, dailyLimitUsd: 0, perTaskLimitUsd: 0, budgetExhausted: false },
      create: { provider, enabled: false, dailyLimitUsd: 0, perTaskLimitUsd: 0, budgetExhausted: false },
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
