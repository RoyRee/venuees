// Shows inside DashboardShell while the dashboard page data loads.
export default function DashboardLoading() {
  return (
    <div style={{ padding: "0 4px" }}>
      {/* Page title */}
      <div style={{ marginBottom: 32 }}>
        <div className="skel" style={{ width: 200, height: 32, marginBottom: 10 }} />
        <div className="skel" style={{ width: 280, height: 16 }} />
      </div>

      {/* Stat cards row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 12, border: "1px solid var(--line)", padding: "20px 24px", background: "#fff" }}>
            <div className="skel" style={{ width: 100, height: 14, marginBottom: 12 }} />
            <div className="skel" style={{ width: 70, height: 32, marginBottom: 6 }} />
            <div className="skel" style={{ width: 120, height: 12 }} />
          </div>
        ))}
      </div>

      {/* Content rows */}
      <div style={{ marginBottom: 24 }}>
        <div className="skel" style={{ width: 160, height: 22, marginBottom: 16 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
            <div className="skel" style={{ width: 40, height: 40, borderRadius: "50%" }} />
            <div style={{ flex: 1 }}>
              <div className="skel" style={{ width: "50%", height: 16, marginBottom: 6 }} />
              <div className="skel" style={{ width: "30%", height: 12 }} />
            </div>
            <div className="skel" style={{ width: 70, height: 26, borderRadius: 20 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
