import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { applyApproval } from "@/lib/workflows";

const schema = z.object({
  decision: z.enum(["approve", "reject"]),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = schema.parse(await request.json());
  const { id } = await context.params;

  await applyApproval(id, body.decision, session.user?.email ?? "unknown@onesmall.company");
  return NextResponse.json({ ok: true }, { status: 200 });
}
