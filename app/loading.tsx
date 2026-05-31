// Shown while the homepage re-renders (ISR revalidation or first load).
export default function HomeLoading() {
  return (
    <div className="skel-page">
      {/* Hero skeleton */}
      <div className="skel" style={{ height: "100vh", maxHeight: 680, borderRadius: 0 }} />

      {/* Featured venues block */}
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "60px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <div className="skel" style={{ height: 1, flex: 1 }} />
          <div className="skel" style={{ width: 140, height: 16, margin: "0 16px", borderRadius: 20 }} />
          <div className="skel" style={{ height: 1, flex: 1 }} />
        </div>
        <div className="skel" style={{ width: 340, height: 44, marginBottom: 36 }} />
        <div className="vgrid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden", background: "#fff" }}>
              <div className="skel" style={{ height: 220, borderRadius: 0 }} />
              <div style={{ padding: "14px 16px 18px" }}>
                <div className="skel" style={{ width: "80%", height: 20, marginBottom: 8 }} />
                <div className="skel" style={{ width: "60%", height: 14, marginBottom: 16 }} />
                <div className="skel" style={{ width: 80, height: 22 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
