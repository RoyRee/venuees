"use client";

import { useEffect, useState } from "react";

interface Props {
  venueSlug?: string;
  venueName?: string;
}

// Appears after the visitor scrolls 60% of the page — they've shown interest.
// One tap opens a 2-field bottom sheet. Dismissal is remembered per session.
export function StickyLeadBar({ venueSlug, venueName }: Props) {
  const [visible, setVisible]   = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [done, setDone]         = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("leadBarDismissed")) return;
    function onScroll() {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled > 0.6) setVisible(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function dismiss() {
    sessionStorage.setItem("leadBarDismissed", "1");
    setVisible(false);
    setSheetOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 6) return;
    setLoading(true);
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "price_request",
        venue_slug: venueSlug ?? null,
        name: name.trim(),
        phone: phone.trim(),
        message: venueName ? `Exact pricing request for ${venueName}` : "Exact pricing request from listing page",
      }),
    }).catch(() => {});
    setLoading(false);
    setDone(true);
    setTimeout(dismiss, 2500);
  }

  if (!visible) return null;

  return (
    <>
      {/* Bar */}
      {!sheetOpen && (
        <div style={{
          position: "fixed", bottom: 64, left: 12, right: 12, zIndex: 890,
          maxWidth: 560, margin: "0 auto",
          background: "var(--ink, #2b2226)", color: "#fff",
          borderRadius: 14, padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}>
          <span style={{ fontSize: 13.5, flex: 1, lineHeight: 1.35 }}>
            Liked {venueName ? <strong>{venueName}</strong> : "a venue"}? Get exact pricing &amp; availability.
          </span>
          <button
            onClick={() => setSheetOpen(true)}
            style={{ background: "var(--brand, #C15A74)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Get pricing
          </button>
          <button onClick={dismiss} aria-label="Dismiss" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 18, cursor: "pointer", padding: 2, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Bottom sheet */}
      {sheetOpen && (
        <div onClick={() => setSheetOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 940, background: "rgba(0,0,0,0.35)" }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 560, margin: "0 auto", background: "#fff", borderRadius: "16px 16px 0 0", padding: "24px 20px 32px", boxShadow: "0 -4px 32px rgba(0,0,0,0.12)" }}
          >
            {done ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
                <p style={{ fontSize: 14, color: "#444" }}>Done! We&rsquo;ll call or WhatsApp you with exact pricing within 2 hours.</p>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 6 }}>
                  Exact pricing &amp; availability
                </div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
                  {venueName ? `For ${venueName} — ` : ""}We&rsquo;ll reply on WhatsApp within 2 hours.
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
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }}>
                    {loading ? "Sending…" : "Send me the pricing"}
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
