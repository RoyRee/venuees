"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ToggleFlagshipButton({ id, isSignature }: { id: number; isSignature: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [flagship, setFlagship] = useState(isSignature);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch("/api/listings/toggle-flagship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const { isSignature: next } = await res.json();
        setFlagship(next);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={flagship ? "Remove from flagship" : "Mark as flagship"}
      style={{
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 6,
        border: `1px solid ${flagship ? "var(--brand)" : "var(--line)"}`,
        background: flagship ? "var(--brand)" : "transparent",
        color: flagship ? "#fff" : "var(--ink-mute)",
        cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.5 : 1,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {busy ? "…" : flagship ? "★ Flagship" : "☆ Flagship"}
    </button>
  );
}

export function ToggleActiveButton({
  id,
  type,
  isActive,
}: {
  id: number;
  type: "venue" | "vendor";
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(isActive);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch("/api/listings/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type }),
      });
      if (res.ok) {
        const { isActive: next } = await res.json();
        setActive(next);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        fontSize: 12,
        padding: "4px 12px",
        borderRadius: 6,
        border: `1px solid ${active ? "#c00" : "#060"}`,
        background: "transparent",
        color: active ? "#c00" : "#060",
        cursor: busy ? "not-allowed" : "pointer",
        opacity: busy ? 0.5 : 1,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {busy ? "…" : active ? "Disable" : "Enable"}
    </button>
  );
}
