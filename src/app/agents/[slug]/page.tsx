import { notFound } from "next/navigation";
import { Badge, Card, CardBody, CardHeader, Table } from "@onesmall/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface AgentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { slug } = await params;
  const agent = await prisma.agent.findUnique({
    where: { slug },
    include: {
      assignments: {
        include: { workflowRun: true },
        orderBy: { updatedAt: "desc" },
      },
      usageRecords: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!agent) {
    notFound();
  }

  return (
    <div className="osaw-stack">
      <Card>
        <CardHeader>
          <h2>{agent.name}</h2>
          <Badge variant="soft">{agent.role}</Badge>
        </CardHeader>
        <CardBody>
          <p>Status: {agent.status}</p>
          <p>Capabilities: {agent.capabilities.join(", ")}</p>
          <p>Permissions: {agent.permissions.join(", ")}</p>
          <p>Preferred models: {agent.modelPreferences.join(", ")}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Assignment history</h3>
        </CardHeader>
        <CardBody>
          <Table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Workflow</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {agent.assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.title}</td>
                  <td>{assignment.status}</td>
                  <td>{assignment.workflowRun.name}</td>
                  <td>{assignment.updatedAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
