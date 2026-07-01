"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PhoneOnboardingPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleaned = phone.replace(/\s/g, "");
    // Basic Indian mobile number validation (10 digits, optionally +91 prefix)
    const valid = /^(\+91)?[6-9]\d{9}$/.test(cleaned);
    if (!valid) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });

      if (!res.ok) {
        setError("Couldn't save your number. Please try again.");
        return;
      }

      // Read redirect target from URL (set by auth callback)
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next") ?? "/dashboard";
      router.push(next);
    });
  }

  function handleSkip() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "/dashboard";
    router.push(next);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    fontSize: 16,
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-sm)",
    background: "#fff",
    color: "var(--ink)",
    boxSizing: "border-box",
    outline: "none",
    letterSpacing: "0.04em",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
      {/* Top bar */}
      <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--line)" }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)" }}>
          Venuees.in
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "color-mix(in srgb, var(--brand) 12%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, marginBottom: 24,
          }}>
            📱
          </div>

          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 30, color: "var(--ink)", marginBottom: 10 }}>
            One last step.
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 32 }}>
            Add your mobile number so venues and vendors can reach you directly — no middleman.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--ink-mute)",
                display: "block", marginBottom: 8,
              }}>
                Mobile number
              </label>
              <div style={{ display: "flex", gap: 0 }}>
                {/* Country prefix */}
                <div style={{
                  display: "flex", alignItems: "center", padding: "12px 14px",
                  background: "var(--surface-tint)", border: "1px solid var(--line)",
                  borderRight: "none", borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
                  fontSize: 15, color: "var(--ink-soft)", whiteSpace: "nowrap",
                  userSelect: "none",
                }}>
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(""); }}
                  placeholder="98765 43210"
                  maxLength={13}
                  style={{ ...inputStyle, borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", flex: 1 }}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", background: "#fff0f0",
                border: "1px solid #fcc", borderRadius: "var(--radius-sm)",
                fontSize: 13, color: "#c00",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? "Saving…" : "Continue →"}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              style={{
                fontSize: 13, color: "var(--ink-mute)", background: "none",
                border: "none", cursor: "pointer", textDecoration: "underline",
                padding: "4px 0", textAlign: "center",
              }}
            >
              Skip for now
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 12, color: "var(--ink-mute)", lineHeight: 1.5 }}>
            Your number is only shared with venues or vendors you enquire with. We never cold-call or sell your data.
          </p>
        </div>
      </div>
    </div>
  );
}
