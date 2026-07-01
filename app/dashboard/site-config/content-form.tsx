"use client";
import { useState, useRef } from "react";
import type { SiteContent } from "@/lib/site-config";

type Props = {
  initialContent: SiteContent;
  onContentChange: (content: SiteContent) => void;
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

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  border: "1px solid var(--line)", borderRadius: 8,
  fontSize: 13, color: "var(--ink)", background: "var(--surface)",
  boxSizing: "border-box", outline: "none",
};
const card: React.CSSProperties = {
  background: "var(--surface-tint)", borderRadius: 12,
  padding: 24, marginBottom: 20,
};

// ── Image manager ─────────────────────────────────────────────────────────────
function ImageManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string[]>([]); // slot keys while uploading
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    // Create placeholder keys so we can show spinners
    const keys = fileArray.map((_, i) => `upload-${Date.now()}-${i}`);
    setUploading((prev) => [...prev, ...keys]);

    const uploaded: string[] = [];
    await Promise.all(
      fileArray.map(async (file, i) => {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
        const json = await res.json();
        if (json.url) uploaded.push(json.url);
        setUploading((prev) => prev.filter((k) => k !== keys[i]));
      })
    );
    if (uploaded.length) onChange([...images, ...uploaded]);
  }

  function addUrl() {
    const u = urlInput.trim();
    if (!u) return;
    try { new URL(u); } catch { setUrlError("Invalid URL"); return; }
    setUrlError("");
    onChange([...images, u]);
    setUrlInput("");
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }

  const isEmpty = images.length === 0 && uploading.length === 0;

  return (
    <div>
      {/* Grid */}
      {!isEmpty && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
          {images.map((url, i) => (
            <div key={url + i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: "var(--line)", aspectRatio: "16/9" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {/* Overlay controls */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", opacity: 0, transition: "opacity 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 6px 0" }}>
                  <button onClick={() => move(i, i - 1)} disabled={i === 0}
                    title="Move left"
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", fontSize: 12, padding: "2px 6px", opacity: i === 0 ? 0.3 : 1 }}>
                    ←
                  </button>
                  <button onClick={() => move(i, i + 1)} disabled={i === images.length - 1}
                    title="Move right"
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", fontSize: 12, padding: "2px 6px", opacity: i === images.length - 1 ? 0.3 : 1 }}>
                    →
                  </button>
                </div>
                <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                  <button onClick={() => remove(i)} title="Remove"
                    style={{ background: "rgba(200,0,0,0.8)", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", fontSize: 11, padding: "3px 10px" }}>
                    Remove
                  </button>
                </div>
                {i === 0 && (
                  <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", borderRadius: 4, padding: "2px 6px", fontSize: 10, color: "#fff", whiteSpace: "nowrap" }}>
                    First slide
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Uploading spinners */}
          {uploading.map((k) => (
            <div key={k} style={{ background: "var(--line)", borderRadius: 10, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>Uploading…</div>
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <div style={{ border: "2px dashed var(--line)", borderRadius: 10, padding: "32px 16px", textAlign: "center", marginBottom: 16, color: "var(--ink-mute)", fontSize: 13 }}>
          No images yet — upload or paste a URL below
        </div>
      )}

      {/* Upload button */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple
          style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="btn btn-ghost btn-sm"
          style={{ whiteSpace: "nowrap" }}>
          ↑ Upload image
        </button>

        {/* URL input */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
              placeholder="Or paste an image URL…"
              style={{ ...inputStyle, flex: 1, padding: "8px 10px" }}
            />
            <button type="button" onClick={addUrl} className="btn btn-ghost btn-sm" style={{ whiteSpace: "nowrap" }}>Add URL</button>
          </div>
          {urlError && <div style={{ fontSize: 12, color: "#c00", marginTop: 4 }}>{urlError}</div>}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 10 }}>
        Hover an image to reorder or remove it. The first image is the carousel starting slide.
      </p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function ContentForm({ initialContent, onContentChange }: Props) {
  const [heroImages, setHeroImages]     = useState<string[]>(
    Array.isArray(initialContent.hero_images) ? initialContent.hero_images : []
  );
  const [heroInterval, setHeroInterval]   = useState(initialContent.hero_carousel_interval ?? 5000);
  const [stats, setStats]                 = useState(initialContent.hero_stats ?? []);
  const [flagshipInterval, setFlagshipInterval] = useState(initialContent.flagship_carousel_interval ?? 6000);

  // Notify parent of any change so SettingsShell can save everything together
  function notify(patch: Partial<SiteContent>) {
    onContentChange({
      hero_images:                heroImages,
      hero_carousel_interval:     heroInterval,
      hero_stats:                 stats,
      flagship_carousel_interval: flagshipInterval,
      ...patch,
    });
  }

  function handleHeroImages(imgs: string[]) { setHeroImages(imgs); notify({ hero_images: imgs }); }
  function handleHeroInterval(v: number)    { setHeroInterval(v);  notify({ hero_carousel_interval: v }); }
  function handleFlagshipInterval(v: number){ setFlagshipInterval(v); notify({ flagship_carousel_interval: v }); }

  function updateStat(i: number, field: "num" | "label", val: string) {
    const next = stats.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    setStats(next);
    notify({ hero_stats: next });
  }

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 6 }}>
        Homepage Content
      </h2>
      <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 28 }}>
        Manage hero images, trust-banner stats, and carousel timing.
      </p>

      {/* Hero Images */}
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Hero Images</h3>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
          Upload photos or add URLs. Images rotate automatically in the hero carousel.
        </p>
        <ImageManager images={heroImages} onChange={handleHeroImages} />
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>Carousel speed</label>
          <select value={heroInterval} onChange={(e) => handleHeroInterval(Number(e.target.value))}
            style={{ ...inputStyle, width: "auto" }}>
            {SPEED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
              <input value={stat.num} onChange={(e) => updateStat(i, "num", e.target.value)}
                placeholder="42" style={inputStyle} />
              <input value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)}
                placeholder="Handpicked venues" style={inputStyle} />
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
        <select value={flagshipInterval} onChange={(e) => handleFlagshipInterval(Number(e.target.value))}
          style={{ ...inputStyle, width: "auto" }}>
          {FLAGSHIP_SPEED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
