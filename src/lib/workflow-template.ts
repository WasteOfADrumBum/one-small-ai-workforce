import type { TaskContract } from "@/lib/domain";

export const phaseOneTaskTemplate: TaskContract[] = [
  {
    id: "research-context",
    title: "Analyze TaskForge context",
    description: "Review repository metadata and open issues in demo mode.",
    role: "Researcher",
    requiresApproval: false,
  },
  {
    id: "plan-sprint",
    title: "Draft implementation backlog",
    description: "Produce deterministic sprint-ready task cards.",
    role: "Project Manager",
    requiresApproval: false,
    dependsOn: "research-context",
  },
  {
    id: "implement-feature",
    title: "Implement scoped feature",
    description: "Simulate pull request delivery with tests and docs.",
    role: "Developer",
    requiresApproval: true,
    dependsOn: "plan-sprint",
  },
  {
    id: "review-and-qa",
    title: "Run QA, security and accessibility checks",
    description: "Validate quality gates in deterministic demo mode.",
    role: "QA/Reviewer",
    requiresApproval: false,
    dependsOn: "implement-feature",
  },
  {
    id: "document-outcome",
    title: "Publish release notes",
    description: "Summarize outcomes and follow-up improvements.",
    role: "Documentation Writer",
    requiresApproval: false,
    dependsOn: "review-and-qa",
  },
];
