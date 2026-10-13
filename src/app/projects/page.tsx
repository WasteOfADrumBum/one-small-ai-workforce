import Link from "next/link";
import { Card, CardBody, CardHeader } from "@onesmall/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { name: "asc" },
    include: {
      workflows: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <div className="osaw-stack">
      <h2>Project Management</h2>
      <div className="osaw-grid">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <h3>
                <Link href={`/projects/${project.slug}`}>{project.name}</Link>
              </h3>
            </CardHeader>
            <CardBody>
              <p>{project.description}</p>
              <p>Repository: {project.repository}</p>
              <p>Jira: {project.jiraUrl}</p>
              <p>Last workflow: {project.workflows[0]?.status ?? "Not started"}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
