import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { stepWorkflow } from "@/lib/workflows";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await context.params;
  const run = await stepWorkflow(id);
  return NextResponse.json({ runId: run.id, status: run.status }, { status: 200 });
}
