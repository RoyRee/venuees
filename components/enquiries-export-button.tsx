"use client";

import { useState } from "react";

export function EnquiriesExportButton() {
  const [from, setFrom] = useState("");
  const [to,   setTo]   = useState("");
  const [open, setOpen] = useState(false);

  function doExport() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to)   params.set("to", to);
    window.open(`/api/admin/enquiries/export?${params}`, "_blank");
    setOpen(false);
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ fontSize: 13, padding: "8px 16px", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", background: "var(--surface)", color: "var(--ink)", cursor: "pointer" }}
      >
        Export CSV ↓
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "16px 20px", zIndex: 50, minWidth: 260, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-mute)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid var(--line)", borderRadius: 6, boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-mute)", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid var(--line)", borderRadius: 6, boxSizing: "border-box" }} />
          </div>
          <button
            onClick={doExport}
            className="btn btn-primary"
            style={{ width: "100%", fontSize: 13 }}
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
}
