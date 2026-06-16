"use client";
import { useState } from "react";
import { I } from "./icons";

type AlertType = "dates" | "price";

export function PriceAlertWidget({ venueSlug, venueName }: { venueSlug: string; venueName: string }) {
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>("dates");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "price_alert",
        venueSlug,
        email,
        phone,
        message: alertType === "dates"
          ? `Alert requested: notify when new dates open at ${venueName}`
          : `Alert requested: notify if price drops at ${venueName}`,
      }),
    }).catch(() => {});
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div style={{ marginTop: 12, padding: "12px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0", fontSize: 13, color: "#166534" }}>
        <b>You&rsquo;re on the list.</b> We&rsquo;ll notify you the moment {alertType === "dates" ? "a date opens" : "the price changes"}.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px dashed var(--line)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "border-color 0.15s, color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink-soft)"; }}
        >
          <I.Flame width={13} height={13} />
          Notify me when dates open or price drops
        </button>
      ) : (
        <div style={{ padding: "14px", borderRadius: 10, border: "1px solid var(--line-soft)", background: "var(--surface-tint)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Set alert</div>

          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {(["dates", "price"] as AlertType[]).map((t) => (
              <button
                key={t}
                onClick={() => setAlertType(t)}
                style={{ flex: 1, padding: "7px 8px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", border: alertType === t ? "1.5px solid var(--brand)" : "1px solid var(--line)", background: alertType === t ? "var(--brand)" : "transparent", color: alertType === t ? "#fff" : "var(--ink-soft)", transition: "all 0.15s" }}
              >
                {t === "dates" ? "📅 Dates open" : "📉 Price drops"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, width: "100%", boxSizing: "border-box" }}
            />
            <input
              required value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 phone (for WhatsApp alert)"
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "10px", fontSize: 13 }} disabled={loading}>
                {loading ? "Setting alert…" : "Notify me"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </form>
          <p style={{ fontSize: 11, color: "var(--ink-mute)", textAlign: "center", marginTop: 8 }}>No spam. One alert, then we stop.</p>
        </div>
      )}
    </div>
  );
}
