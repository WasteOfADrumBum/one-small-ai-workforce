"use client";

import { Button } from "@onesmall/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WorkflowControlsProps {
  projectSlug: string;
  runId?: string;
}

export function WorkflowControls({ projectSlug, runId }: WorkflowControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    await fetch("/api/workflows/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug }),
    });
    setLoading(false);
    router.refresh();
  };

  const step = async () => {
    if (!runId) return;
    setLoading(true);
    await fetch(`/api/workflows/${runId}/step`, { method: "POST" });
    setLoading(false);
    router.refresh();
  };

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button onClick={start} loading={loading} color="primary">
        Start Simulated Workflow
      </Button>
      <Button onClick={step} disabled={!runId || loading} variant="outline">
        Advance One Step
      </Button>
    </div>
  );
}
