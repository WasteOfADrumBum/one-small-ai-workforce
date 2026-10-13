import Link from "next/link";
import { Badge, Card, CardBody, Table } from "@onesmall/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const runs = await prisma.workflowRun.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: true,
      tasks: true,
      approvals: true,
    },
  });

  return (
    <div className="osaw-stack">
      <h2>Workflow Management</h2>
      <Card>
        <CardBody>
          <Table>
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Project</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Pending approvals</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>
                    <Link href={`/workflows/${run.id}`}>{run.name}</Link>
                  </td>
                  <td>{run.project.name}</td>
                  <td>
                    <Badge variant="soft">{run.status}</Badge>
                  </td>
                  <td>{run.tasks.length}</td>
                  <td>{run.approvals.filter((approval) => approval.status === "PENDING").length}</td>
                  <td>{run.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
