"use client";

import { useState } from "react";

interface Props {
  venueSlug: string;
  venueName: string;
}

// "Book a free site visit" — the highest-intent lead a venue can get.
export function SiteVisitButton({ venueSlug, venueName }: Props) {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [date, setDate]       = useState("");
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);

  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 6) return;
    setLoading(true);
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "site_visit",
        venue_slug: venueSlug,
        name: name.trim(),
        phone: phone.trim(),
        event_date: date || null,
        message: `Free site visit request for ${venueName}${date ? ` — preferred date ${date}` : ""}`,
      }),
    }).catch(() => {});
    setLoading(false);
    setDone(true);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost"
        style={{ width: "100%", marginTop: 10 }}
      >
        📍 Book a free site visit
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 940, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: "16px 16px 0 0", padding: "24px 20px 32px", boxShadow: "0 -4px 32px rgba(0,0,0,0.12)" }}
          >
            {done ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
                <p style={{ fontSize: 14, color: "#444", lineHeight: 1.5 }}>
                  Visit request sent! The venue team will confirm your slot on WhatsApp.
                </p>
                <button onClick={() => setOpen(false)} className="btn btn-ghost" style={{ marginTop: 12 }}>Close</button>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 6 }}>
                  Free site visit — {venueName}
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
                  Walk the venue before you decide. No charges, no obligation.
                </p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    style={{ padding: "11px 14px", fontSize: 15, border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone / WhatsApp"
                    required
                    style={{ padding: "11px 14px", fontSize: 15, border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}
                  />
                  <div>
                    <label style={{ fontSize: 12, color: "var(--ink-mute)", display: "block", marginBottom: 4 }}>
                      Preferred visit date (optional)
                    </label>
                    <input
                      type="date"
                      min={minDate}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid var(--line)", borderRadius: 10, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }}>
                    {loading ? "Sending…" : "Request my visit"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
