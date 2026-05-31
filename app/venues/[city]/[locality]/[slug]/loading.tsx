export default function VenueDetailLoading() {
  return (
    <div className="skel-page">
      {/* Nav skeleton */}
      <div style={{ padding: "22px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8e2da", background: "var(--cream)" }}>
        <div className="skel" style={{ width: 120, height: 24 }} />
        <div style={{ display: "flex", gap: 24 }}>
          {[90, 70, 80].map((w, i) => <div key={i} className="skel" style={{ width: w, height: 14 }} />)}
        </div>
        <div className="skel" style={{ width: 80, height: 36, borderRadius: 20 }} />
      </div>

      {/* Gallery skeleton */}
      <div className="skel" style={{ height: 480, borderRadius: 0 }} />

      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "32px 40px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>
          <div>
            {/* Badges + title */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[80, 100, 90].map((w, i) => <div key={i} className="skel" style={{ width: w, height: 28, borderRadius: 20 }} />)}
            </div>
            <div className="skel" style={{ width: "70%", height: 44, marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
              {[180, 140, 160].map((w, i) => <div key={i} className="skel" style={{ width: w, height: 16 }} />)}
            </div>

            {/* Tab bar */}
            <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 0, marginBottom: 36 }}>
              {[90, 120, 100, 100, 110, 80].map((w, i) => (
                <div key={i} className="skel" style={{ width: w, height: 40, borderRadius: "8px 8px 0 0" }} />
              ))}
            </div>

            {/* Content blocks */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 40 }}>
                <div className="skel" style={{ width: 200, height: 22, marginBottom: 16 }} />
                <div className="skel" style={{ height: 16, marginBottom: 8 }} />
                <div className="skel" style={{ height: 16, width: "90%", marginBottom: 8 }} />
                <div className="skel" style={{ height: 16, width: "75%", marginBottom: 0 }} />
              </div>
            ))}
          </div>

          {/* Sidebar skeleton */}
          <div style={{ position: "sticky", top: 70, borderRadius: 14, border: "1px solid var(--line)", padding: 24, background: "#fff" }}>
            <div className="skel" style={{ width: "80%", height: 24, marginBottom: 16 }} />
            <div className="skel" style={{ width: "60%", height: 40, marginBottom: 8 }} />
            <div className="skel" style={{ height: 44, borderRadius: 10, marginBottom: 12 }} />
            <div className="skel" style={{ height: 44, borderRadius: 10 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
