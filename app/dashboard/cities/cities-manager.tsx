"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type City = { id: number; name: string; slug: string; lat: number; lng: number; isActive: boolean };

const input: React.CSSProperties = {
  padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 6,
  fontSize: 13, color: "var(--ink)", background: "var(--surface)", outline: "none",
};

export function CitiesManager({ initialCities }: { initialCities: City[] }) {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>(initialCities);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", lat: "", lng: "" });
  const [error, setError] = useState("");

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function addCity() {
    setError("");
    if (!form.name || !form.slug || !form.lat || !form.lng) {
      setError("All fields are required"); return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, slug: form.slug, lat: Number(form.lat), lng: Number(form.lng) }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.error ?? "Failed"); return; }
      setForm({ name: "", slug: "", lat: "", lng: "" });
      router.refresh();
      const all = await fetch("/api/admin/cities").then((r) => r.json());
      setCities(all);
    } finally { setBusy(false); }
  }

  async function toggleActive(id: number) {
    const res = await fetch("/api/admin/cities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const updated: City = await res.json();
      setCities((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    }
  }

  async function deleteCity(id: number) {
    if (!confirm("Delete this city?")) return;
    await fetch("/api/admin/cities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCities((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      {/* City list */}
      {cities.length > 0 && (
        <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: 32 }}>
          {cities.map((c, i) => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              padding: "14px 20px", fontSize: 14,
              borderBottom: i < cities.length - 1 ? "1px solid var(--line)" : "none",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, color: c.isActive ? "var(--ink)" : "var(--ink-mute)" }}>{c.name}</span>
                <span style={{ marginLeft: 10, fontSize: 12, color: "var(--ink-mute)" }}>{c.slug}</span>
                {!c.isActive && (
                  <span style={{ marginLeft: 8, fontSize: 11, padding: "1px 7px", borderRadius: 99, background: "#f0f0f0", color: "var(--ink-mute)", fontWeight: 600 }}>Inactive</span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                {Number(c.lat).toFixed(4)}, {Number(c.lng).toFixed(4)}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toggleActive(c.id)} style={{
                  fontSize: 12, padding: "4px 12px", borderRadius: 6, fontWeight: 500, cursor: "pointer",
                  border: `1px solid ${c.isActive ? "#c00" : "#060"}`,
                  background: "transparent", color: c.isActive ? "#c00" : "#060",
                }}>
                  {c.isActive ? "Disable" : "Enable"}
                </button>
                <button onClick={() => deleteCity(c.id)} style={{
                  fontSize: 12, padding: "4px 12px", borderRadius: 6, fontWeight: 500, cursor: "pointer",
                  border: "1px solid var(--line)", background: "transparent", color: "var(--ink-mute)",
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add city form */}
      <div style={{ background: "var(--surface-tint)", borderRadius: "var(--radius-md)", padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "var(--ink)" }}>Add a city</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 120px", gap: 10, marginBottom: 12 }}>
          <input
            value={form.name} placeholder="City name (e.g. Pune)"
            style={input}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
          />
          <input
            value={form.slug} placeholder="Slug (e.g. pune)"
            style={input}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <input
            value={form.lat} placeholder="Latitude"
            style={input} type="number" step="any"
            onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
          />
          <input
            value={form.lng} placeholder="Longitude"
            style={input} type="number" step="any"
            onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
          />
        </div>
        {error && <div style={{ fontSize: 13, color: "#c00", marginBottom: 10 }}>{error}</div>}
        <button onClick={addCity} disabled={busy} className="btn btn-primary" style={{ opacity: busy ? 0.7 : 1 }}>
          {busy ? "Adding…" : "Add city"}
        </button>
        <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 10 }}>
          Find lat/lng at <strong>maps.google.com</strong> — right-click any point and copy coordinates.
        </p>
      </div>
    </div>
  );
}
