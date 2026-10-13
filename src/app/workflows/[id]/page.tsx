import { notFound } from "next/navigation";
import { Badge, Card, CardBody, CardHeader, Table } from "@onesmall/ui";
import { WorkflowControls } from "@/components/workflow-controls";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface WorkflowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const { id } = await params;
  const run = await prisma.workflowRun.findUnique({
    where: { id },
    include: {
      project: true,
      tasks: { include: { agent: true }, orderBy: { sequence: "asc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      logs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!run) {
    notFound();
  }

  return (
    <div className="osaw-stack">
      <Card>
        <CardHeader>
          <h2>{run.name}</h2>
          <Badge variant="soft">{run.status}</Badge>
        </CardHeader>
        <CardBody>
          <p>Project: {run.project.name}</p>
          <p>Budget: ${Number(run.totalBudgetUsd).toFixed(2)}</p>
          <p>Spent: ${Number(run.spentUsd).toFixed(2)}</p>
          <WorkflowControls projectSlug={run.project.slug} runId={run.id} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Execution timeline</h3>
        </CardHeader>
        <CardBody>
          <Table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Task</th>
                <th>Agent</th>
                <th>Status</th>
                <th>Needs approval</th>
              </tr>
            </thead>
            <tbody>
              {run.tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.sequence + 1}</td>
                  <td>{task.title}</td>
                  <td>{task.agent.name}</td>
                  <td>{task.status}</td>
                  <td>{task.requiresApproval ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Recent logs</h3>
        </CardHeader>
        <CardBody>
          <ul>
            {run.logs.map((log) => (
              <li key={log.id}>
                [{log.level.toUpperCase()}] {log.message}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
