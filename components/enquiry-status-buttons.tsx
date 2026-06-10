"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  { value: "new",                   label: "New",             bg: "#fff8e8", color: "var(--accent)" },
  { value: "contacted",             label: "Contacted",       bg: "#e8f4ff", color: "#0066cc" },
  { value: "site_visit_scheduled",  label: "Site visit",      bg: "#edf9ed", color: "#1a7f37" },
  { value: "closed_won",            label: "Won",             bg: "#e8fff0", color: "#087f23" },
  { value: "closed_lost",           label: "Lost",            bg: "#f0f0f0", color: "var(--ink-mute)" },
] as const;

type StatusValue = typeof STATUSES[number]["value"];

interface Props {
  enquiryId: number;
  currentStatus: string;
}

export function EnquiryStatusButtons({ enquiryId, currentStatus }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function setStatus(status: StatusValue) {
    if (status === currentStatus || pending) return;
    setPending(true);
    await fetch(`/api/enquiries/${enquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
    setPending(false);
  }

  const current = STATUSES.find((s) => s.value === currentStatus) ?? STATUSES[0];

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", background: current.bg, color: current.color }}>
        {current.label}
      </span>
      <div style={{ position: "relative", display: "inline-block" }}>
        <select
          disabled={pending}
          value={currentStatus}
          onChange={(e) => setStatus(e.target.value as StatusValue)}
          style={{ fontSize: 12, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-soft)", cursor: "pointer", appearance: "auto" }}
          aria-label="Update status"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
