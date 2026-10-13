import Link from "next/link";
import { Badge, Card, CardBody, CardHeader } from "@onesmall/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    orderBy: { role: "asc" },
    include: {
      assignments: {
        take: 3,
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  return (
    <div className="osaw-stack">
      <h2>Agent Management</h2>
      <p>Directory of specialized agents, capabilities, permissions, and assignment history.</p>
      <div className="osaw-grid">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <h3>
                <Link href={`/agents/${agent.slug}`}>{agent.name}</Link>
              </h3>
              <Badge variant="soft">{agent.role}</Badge>
            </CardHeader>
            <CardBody>
              <p>Status: {agent.status}</p>
              <p>Capabilities: {agent.capabilities.join(", ")}</p>
              <p>Model preference: {agent.modelPreferences.join(", ")}</p>
              <p>Recent assignments: {agent.assignments.length}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
