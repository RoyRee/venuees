export default function SavedLoading() {
  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ marginBottom: 32 }}>
        <div className="skel" style={{ width: 120, height: 32, marginBottom: 10 }} />
        <div className="skel" style={{ width: 160, height: 16 }} />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
          <div className="skel" style={{ width: 60, height: 60, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skel" style={{ width: "55%", height: 18, marginBottom: 8 }} />
            <div className="skel" style={{ width: "35%", height: 13 }} />
          </div>
          <div className="skel" style={{ width: 88, height: 34, borderRadius: 20 }} />
        </div>
      ))}
    </div>
  );
}
