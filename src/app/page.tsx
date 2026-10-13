import { Badge, Card, CardBody, CardHeader, Table } from "@onesmall/ui";
import { WorkflowControls } from "@/components/workflow-controls";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { project, agents, latestRun, pendingApprovals, usageRecords, providers, statusMap } =
    await getDashboardData();

  const totalCost = usageRecords.reduce((sum, record) => sum + Number(record.estimatedCostUsd), 0);

  return (
    <div className="osaw-stack">
      <Card>
        <CardHeader>
          <h2>Operations Dashboard</h2>
          <p>
            Coordinating specialized simulated agents for <strong>{project?.name ?? "TaskForge"}</strong>.
          </p>
        </CardHeader>
        <CardBody>
          <WorkflowControls projectSlug="taskforge" runId={latestRun?.id} />
        </CardBody>
      </Card>

      <section className="osaw-grid" aria-label="Summary cards">
        <Card>
          <CardHeader>
            <h3>Workflow status</h3>
          </CardHeader>
          <CardBody>
            <p>Queued: {statusMap.QUEUED}</p>
            <p>Running: {statusMap.RUNNING}</p>
            <p>Paused: {statusMap.PAUSED}</p>
            <p>Completed: {statusMap.COMPLETED}</p>
            <p>Failed: {statusMap.FAILED}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h3>Agents</h3>
          </CardHeader>
          <CardBody>
            <p>Total agents: {agents.length}</p>
            <p>Available: {agents.filter((agent) => agent.status === "AVAILABLE").length}</p>
            <p>Busy: {agents.filter((agent) => agent.status === "BUSY").length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h3>Pending approvals</h3>
          </CardHeader>
          <CardBody>
            <p>{pendingApprovals.length} pending human decisions.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h3>Usage overview</h3>
          </CardHeader>
          <CardBody>
            <p>Usage events: {usageRecords.length}</p>
            <p>Estimated spend: ${totalCost.toFixed(2)}</p>
            <Badge color="warning" variant="soft">
              Demo data, no paid provider calls
            </Badge>
          </CardBody>
        </Card>
      </section>

      <section className="osaw-grid">
        <Card>
          <CardHeader>
            <h3>Current workflow</h3>
          </CardHeader>
          <CardBody>
            {latestRun ? (
              <ol>
                {latestRun.tasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong> — {task.status} ({task.agent.name})
                  </li>
                ))}
              </ol>
            ) : (
              <p>No runs yet. Sign in and start a simulation.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3>Provider budget controls</h3>
          </CardHeader>
          <CardBody>
            <Table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Enabled</th>
                  <th>Daily limit</th>
                  <th>Per task</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id}>
                    <td>{provider.provider}</td>
                    <td>{provider.enabled ? "Yes" : "No"}</td>
                    <td>${Number(provider.dailyLimitUsd).toFixed(2)}</td>
                    <td>${Number(provider.perTaskLimitUsd).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
