"use client";
import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p style={{ fontSize: 13, color: "var(--brand)", marginTop: 12 }}>You&rsquo;re in. We&rsquo;ll be in touch.</p>;
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 16 }}>
      <p style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 8 }}>Venue tips &amp; real wedding stories — monthly.</p>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 13, minWidth: 0 }}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={state === "loading"} style={{ flexShrink: 0 }}>
          {state === "loading" ? "…" : "Subscribe"}
        </button>
      </div>
      {state === "error" && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>Something went wrong — try again.</p>}
    </form>
  );
}
