"use client";
import { useState } from "react";
import type { SiteContent } from "@/lib/site-config";

type Props = { initialContent: SiteContent };

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  border: "1px solid var(--line)", borderRadius: 8,
  fontSize: 13, color: "var(--ink)", background: "var(--surface)",
  boxSizing: "border-box", outline: "none",
};

const SPEED_OPTIONS = [
  { label: "3 seconds", value: 3000 },
  { label: "5 seconds", value: 5000 },
  { label: "7 seconds", value: 7000 },
  { label: "10 seconds", value: 10000 },
];

const FLAGSHIP_SPEED_OPTIONS = [
  { label: "4 seconds", value: 4000 },
  { label: "6 seconds", value: 6000 },
  { label: "8 seconds", value: 8000 },
];

export function ContentForm({ initialContent }: Props) {
  const [heroImages, setHeroImages]       = useState(initialContent.hero_images.join("\n"));
  const [heroInterval, setHeroInterval]   = useState(initialContent.hero_carousel_interval);
  const [stats, setStats]                 = useState(initialContent.hero_stats);
  const [flagshipInterval, setFlagshipInterval] = useState(initialContent.flagship_carousel_interval);
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [error, setError]                 = useState("");

  function updateStat(i: number, field: "num" | "label", val: string) {
    setStats((s) => s.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const images = heroImages.split("\n").map((l) => l.trim()).filter(Boolean);
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_images:                JSON.stringify(images),
          hero_carousel_interval:     String(heroInterval),
          hero_stats:                 JSON.stringify(stats),
          flagship_carousel_interval: String(flagshipInterval),
        }),
      });
      const json = await res.json();
      if (json.ok) setSaved(true);
      else setError("Failed to save. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const card: React.CSSProperties = {
    background: "var(--surface-tint)", borderRadius: 12,
    padding: 24, marginBottom: 20,
  };

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 6 }}>
        Homepage Content
      </h2>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 28 }}>
        Edit hero images, trust-banner stats, and carousel timing.
      </p>

      {/* Hero Images */}
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Hero Images</h3>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
          One full image URL per line. Images rotate automatically.
        </p>
        <textarea
          value={heroImages}
          onChange={(e) => setHeroImages(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
          placeholder="https://images.unsplash.com/photo-..."
        />
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>Carousel speed</label>
          <select
            value={heroInterval}
            onChange={(e) => setHeroInterval(Number(e.target.value))}
            style={{ ...inputStyle, width: "auto" }}
          >
            {SPEED_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trust Stats */}
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Trust Banner Stats</h3>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
          The five statistics shown below the hero search box.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 10 }}>
              <input
                value={stat.num}
                onChange={(e) => updateStat(i, "num", e.target.value)}
                placeholder="42"
                style={inputStyle}
              />
              <input
                value={stat.label}
                onChange={(e) => updateStat(i, "label", e.target.value)}
                placeholder="Handpicked venues"
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Flagship Speed */}
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Flagship Carousel Speed</h3>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14 }}>
          How quickly the flagship strip cycles when multiple venues are flagged as signature.
        </p>
        <select
          value={flagshipInterval}
          onChange={(e) => setFlagshipInterval(Number(e.target.value))}
          style={{ ...inputStyle, width: "auto" }}
        >
          {FLAGSHIP_SPEED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: "#c00", padding: "10px 14px", background: "#fff0f0", borderRadius: 8, marginBottom: 14 }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ fontSize: 13, color: "#166534", padding: "10px 14px", background: "#f0fdf4", borderRadius: 8, marginBottom: 14 }}>
          Saved — changes will appear on the homepage after the next page load.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary"
        style={{ opacity: saving ? 0.7 : 1 }}
      >
        {saving ? "Saving…" : "Save content"}
      </button>
    </div>
  );
}
