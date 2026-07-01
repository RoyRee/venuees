"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const BUDGETS = ["Under ₹5L", "₹5L – ₹10L", "₹10L – ₹20L", "₹20L+"];

// Exit-intent lead capture — desktop only (mouse moving toward browser chrome).
// Mobile users get the sticky lead bar instead; an exit popup on touch devices
// is unreliable and annoying. Shown at most once per session.
export function ExitIntentPopup() {
  const pathname = usePathname();
  const [show, setShow]       = useState(false);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [budget, setBudget]   = useState(BUDGETS[1]);
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);

  // Never show on dashboard / admin pages
  const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login");
  useEffect(() => {
    if (isDashboard) return;
    if (sessionStorage.getItem("exitIntentShown")) return;
    // Touch devices: skip entirely
    if (window.matchMedia("(pointer: coarse)").matches) return;

    function onMouseLeave(e: MouseEvent) {
      if (e.clientY > 8) return; // only when heading for the tab bar / close button
      if (sessionStorage.getItem("exitIntentShown")) return;
      sessionStorage.setItem("exitIntentShown", "1");
      setShow(true);
    }
    // arm after 10s so quick bounces aren't intercepted
    const timer = setTimeout(() => document.addEventListener("mouseleave", onMouseLeave), 10000);
    return () => { clearTimeout(timer); document.removeEventListener("mouseleave", onMouseLeave); };
  }, []);

  if (!show || isDashboard) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || phone.trim().length < 6) return;
    setLoading(true);
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "exit_intent",
        name: name.trim() || null,
        phone: phone.trim(),
        message: `Budget: ${budget}`,
      }),
    }).catch(() => {});
    setLoading(false);
    setDone(true);
    setTimeout(() => setShow(false), 2500);
  }

  return (
    <div
      onClick={() => setShow(false)}
      style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(20,10,12,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", padding: "32px 28px", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
      >
        <button
          onClick={() => setShow(false)}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", fontSize: 22, lineHeight: 1, color: "#999", cursor: "pointer", padding: 6 }}
        >
          ×
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✓</div>
            <p style={{ fontSize: 15, color: "#444" }}>Thanks! We&rsquo;ll WhatsApp you a venue shortlist shortly.</p>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 8, lineHeight: 1.2 }}>
              Before you go —
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 20, lineHeight: 1.5 }}>
              Tell us your budget and we&rsquo;ll WhatsApp you a shortlist of venues that fit. Takes 30 seconds, no spam.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                style={{ padding: "11px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp number *"
                required
                style={{ padding: "11px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}
              />
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                style={{ padding: "11px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 10, background: "#fff" }}
              >
                {BUDGETS.map((b) => <option key={b}>{b}</option>)}
              </select>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 4 }}>
                {loading ? "Sending…" : "Get my venue shortlist"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
