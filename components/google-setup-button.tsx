"use client";
import { useState } from "react";

type Props = {
  venueId: number;
  venueName: string;
  initialPlaceId?: string;
  initialMapsUrl?: string;
  initialRating?: number;
  initialReviewCount?: number;
};

const inp: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13,
  border: "1px solid var(--line)", outline: "none", color: "var(--ink)",
  background: "#fff",
};

export function GoogleSetupButton({ venueId, venueName, initialPlaceId, initialMapsUrl, initialRating, initialReviewCount }: Props) {
  const [open, setOpen] = useState(false);
  const [placeId, setPlaceId]       = useState(initialPlaceId    ?? "");
  const [mapsUrl, setMapsUrl]       = useState(initialMapsUrl    ?? "");
  const [rating, setRating]         = useState(String(initialRating       ?? ""));
  const [reviewCount, setReviewCount] = useState(String(initialReviewCount ?? ""));
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/venues/${venueId}/google`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googlePlaceId: placeId, googleMapsUrl: mapsUrl, googleRating: rating ? Number(rating) : null, googleReviewCount: reviewCount ? Number(reviewCount) : null }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => { setSaved(false); setOpen(false); }, 1200); }
    } finally {
      setSaving(false);
    }
  }

  const isConfigured = !!(initialPlaceId || initialMapsUrl);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={isConfigured ? "Google Reviews configured" : "Set up Google Reviews"}
        style={{ background: "none", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: isConfigured ? "#1a73e8" : "var(--ink-mute)", display: "inline-flex", alignItems: "center", gap: 5 }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {isConfigured ? "Google ✓" : "Google"}
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 6 }}>Google Reviews</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 20 }}>{venueName}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>
                  Google Place ID
                  <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6, fontWeight: 400, textTransform: "none", color: "var(--brand)" }}>How to find →</a>
                </label>
                <input style={inp} placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4" value={placeId} onChange={(e) => setPlaceId(e.target.value)} />
                <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}>Required for live data. If set + API key in env, rating auto-refreshes daily.</div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>Google Maps URL</label>
                <input style={inp} placeholder="https://maps.google.com/?cid=…" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
                <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}>Paste the Google Maps link for this venue — used for the &ldquo;View on Google&rdquo; button.</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>Rating</label>
                  <input style={inp} placeholder="4.9" type="number" step="0.1" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>Review count</label>
                  <input style={inp} placeholder="412" type="number" min="0" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>Rating & count are used immediately. If Place ID + API key are set, they auto-update daily from Google.</div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => setOpen(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid var(--line)", background: "none", cursor: "pointer", fontSize: 14, color: "var(--ink-soft)" }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving || saved} style={{ flex: 2, padding: "10px 0", borderRadius: 8, border: "none", background: saved ? "#22c55e" : "var(--brand)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                {saved ? "Saved ✓" : saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
