"use client";
import { useState } from "react";

export function ProfileForm({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      setState(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={save} style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-mute)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Full name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, boxSizing: "border-box" }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink-mute)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Phone
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          type="tel"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", fontSize: 14, boxSizing: "border-box" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={state === "saving"} style={{ padding: "10px 24px" }}>
          {state === "saving" ? "Saving…" : "Save changes"}
        </button>
        {state === "saved" && <span style={{ fontSize: 13, color: "#16a34a" }}>Saved ✓</span>}
        {state === "error" && <span style={{ fontSize: 13, color: "#dc2626" }}>Something went wrong</span>}
      </div>
    </form>
  );
}
