import { Badge, Card, CardBody, CardHeader, Table } from "@onesmall/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ObservabilityPage() {
  const [usage, logs, providers, workflows] = await Promise.all([
    prisma.usageRecord.findMany({ include: { agent: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.executionLog.findMany({ include: { workflowRun: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.providerConfig.findMany({ orderBy: { provider: "asc" } }),
    prisma.workflowRun.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { tasks: true } }),
  ]);

  const costPerTask =
    usage.length === 0
      ? 0
      : usage.reduce((total, item) => total + Number(item.estimatedCostUsd), 0) /
        Math.max(workflows.reduce((count, run) => count + run.tasks.filter((task) => task.status === "COMPLETED").length, 0), 1);

  return (
    <div className="osaw-stack">
      <h2>Usage and Observability</h2>

      <Card>
        <CardHeader>
          <h3>Budget and providers</h3>
        </CardHeader>
        <CardBody>
          <Table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Enabled</th>
                <th>Daily limit</th>
                <th>Per task limit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id}>
                  <td>{provider.provider}</td>
                  <td>{provider.enabled ? "Yes" : "No"}</td>
                  <td>${Number(provider.dailyLimitUsd).toFixed(2)}</td>
                  <td>${Number(provider.perTaskLimitUsd).toFixed(2)}</td>
                  <td>{provider.budgetExhausted ? "Paused" : "Healthy"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p>Cost per completed task: ${costPerTask.toFixed(2)}</p>
          <Badge variant="soft" color="warning">
            Demo usage is simulated and always non-billable.
          </Badge>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Token usage by agent/model</h3>
        </CardHeader>
        <CardBody>
          <Table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Provider</th>
                <th>Model</th>
                <th>Prompt</th>
                <th>Completion</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((record) => (
                <tr key={record.id}>
                  <td>{record.agent.name}</td>
                  <td>{record.provider}</td>
                  <td>{record.model}</td>
                  <td>{record.promptTokens}</td>
                  <td>{record.completionTokens}</td>
                  <td>${Number(record.estimatedCostUsd).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Execution logs and failures</h3>
        </CardHeader>
        <CardBody>
          <ul>
            {logs.map((log) => (
              <li key={log.id}>
                {log.createdAt.toLocaleString()} — [{log.level.toUpperCase()}] {log.message} ({log.workflowRun.name})
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
