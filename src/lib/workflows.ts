import {
  ApprovalStatus,
  Prisma,
  TaskStatus,
  WorkflowStatus,
  type WorkflowRun,
  type WorkflowTask,
} from "@prisma/client";
import { canExecuteWithBudget } from "@/lib/providers";
import { prisma } from "@/lib/prisma";
import { phaseOneTaskTemplate } from "@/lib/workflow-template";
import { getNextTransition } from "@/lib/simulation";

const DEMO_ESTIMATED_TASK_COST = 0;

export async function startWorkflowForProject(projectSlug: string) {
  const project = await prisma.project.findUnique({ where: { slug: projectSlug } });
  if (!project) {
    throw new Error("Project not found");
  }

  const agents = await prisma.agent.findMany();
  const providerConfig = await prisma.providerConfig.findUnique({ where: { provider: "ollama" } });

  const budgetCheck = canExecuteWithBudget(
    {
      provider: "ollama",
      enabled: providerConfig?.enabled ?? false,
      perTaskLimitUsd: Number(providerConfig?.perTaskLimitUsd ?? 0),
      dailyLimitUsd: Number(providerConfig?.dailyLimitUsd ?? 0),
      spentTodayUsd: 0,
    },
    DEMO_ESTIMATED_TASK_COST,
  );

  if (!budgetCheck.allowed && providerConfig?.enabled) {
    throw new Error(budgetCheck.reason ?? "Budget restriction");
  }

  const run = await prisma.workflowRun.create({
    data: {
      projectId: project.id,
      name: `${project.name} Phase 1 Simulation`,
      status: WorkflowStatus.QUEUED,
      totalBudgetUsd: new Prisma.Decimal(0),
      maxRetries: 2,
      tasks: {
        create: phaseOneTaskTemplate.map((task, sequence) => {
          const agent = agents.find((candidate) => candidate.role === task.role);
          if (!agent) {
            throw new Error(`Missing agent for role: ${task.role}`);
          }

          return {
            agentId: agent.id,
            title: task.title,
            description: task.description,
            sequence,
            requiresApproval: task.requiresApproval,
            status: TaskStatus.QUEUED,
          };
        }),
      },
      logs: {
        create: {
          level: "info",
          message: "Workflow started in deterministic demo mode.",
          metadata: { simulated: true },
        },
      },
    },
    include: { tasks: true },
  });

  return run;
}

async function queueNextTask(runId: string, completedSequence: number) {
  const nextTask = await prisma.workflowTask.findFirst({
    where: { workflowRunId: runId, sequence: completedSequence + 1 },
  });

  if (!nextTask) {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: WorkflowStatus.COMPLETED, currentStep: completedSequence + 1 },
    });

    await prisma.executionLog.create({
      data: {
        workflowRunId: runId,
        level: "info",
        message: "Workflow completed.",
        metadata: { simulated: true },
      },
    });
    return;
  }

  await prisma.workflowRun.update({
    where: { id: runId },
    data: { status: WorkflowStatus.RUNNING, currentStep: nextTask.sequence },
  });
}

export async function stepWorkflow(runId: string): Promise<WorkflowRun> {
  const run = await prisma.workflowRun.findUnique({
    where: { id: runId },
    include: {
      tasks: true,
      approvals: { where: { status: ApprovalStatus.APPROVED } },
    },
  });

  if (!run) {
    throw new Error("Workflow run not found");
  }

  if (run.status === WorkflowStatus.COMPLETED || run.status === WorkflowStatus.FAILED) {
    return run;
  }

  const approvedTaskIds = new Set(run.approvals.map((approval) => approval.workflowTaskId));
  const transition = getNextTransition(run.tasks, approvedTaskIds);

  if (!transition) {
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: WorkflowStatus.COMPLETED },
    });
    return run;
  }

  if (transition.to === TaskStatus.BLOCKED) {
    await prisma.workflowTask.update({
      where: { id: transition.taskId },
      data: { status: TaskStatus.BLOCKED },
    });

    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: WorkflowStatus.PAUSED, lastFailureReason: "Waiting for human approval." },
    });

    const existingApproval = await prisma.approval.findFirst({
      where: { workflowRunId: runId, workflowTaskId: transition.taskId, status: ApprovalStatus.PENDING },
    });

    if (!existingApproval) {
      await prisma.approval.create({
        data: {
          workflowRunId: runId,
          workflowTaskId: transition.taskId,
          proposedAction: "Open pull request against TaskForge default branch",
          impactSummary: "Would update TaskForge codebase if this were a live run.",
        },
      });
    }

    await prisma.executionLog.create({
      data: {
        workflowRunId: runId,
        level: "warn",
        message: "Workflow paused for approval.",
        metadata: { taskId: transition.taskId },
      },
    });

    return prisma.workflowRun.findUniqueOrThrow({ where: { id: runId } });
  }

  const taskUpdateData: Prisma.WorkflowTaskUpdateInput = {
    status: transition.to,
  };

  if (transition.to === TaskStatus.RUNNING) {
    taskUpdateData.startedAt = new Date();
    await prisma.workflowRun.update({ where: { id: runId }, data: { status: WorkflowStatus.RUNNING } });
  }

  if (transition.to === TaskStatus.COMPLETED) {
    taskUpdateData.completedAt = new Date();
  }

  const updatedTask = await prisma.workflowTask.update({
    where: { id: transition.taskId },
    data: taskUpdateData,
  });

  await prisma.executionLog.create({
    data: {
      workflowRunId: runId,
      level: "info",
      message: `Task transitioned ${transition.from} -> ${transition.to}`,
      metadata: { taskId: transition.taskId },
    },
  });

  if (transition.to === TaskStatus.COMPLETED) {
    await prisma.usageRecord.create({
      data: {
        workflowRunId: runId,
        agentId: updatedTask.agentId,
        provider: "demo",
        model: "simulated-local",
        promptTokens: 180,
        completionTokens: 90,
        estimatedCostUsd: new Prisma.Decimal(0),
      },
    });
    await queueNextTask(runId, updatedTask.sequence);
  }

  return prisma.workflowRun.findUniqueOrThrow({ where: { id: runId } });
}

export async function applyApproval(
  approvalId: string,
  decision: "approve" | "reject",
  decidedBy: string,
): Promise<void> {
  const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
  if (!approval) {
    throw new Error("Approval not found");
  }

  if (approval.status !== ApprovalStatus.PENDING) {
    return;
  }

  const status = decision === "approve" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
  await prisma.approval.update({
    where: { id: approvalId },
    data: { status, decidedBy, decidedAt: new Date() },
  });

  if (decision === "approve") {
    const task = await prisma.workflowTask.update({
      where: { id: approval.workflowTaskId },
      data: { status: TaskStatus.RUNNING },
    });

    await prisma.workflowRun.update({
      where: { id: approval.workflowRunId },
      data: { status: WorkflowStatus.RUNNING, currentStep: task.sequence, lastFailureReason: null },
    });

    await prisma.executionLog.create({
      data: {
        workflowRunId: approval.workflowRunId,
        level: "info",
        message: "Approval granted by human operator.",
        metadata: { approvalId },
      },
    });
    return;
  }

  await prisma.workflowTask.update({
    where: { id: approval.workflowTaskId },
    data: { status: TaskStatus.FAILED },
  });

  await prisma.workflowRun.update({
    where: { id: approval.workflowRunId },
    data: { status: WorkflowStatus.FAILED, lastFailureReason: "Approval rejected" },
  });

  await prisma.executionLog.create({
    data: {
      workflowRunId: approval.workflowRunId,
      level: "error",
      message: "Approval rejected by human operator.",
      metadata: { approvalId },
    },
  });
}

export function summarizeRun(tasks: WorkflowTask[]) {
  return {
    queued: tasks.filter((task) => task.status === TaskStatus.QUEUED).length,
    running: tasks.filter((task) => task.status === TaskStatus.RUNNING).length,
    blocked: tasks.filter((task) => task.status === TaskStatus.BLOCKED).length,
    completed: tasks.filter((task) => task.status === TaskStatus.COMPLETED).length,
    failed: tasks.filter((task) => task.status === TaskStatus.FAILED).length,
  };
}
