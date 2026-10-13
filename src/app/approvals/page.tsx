import { Card, CardBody, Table } from "@onesmall/ui";
import { ApprovalControls } from "@/components/approval-controls";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const approvals = await prisma.approval.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      workflowRun: true,
      workflowTask: true,
    },
  });

  return (
    <div className="osaw-stack">
      <h2>Approval Center</h2>
      <Card>
        <CardBody>
          <Table>
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Task</th>
                <th>Proposed action</th>
                <th>Impact</th>
                <th>Status</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((approval) => (
                <tr key={approval.id}>
                  <td>{approval.workflowRun.name}</td>
                  <td>{approval.workflowTask.title}</td>
                  <td>{approval.proposedAction}</td>
                  <td>{approval.impactSummary}</td>
                  <td>{approval.status}</td>
                  <td>
                    {approval.status === "PENDING" ? (
                      <ApprovalControls approvalId={approval.id} />
                    ) : (
                      `${approval.status} by ${approval.decidedBy ?? "unknown"}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
