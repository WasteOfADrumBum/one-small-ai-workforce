import { notFound } from "next/navigation";
import { Card, CardBody, CardHeader, Table } from "@onesmall/ui";
import { DemoGitHubAdapter } from "@/lib/integrations/github";
import { DemoJiraAdapter } from "@/lib/integrations/jira";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      workflows: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!project) {
    notFound();
  }

  const githubAdapter = new DemoGitHubAdapter();
  const jiraAdapter = new DemoJiraAdapter();
  const [issues, backlog] = await Promise.all([
    githubAdapter.listOpenIssues(),
    jiraAdapter.listBacklogItems(),
  ]);

  return (
    <div className="osaw-stack">
      <Card>
        <CardHeader>
          <h2>{project.name}</h2>
        </CardHeader>
        <CardBody>
          <p>{project.description}</p>
          <p>Repository adapter target: {project.repository}</p>
          <p>Jira adapter target: {project.jiraUrl}</p>
          <p>Mode: {project.demoMode ? "Demo (read-only simulated)" : "Live"}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Read-only project intelligence (demo)</h3>
        </CardHeader>
        <CardBody>
          <h4>GitHub open issues (simulated)</h4>
          <ul>
            {issues.map((issue) => (
              <li key={issue.id}>
                {issue.id}: {issue.title} ({issue.state})
              </li>
            ))}
          </ul>
          <h4>Jira backlog (simulated)</h4>
          <ul>
            {backlog.map((item) => (
              <li key={item.key}>
                {item.key}: {item.summary} ({item.status})
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3>Workflow history</h3>
        </CardHeader>
        <CardBody>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {project.workflows.map((workflow) => (
                <tr key={workflow.id}>
                  <td>{workflow.name}</td>
                  <td>{workflow.status}</td>
                  <td>{workflow.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
