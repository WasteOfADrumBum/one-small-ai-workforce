CREATE TYPE "AgentStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');
CREATE TYPE "WorkflowStatus" AS ENUM ('QUEUED', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED');
CREATE TYPE "TaskStatus" AS ENUM ('QUEUED', 'RUNNING', 'BLOCKED', 'COMPLETED', 'FAILED');
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "Project" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "repository" TEXT NOT NULL,
  "jiraUrl" TEXT NOT NULL,
  "demoMode" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Agent" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" "AgentStatus" NOT NULL DEFAULT 'AVAILABLE',
  "capabilities" TEXT[] NOT NULL,
  "modelPreferences" TEXT[] NOT NULL,
  "permissions" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "WorkflowRun" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "status" "WorkflowStatus" NOT NULL DEFAULT 'QUEUED',
  "name" TEXT NOT NULL,
  "demoMode" BOOLEAN NOT NULL DEFAULT true,
  "totalBudgetUsd" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "spentUsd" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "maxRetries" INTEGER NOT NULL DEFAULT 2,
  "currentStep" INTEGER NOT NULL DEFAULT 0,
  "lastFailureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkflowRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "WorkflowTask" (
  "id" TEXT PRIMARY KEY,
  "workflowRunId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "status" "TaskStatus" NOT NULL DEFAULT 'QUEUED',
  "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
  "retries" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkflowTask_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WorkflowTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "WorkflowTask_workflowRunId_sequence_key" ON "WorkflowTask"("workflowRunId", "sequence");

CREATE TABLE "Approval" (
  "id" TEXT PRIMARY KEY,
  "workflowRunId" TEXT NOT NULL,
  "workflowTaskId" TEXT NOT NULL,
  "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "proposedAction" TEXT NOT NULL,
  "impactSummary" TEXT NOT NULL,
  "decidedBy" TEXT,
  "decidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Approval_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Approval_workflowTaskId_fkey" FOREIGN KEY ("workflowTaskId") REFERENCES "WorkflowTask"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ExecutionLog" (
  "id" TEXT PRIMARY KEY,
  "workflowRunId" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExecutionLog_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "UsageRecord" (
  "id" TEXT PRIMARY KEY,
  "workflowRunId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "promptTokens" INTEGER NOT NULL,
  "completionTokens" INTEGER NOT NULL,
  "estimatedCostUsd" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageRecord_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UsageRecord_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ProviderConfig" (
  "id" TEXT PRIMARY KEY,
  "provider" TEXT NOT NULL UNIQUE,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "dailyLimitUsd" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "perTaskLimitUsd" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "budgetExhausted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
