"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Entry lead capture — shown to users a few seconds after they land on the site.
// Shown at most once per session to avoid annoying the user.
export function EntryPopup() {
  const pathname = usePathname();
  const [show, setShow]       = useState(false);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);

  // Never show on dashboard / admin pages or login
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login");
  
  useEffect(() => {
    if (isDashboard) return;
    if (sessionStorage.getItem("entryPopupShown")) return;

    // Show popup 3 seconds after landing
    const timer = setTimeout(() => {
      if (sessionStorage.getItem("entryPopupShown")) return;
      sessionStorage.setItem("entryPopupShown", "1");
      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDashboard]);

  if (!show || isDashboard) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || phone.trim().length < 6) return;
    setLoading(true);
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "entry_lead",
        name: name.trim() || null,
        phone: phone.trim(),
        message: "Entry lead popup submission",
      }),
    }).catch(() => {});
    setLoading(false);
    setDone(true);
    setTimeout(() => setShow(false), 2500);
  }

  return (
    <div
      onClick={() => setShow(false)}
      style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(20,10,12,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", padding: "32px 28px", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
      >
        <button
          onClick={() => setShow(false)}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 24, lineHeight: 1, color: "#999", cursor: "pointer", padding: 6 }}
        >
          &times;
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10, color: "var(--brand)" }}>✓</div>
            <p style={{ fontSize: 16, color: "#444", fontWeight: 500 }}>Thanks!</p>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 6 }}>We'll get in touch with you shortly.</p>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 8, lineHeight: 1.2 }}>
              Welcome to venuees.in
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 24, lineHeight: 1.5 }}>
              Planning an event? Share your number and our experts will help you find the perfect venue.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number *"
                required
                style={{ padding: "12px 14px", fontSize: 15, border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                style={{ padding: "12px 14px", fontSize: 15, border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}
              />
              <button
                type="submit"
                disabled={loading || phone.trim().length < 6}
                style={{
                  background: "var(--brand)", color: "#fff", border: "none", borderRadius: 10,
                  padding: "12px", fontSize: 15, fontWeight: 600, cursor: loading || phone.trim().length < 6 ? "not-allowed" : "pointer",
                  marginTop: 8, opacity: loading || phone.trim().length < 6 ? 0.7 : 1, transition: "opacity 0.2s"
                }}
              >
                {loading ? "Submitting..." : "Get Free Expert Help"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
