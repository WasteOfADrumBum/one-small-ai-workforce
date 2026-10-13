"use client";

import { Button } from "@onesmall/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ApprovalControlsProps {
  approvalId: string;
}

export function ApprovalControls({ approvalId }: ApprovalControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const submitDecision = async (decision: "approve" | "reject") => {
    setLoading(true);
    await fetch(`/api/approvals/${approvalId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button onClick={() => submitDecision("approve")} disabled={loading} color="success" size="sm">
        Approve
      </Button>
      <Button onClick={() => submitDecision("reject")} disabled={loading} color="danger" variant="outline" size="sm">
        Reject
      </Button>
    </div>
  );
}
