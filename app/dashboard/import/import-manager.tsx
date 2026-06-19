"use client";

import { useState } from "react";

type SearchResult = {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  photoRef?: string;
};

const VENUE_TYPES: { label: string; slug: string }[] = [
  { label: "Hotel / Banquet", slug: "banquet-hall" },
  { label: "Lawn / Farmhouse", slug: "lawn" },
  { label: "Heritage / Palace", slug: "heritage" },
  { label: "Resort", slug: "resort" },
  { label: "Rooftop", slug: "rooftop" },
];

const input: React.CSSProperties = {
  padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8,
  fontSize: 14, color: "var(--ink)", background: "var(--surface)", outline: "none",
};

export function ImportManager({ cityOptions, disabled }: { cityOptions: { slug: string; name: string }[]; disabled: boolean }) {
  const [query, setQuery] = useState("");
  const [citySlug, setCitySlug] = useState(cityOptions[0]?.slug ?? "nagpur");
  const [typeIdx, setTypeIdx] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [importingId, setImportingId] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/places/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Search failed"); setResults([]); return; }
      setResults(data);
    } catch {
      setError("Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function importVenue(r: SearchResult) {
    setImportingId(r.placeId);
    setError("");
    try {
      const res = await fetch("/api/admin/places/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: r.placeId,
          citySlug,
          type: VENUE_TYPES[typeIdx].label,
          typeSlug: VENUE_TYPES[typeIdx].slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Import failed"); return; }
      setImportedIds((prev) => new Set(prev).add(r.placeId));
    } catch {
      setError("Import failed");
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div>
      <form onSubmit={search} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. wedding lawns in Wardha Road Nagpur"
          style={{ ...input, flex: "1 1 280px" }}
          disabled={disabled}
        />
        <select value={citySlug} onChange={(e) => setCitySlug(e.target.value)} style={input} disabled={disabled}>
          {cityOptions.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={typeIdx} onChange={(e) => setTypeIdx(Number(e.target.value))} style={input} disabled={disabled}>
          {VENUE_TYPES.map((t, i) => <option key={t.slug} value={i}>{t.label}</option>)}
        </select>
        <button type="submit" className="btn btn-primary" disabled={disabled || searching}>
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <div style={{ fontSize: 13, color: "#c00", marginBottom: 16 }}>{error}</div>}

      {results.length === 0 && !searching && (
        <p style={{ fontSize: 14, color: "var(--ink-mute)" }}>
          Search for venues by area or name — results come straight from Google Places. The city and type you pick apply to whatever you import.
        </p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {results.map((r) => {
          const imported = importedIds.has(r.placeId);
          return (
            <div key={r.placeId} style={{
              display: "flex", alignItems: "center", gap: 14,
              border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "14px 18px",
            }}>
              {r.photoRef ? (
                <img
                  src={`/api/place-photo?ref=${encodeURIComponent(r.photoRef)}`}
                  alt={r.name}
                  style={{ width: 72, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 72, height: 56, borderRadius: 8, background: "var(--surface-tint)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 14 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>{r.address}</div>
                {r.rating != null && (
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
                    ★ {r.rating} · {r.reviewCount ?? 0} Google reviews
                  </div>
                )}
              </div>
              <button
                onClick={() => importVenue(r)}
                disabled={imported || importingId === r.placeId}
                className={imported ? "btn btn-ghost" : "btn btn-primary"}
                style={{ flexShrink: 0, opacity: importingId === r.placeId ? 0.7 : 1 }}
              >
                {imported ? "Imported ✓" : importingId === r.placeId ? "Importing…" : "Import"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
