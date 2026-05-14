"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ApplicationActions({ id }: { id: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [note, setNote] = useState("");

  async function act(action: "approve" | "reject") {
    startTransition(async () => {
      await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, note: note || undefined }),
      });
      setShowReject(false);
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
      {!showReject ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => act("approve")}
            disabled={isPending}
            style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", fontWeight: 600 }}
          >
            Approve
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={isPending}
            style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "1px solid #fcc", background: "#fff0f0", color: "#c00", cursor: "pointer", fontWeight: 600 }}
          >
            Reject
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 220 }}>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason (optional)"
            style={{ fontSize: 12, padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 6 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => act("reject")} disabled={isPending} style={{ flex: 1, fontSize: 12, padding: "6px 0", borderRadius: 6, border: "none", background: "#c00", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
              Confirm reject
            </button>
            <button onClick={() => setShowReject(false)} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
