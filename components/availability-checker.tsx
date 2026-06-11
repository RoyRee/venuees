"use client";

import { useState } from "react";

interface Props {
  venueId: number;
  venueName: string;
  venueSlug: string;
}

export function AvailabilityChecker({ venueId, venueName, venueSlug }: Props) {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "available" | "blocked">("idle");
  const [leadOpen, setLeadOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const minDate = new Date().toISOString().slice(0, 10);

  async function check() {
    if (!date) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/listings/${venueId}/blocked-dates`);
      const { blockedDates } = await res.json() as { blockedDates: string[] };
      setStatus(blockedDates.includes(date) ? "blocked" : "available");
    } catch {
      setStatus("available");
    }
  }

  async function sendEnquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 6) return;
    setLeadLoading(true);
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "availability_check",
        venue_slug: venueSlug,
        name: name.trim(),
        phone: phone.trim(),
        event_date: date,
        message: `Availability check for ${venueName} on ${date}`,
      }),
    }).catch(() => {});
    setLeadLoading(false);
    setLeadSent(true);
  }

  // Suggest nearby available dates (simple: ±3 days from blocked date)
  function nearbySuggestions(): string[] {
    if (!date) return [];
    const base = new Date(date + "T00:00:00");
    const suggestions: string[] = [];
    for (let i = 1; i <= 7 && suggestions.length < 3; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().slice(0, 10);
      if (ds >= minDate) suggestions.push(ds);
    }
    return suggestions;
  }

  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ marginTop: 24, padding: "18px 20px", border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface)" }}>
      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>
        Check availability
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="date"
          min={minDate}
          value={date}
          onChange={(e) => { setDate(e.target.value); setStatus("idle"); }}
          style={{ flex: 1, padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, background: "#fff", color: "var(--ink)", outline: "none" }}
        />
        <button
          type="button"
          onClick={check}
          disabled={!date || status === "loading"}
          style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: (!date || status === "loading") ? "not-allowed" : "pointer", opacity: (!date || status === "loading") ? 0.6 : 1, whiteSpace: "nowrap" }}
        >
          {status === "loading" ? "Checking…" : "Check"}
        </button>
      </div>

      {status === "available" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fff4", borderRadius: 8, border: "1px solid #a6e6b4", fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <div>
              <strong style={{ color: "#1a6630" }}>{fmt(date)} looks free.</strong>
              <div style={{ color: "#2a7a44", marginTop: 2 }}>Enquire below to confirm exact availability and pricing.</div>
            </div>
          </div>

          {!leadSent ? (
            <form onSubmit={sendEnquiry} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
                style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, outline: "none" }} />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" required
                style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, outline: "none" }} />
              <button type="submit" disabled={leadLoading} className="btn btn-primary" style={{ width: "100%" }}>
                {leadLoading ? "Sending…" : "Confirm availability →"}
              </button>
            </form>
          ) : (
            <div style={{ marginTop: 10, padding: "12px 14px", background: "#f0fff4", borderRadius: 8, fontSize: 13, color: "#1a6630" }}>
              Enquiry sent! The venue team will reach out within 2 hours.
            </div>
          )}
        </div>
      )}

      {status === "blocked" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ padding: "10px 14px", background: "#fff0f0", borderRadius: 8, border: "1px solid #fcc", fontSize: 13, color: "#c00" }}>
            This venue is <strong>not available on {fmt(date)}</strong>. Try a nearby date:
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {nearbySuggestions().map((d) => (
              <button key={d} type="button" onClick={() => { setDate(d); setStatus("idle"); }}
                style={{ padding: "7px 14px", borderRadius: 20, border: "1px solid var(--brand)", background: "transparent", color: "var(--brand)", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
