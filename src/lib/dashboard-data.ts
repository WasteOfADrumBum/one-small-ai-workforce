import { ApprovalStatus, WorkflowStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [project, agents, latestRun, pendingApprovals, usageRecords, providers] = await Promise.all([
    prisma.project.findUnique({ where: { slug: "taskforge" } }),
    prisma.agent.findMany({ orderBy: { name: "asc" } }),
    prisma.workflowRun.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        tasks: { include: { agent: true }, orderBy: { sequence: "asc" } },
        logs: { orderBy: { createdAt: "desc" }, take: 8 },
      },
    }),
    prisma.approval.findMany({
      where: { status: ApprovalStatus.PENDING },
      include: { workflowTask: true, workflowRun: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.usageRecord.findMany({ include: { agent: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.providerConfig.findMany({ orderBy: { provider: "asc" } }),
  ]);

  const workflowCounts = await prisma.workflowRun.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const statusMap: Record<WorkflowStatus, number> = {
    QUEUED: 0,
    RUNNING: 0,
    PAUSED: 0,
    COMPLETED: 0,
    FAILED: 0,
  };

  for (const item of workflowCounts) {
    statusMap[item.status] = item._count._all;
  }

  return {
    project,
    agents,
    latestRun,
    pendingApprovals,
    usageRecords,
    providers,
    statusMap,
  };
}
