import { TaskStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getNextTransition } from "@/lib/simulation";

describe("getNextTransition", () => {
  it("starts the next queued task", () => {
    const transition = getNextTransition(
      [
        { id: "a", status: TaskStatus.QUEUED, sequence: 0, requiresApproval: false },
        { id: "b", status: TaskStatus.QUEUED, sequence: 1, requiresApproval: false },
      ],
      new Set(),
    );

    expect(transition).toEqual({
      taskId: "a",
      from: TaskStatus.QUEUED,
      to: TaskStatus.RUNNING,
      requiresApproval: false,
      createApproval: false,
    });
  });

  it("blocks when approval is required and not granted", () => {
    const transition = getNextTransition(
      [{ id: "a", status: TaskStatus.RUNNING, sequence: 0, requiresApproval: true }],
      new Set(),
    );

    expect(transition?.to).toBe(TaskStatus.BLOCKED);
    expect(transition?.createApproval).toBe(true);
  });

  it("completes approved running task", () => {
    const transition = getNextTransition(
      [{ id: "a", status: TaskStatus.RUNNING, sequence: 0, requiresApproval: true }],
      new Set(["a"]),
    );

    expect(transition?.to).toBe(TaskStatus.COMPLETED);
  });
});
