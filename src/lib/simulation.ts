import { TaskStatus, type WorkflowTask } from "@prisma/client";

export interface SimulationTransition {
  taskId: string;
  from: TaskStatus;
  to: TaskStatus;
  requiresApproval: boolean;
  createApproval: boolean;
}

export function getNextTransition(
  tasks: Pick<WorkflowTask, "id" | "status" | "sequence" | "requiresApproval">[],
  approvedTaskIds: Set<string>,
): SimulationTransition | null {
  const ordered = [...tasks].sort((a, b) => a.sequence - b.sequence);
  const active = ordered.find((task) => task.status === TaskStatus.RUNNING || task.status === TaskStatus.QUEUED);

  if (!active) {
    return null;
  }

  if (active.status === TaskStatus.QUEUED) {
    return {
      taskId: active.id,
      from: TaskStatus.QUEUED,
      to: TaskStatus.RUNNING,
      requiresApproval: active.requiresApproval,
      createApproval: false,
    };
  }

  if (active.requiresApproval && !approvedTaskIds.has(active.id)) {
    return {
      taskId: active.id,
      from: TaskStatus.RUNNING,
      to: TaskStatus.BLOCKED,
      requiresApproval: true,
      createApproval: true,
    };
  }

  return {
    taskId: active.id,
    from: active.status,
    to: TaskStatus.COMPLETED,
    requiresApproval: active.requiresApproval,
    createApproval: false,
  };
}
