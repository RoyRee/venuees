"use client";

import { useState } from "react";

interface Props {
  venueId: number;
  venueName: string;
  venueSlug: string;
}

export function AvailabilityChecker({ venueId, venueName, venueSlug }: Props) {
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "collect_info" | "loading" | "available" | "blocked">("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const minDate = new Date().toISOString().slice(0, 10);

  async function proceedToCheck(e?: React.FormEvent, checkDate?: string) {
    if (e) e.preventDefault();
    if (!name.trim() || phone.trim().length < 6) return;
    
    const targetDate = checkDate || date;
    if (!targetDate) return;

    setStatus("loading");
    setLeadLoading(true);

    try {
      const res = await fetch(`/api/listings/${venueId}/blocked-dates`);
      const { blockedDates } = await res.json() as { blockedDates: string[] };
      const isBlocked = blockedDates.includes(targetDate);
      setStatus(isBlocked ? "blocked" : "available");

      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "availability_check",
          venue_slug: venueSlug,
          name: name.trim(),
          phone: phone.trim(),
          event_date: targetDate,
          message: `Availability check for ${venueName} on ${targetDate}. Result: ${isBlocked ? "Blocked" : "Available"}`,
        }),
      }).catch(() => {});
      setLeadSent(true);
    } catch {
      setStatus("available");
    } finally {
      setLeadLoading(false);
    }
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
          onChange={(e) => { setDate(e.target.value); setStatus("idle"); setLeadSent(false); }}
          style={{ flex: 1, padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, background: "#fff", color: "var(--ink)", outline: "none" }}
        />
        {status !== "collect_info" && (
          <button
            type="button"
            onClick={() => {
              if (!date) return;
              if (name && phone) proceedToCheck();
              else setStatus("collect_info");
            }}
            disabled={!date || status === "loading"}
            style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: (!date || status === "loading") ? "not-allowed" : "pointer", opacity: (!date || status === "loading") ? 0.6 : 1, whiteSpace: "nowrap" }}
          >
            {status === "loading" ? "Checking…" : "Check"}
          </button>
        )}
      </div>

      {status === "collect_info" && (
        <form onSubmit={proceedToCheck} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
            style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, outline: "none" }} />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" required
            style={{ padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, outline: "none" }} />
          <button type="submit" disabled={leadLoading} className="btn btn-primary" style={{ width: "100%" }}>
            {leadLoading ? "Checking…" : "Show Availability"}
          </button>
        </form>
      )}

      {status === "available" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fff4", borderRadius: 8, border: "1px solid #a6e6b4", fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <div>
              <strong style={{ color: "#1a6630" }}>{fmt(date)} looks free.</strong>
              <div style={{ color: "#2a7a44", marginTop: 2 }}>We have received your enquiry. The venue team will reach out within 2 hours.</div>
            </div>
          </div>
        </div>
      )}

      {status === "blocked" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ padding: "10px 14px", background: "#fff0f0", borderRadius: 8, border: "1px solid #fcc", fontSize: 13, color: "#c00" }}>
            This venue is <strong>not available on {fmt(date)}</strong>. Try a nearby date:
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {nearbySuggestions().map((d) => (
              <button key={d} type="button" onClick={() => { setDate(d); proceedToCheck(undefined, d); }}
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
