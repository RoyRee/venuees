// Shows instantly on navigation — no server round-trip needed.
// Replaces the blank white screen while the venues page renders.
export default function VenuesLoading() {
  return (
    <div className="skel-page">
      {/* Nav bar skeleton */}
      <div style={{ padding: "22px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8e2da", background: "var(--cream)" }}>
        <div className="skel" style={{ width: 120, height: 24 }} />
        <div style={{ display: "flex", gap: 24 }}>
          {[90, 70, 80, 76, 90].map((w, i) => <div key={i} className="skel" style={{ width: w, height: 14 }} />)}
        </div>
        <div className="skel" style={{ width: 80, height: 36, borderRadius: 20 }} />
      </div>

      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "40px 40px 80px" }}>
        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <div className="skel" style={{ width: 320, height: 38, marginBottom: 10 }} />
          <div className="skel" style={{ width: 200, height: 18 }} />
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {[120, 100, 140, 110, 130, 95].map((w, i) => (
            <div key={i} className="skel" style={{ width: w, height: 36, borderRadius: 20 }} />
          ))}
        </div>

        {/* Venue grid */}
        <div className="vgrid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              <div className="skel" style={{ height: 220, borderRadius: 0 }} />
              <div style={{ padding: "14px 16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div className="skel" style={{ width: 90, height: 26, borderRadius: 20 }} />
                  <div className="skel" style={{ width: 40, height: 16 }} />
                </div>
                <div className="skel" style={{ width: "80%", height: 20, marginBottom: 8 }} />
                <div className="skel" style={{ width: "60%", height: 14, marginBottom: 12 }} />
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <div className="skel" style={{ width: 80, height: 14 }} />
                  <div className="skel" style={{ width: 110, height: 14 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="skel" style={{ width: 90, height: 22 }} />
                  <div className="skel" style={{ width: 60, height: 32, borderRadius: 20 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile tabbar skeleton */}
      <div style={{ display: "none" }} className="mobile-tabbar-skel" />
    </div>
  );
}
