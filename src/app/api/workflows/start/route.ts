import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { startWorkflowForProject } from "@/lib/workflows";

const schema = z.object({
  projectSlug: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = schema.parse(await request.json());
  const run = await startWorkflowForProject(body.projectSlug);
  return NextResponse.json({ runId: run.id }, { status: 201 });
}
