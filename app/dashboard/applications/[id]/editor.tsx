"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Styles ─────────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", padding: "8px 10px", fontSize: 13,
  border: "1px solid var(--line)", borderRadius: 6,
  background: "#fff", color: "var(--ink)", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
  textTransform: "uppercase", color: "var(--ink-mute)",
  display: "block", marginBottom: 4,
};
const sectionHead: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "var(--brand)",
  marginBottom: 10, marginTop: 4,
  paddingBottom: 6, borderBottom: "1px solid var(--line)",
};
function Field({ name, children, span2 }: { name: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div style={span2 ? { gridColumn: "span 2" } : {}}>
      <span style={lbl}>{name}</span>
      {children}
    </div>
  );
}

const VENUE_AMENITIES = ["AC Halls", "Outdoor Lawn", "Parking", "In-house Catering", "Outside Catering Allowed", "DJ Allowed", "Valet Parking", "Bridal Suite", "Swimming Pool", "Accommodation", "Generator Backup", "Décor Allowed"];
const IMAGE_MAX_BYTES = 600 * 1024;

async function compressToBase64(file: File, maxBytes: number): Promise<{ data: string; mime: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const scale = Math.min(1, Math.sqrt(maxBytes / file.size));
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
      resolve({ data, mime: "image/jpeg" });
    };
    img.src = url;
  });
}

// ── Types ──────────────────────────────────────────────────────────────────
interface MediaItem { id: number; data: string; mimeType: string; type: string; fileName: string | null; order: number; }
interface Hall { name: string; type: string; area: string; theatre: number; floating: number; dining: number; ph?: string; }
interface Pkg  { name: string; pricePerPlate: string; features: string[]; }

interface Props {
  id: number;          // applicationId
  status: string;
  media: MediaItem[];
  initial: {
    businessName: string; businessType: string; contactName: string;
    phone: string; email: string; city: string; locality: string;
    website: string; message: string; amenities: string[];
    // detail scalars
    capacityMin: string; capacityMax: string; vegPlate: string; nvPlate: string;
    hallRent: string; minGuarantee: string; parking: string; rooms: string;
    priceFrom: string; yearsExp: string; completed: string;
    tagline: string; whatsapp: string; instagram: string;
    fullAddress: string; googleMapsUrl: string; googlePlaceId: string;
    // structured
    halls: Hall[];
    packages: Pkg[];
    locationInfo: { airport?: string; railway?: string; hotelCluster?: string };
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export function ApplicationEditor({ id, status, media: initialMedia, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // ── Core fields ──────────────────────────────────────────────────────────
  const [f, setF] = useState(initial);
  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) =>
    setF(prev => ({ ...prev, [k]: v }));

  // ── Media ────────────────────────────────────────────────────────────────
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
  const [mediaLoading, setMediaLoading] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function deleteMedia(mediaId: number) {
    setMediaLoading(mediaId);
    await fetch("/api/apply/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId }),
    });
    setMediaItems(m => m.filter(x => x.id !== mediaId));
    setMediaLoading(null);
  }

  async function uploadPhotos(files: FileList) {
    const arr = Array.from(files);
    for (const file of arr) {
      const isVideo = file.type.startsWith("video/");
      let data: string; let mime: string;
      if (isVideo) {
        const buf = await file.arrayBuffer();
        data = btoa(String.fromCharCode(...new Uint8Array(buf)));
        mime = file.type;
      } else {
        const r = await compressToBase64(file, IMAGE_MAX_BYTES);
        data = r.data; mime = r.mime;
      }
      const res = await fetch("/api/apply/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, data, mimeType: mime, fileName: file.name, type: isVideo ? "video" : "image", order: mediaItems.length }),
      });
      if (res.ok) {
        // Re-fetch updated media list via router refresh; add a temp local preview
        const tempId = Date.now();
        setMediaItems(m => [...m, { id: tempId, data, mimeType: mime, type: isVideo ? "video" : "image", fileName: file.name, order: m.length }]);
      }
    }
    router.refresh();
  }

  // ── Halls ────────────────────────────────────────────────────────────────
  const [halls, setHalls] = useState<Hall[]>(f.halls);
  const [editingHall, setEditingHall] = useState<number | null>(null); // null=new
  const [hallForm, setHallForm] = useState<Hall>({ name: "", type: "Indoor Banquet", area: "", theatre: 0, floating: 0, dining: 0 });

  function startEditHall(idx: number) { setEditingHall(idx); setHallForm({ ...halls[idx] }); }
  function saveHall() {
    if (!hallForm.name.trim()) { alert("Hall name required"); return; }
    if (editingHall !== null) {
      setHalls(hs => hs.map((h, i) => i === editingHall ? hallForm : h));
    } else {
      setHalls(hs => [...hs, hallForm]);
    }
    setEditingHall(null);
    setHallForm({ name: "", type: "Indoor Banquet", area: "", theatre: 0, floating: 0, dining: 0 });
  }
  function removeHall(idx: number) { setHalls(hs => hs.filter((_, i) => i !== idx)); if (editingHall === idx) setEditingHall(null); }

  // ── Packages ─────────────────────────────────────────────────────────────
  const [packages, setPackages] = useState<Pkg[]>(f.packages);
  const [editingPkg, setEditingPkg] = useState<number | null>(null);
  const [pkgForm, setPkgForm] = useState<Pkg>({ name: "", pricePerPlate: "", features: [] });
  const [pkgFeatureInput, setPkgFeatureInput] = useState("");

  function startEditPkg(idx: number) { setEditingPkg(idx); setPkgForm({ ...packages[idx] }); }
  function savePkg() {
    if (!pkgForm.name.trim()) { alert("Package name required"); return; }
    if (editingPkg !== null) {
      setPackages(ps => ps.map((p, i) => i === editingPkg ? pkgForm : p));
    } else {
      setPackages(ps => [...ps, pkgForm]);
    }
    setEditingPkg(null);
    setPkgForm({ name: "", pricePerPlate: "", features: [] });
  }
  function removePkg(idx: number) { setPackages(ps => ps.filter((_, i) => i !== idx)); }

  // ── Amenities ─────────────────────────────────────────────────────────────
  function toggleAmenity(a: string) {
    setF(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }));
  }
  const [customAmenity, setCustomAmenity] = useState("");

  // ── Save all ─────────────────────────────────────────────────────────────
  function save() {
    setSaveErr("");
    startTransition(async () => {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          fields: {
            businessName: f.businessName, businessType: f.businessType,
            contactName: f.contactName, phone: f.phone, email: f.email,
            city: f.city, locality: f.locality, website: f.website,
            message: f.message, amenities: f.amenities,
            details: {
              capacityMin: f.capacityMin, capacityMax: f.capacityMax,
              vegPlate: f.vegPlate, nvPlate: f.nvPlate, hallRent: f.hallRent,
              minGuarantee: f.minGuarantee, parking: f.parking, rooms: f.rooms,
              priceFrom: f.priceFrom, yearsExp: f.yearsExp, completed: f.completed,
              tagline: f.tagline, whatsapp: f.whatsapp, instagram: f.instagram,
              fullAddress: f.fullAddress, googleMapsUrl: f.googleMapsUrl,
              googlePlaceId: f.googlePlaceId,
              halls: halls,
              packages: packages,
              locationInfo: f.locationInfo,
            },
          },
        }),
      });
      if (!res.ok) { setSaveErr("Save failed"); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    });
  }

  // ── Delete app ───────────────────────────────────────────────────────────
  function deleteApp() {
    startTransition(async () => {
      await fetch("/api/admin/applications", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.push("/dashboard/applications");
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>

      {/* Toggle header */}
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: "100%", padding: "14px 18px", display: "flex", alignItems: "center",
        justifyContent: "space-between", background: open ? "color-mix(in srgb,var(--brand) 6%,#fff)" : "var(--surface)",
        border: "none", cursor: "pointer", borderBottom: open ? "1px solid var(--line)" : "none",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)" }}>
          ✏️ Edit application details
        </span>
        <span style={{ fontSize: 20, color: "var(--ink-mute)", lineHeight: 1 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── SECTION: Core ─────────────────────────────────── */}
          <div>
            <div style={sectionHead}>Core info</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field name="Business name" span2><input style={inp} value={f.businessName} onChange={e => set("businessName", e.target.value)} /></Field>
              <Field name="Business type"><input style={inp} value={f.businessType} onChange={e => set("businessType", e.target.value)} /></Field>
              <Field name="Contact name"><input style={inp} value={f.contactName} onChange={e => set("contactName", e.target.value)} /></Field>
              <Field name="Phone"><input style={inp} value={f.phone} onChange={e => set("phone", e.target.value)} /></Field>
              <Field name="WhatsApp"><input style={inp} value={f.whatsapp} onChange={e => set("whatsapp", e.target.value)} /></Field>
              <Field name="Email"><input style={inp} type="email" value={f.email} onChange={e => set("email", e.target.value)} /></Field>
              <Field name="City"><input style={inp} value={f.city} onChange={e => set("city", e.target.value)} /></Field>
              <Field name="Locality / Area"><input style={inp} value={f.locality} onChange={e => set("locality", e.target.value)} /></Field>
              <Field name="Website"><input style={inp} value={f.website} onChange={e => set("website", e.target.value)} /></Field>
              <Field name="Instagram"><input style={inp} value={f.instagram} onChange={e => set("instagram", e.target.value)} /></Field>
              <Field name="Full address" span2><input style={inp} value={f.fullAddress} onChange={e => set("fullAddress", e.target.value)} /></Field>
              <Field name="Tagline" span2><input style={inp} value={f.tagline} onChange={e => set("tagline", e.target.value)} /></Field>
              <Field name="Description / message" span2>
                <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} value={f.message} onChange={e => set("message", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* ── SECTION: Venue capacity / pricing ─────────────── */}
          <div>
            <div style={sectionHead}>Venue — capacity &amp; pricing</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {([
                ["capacityMin","Min capacity"],["capacityMax","Max capacity"],
                ["vegPlate","Veg plate ₹"],["nvPlate","Non-veg ₹"],
                ["hallRent","Hall rent ₹"],["minGuarantee","Min guarantee ₹"],
                ["parking","Parking"],["rooms","Rooms"],
              ] as [keyof typeof initial, string][]).map(([k, nm]) => (
                <div key={k}><span style={lbl}>{nm}</span>
                  <input style={inp} type="number" value={f[k] as string} onChange={e => set(k as any, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* ── SECTION: Vendor fields ─────────────────────────── */}
          <div>
            <div style={sectionHead}>Vendor — pricing &amp; experience</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div><span style={lbl}>Price from ₹</span><input style={inp} type="number" value={f.priceFrom} onChange={e => set("priceFrom", e.target.value)} /></div>
              <div><span style={lbl}>Years exp.</span><input style={inp} type="number" value={f.yearsExp} onChange={e => set("yearsExp", e.target.value)} /></div>
              <div><span style={lbl}>Events completed</span><input style={inp} type="number" value={f.completed} onChange={e => set("completed", e.target.value)} /></div>
            </div>
          </div>

          {/* ── SECTION: Amenities ─────────────────────────────── */}
          <div>
            <div style={sectionHead}>Amenities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {VENUE_AMENITIES.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
                  padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                  border: f.amenities.includes(a) ? "none" : "1px solid var(--line)",
                  background: f.amenities.includes(a) ? "var(--brand)" : "#fff",
                  color: f.amenities.includes(a) ? "#fff" : "var(--ink-soft)", fontWeight: 500,
                }}>
                  {a}
                </button>
              ))}
            </div>
            {/* Custom amenity */}
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="Add custom amenity…" value={customAmenity} onChange={e => setCustomAmenity(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && customAmenity.trim()) { toggleAmenity(customAmenity.trim()); setCustomAmenity(""); }}} />
              <button type="button" onClick={() => { if (customAmenity.trim()) { toggleAmenity(customAmenity.trim()); setCustomAmenity(""); }}}
                style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                Add
              </button>
            </div>
            {/* Selected amenities (including custom) not in the preset list */}
            {f.amenities.filter(a => !VENUE_AMENITIES.includes(a)).map(a => (
              <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 4, margin: "6px 6px 0 0", padding: "4px 10px", borderRadius: 20, background: "var(--brand)", color: "#fff", fontSize: 12 }}>
                {a}
                <button type="button" onClick={() => toggleAmenity(a)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>

          {/* ── SECTION: Photos & videos ───────────────────────── */}
          <div>
            <div style={sectionHead}>Photos &amp; videos ({mediaItems.length})</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginBottom: 12 }}>
              {mediaItems.map(m => (
                <div key={m.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "4/3", background: "#000" }}>
                  {m.type === "image"
                    ? <img src={`data:${m.mimeType};base64,${m.data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 }}>▶</div>
                  }
                  <button type="button" onClick={() => deleteMedia(m.id)} disabled={mediaLoading === m.id}
                    style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", background: "rgba(180,0,0,0.85)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {mediaLoading === m.id ? "…" : "×"}
                  </button>
                </div>
              ))}
              {/* Add photo tile */}
              <button type="button" onClick={() => photoInputRef.current?.click()} style={{
                aspectRatio: "4/3", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--ink-mute)", fontSize: 12,
              }}>
                <span style={{ fontSize: 22 }}>+</span>
                <span>Add photos</span>
              </button>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }}
              onChange={e => { if (e.target.files?.length) uploadPhotos(e.target.files); }} />
          </div>

          {/* ── SECTION: Halls ─────────────────────────────────── */}
          <div>
            <div style={sectionHead}>Halls &amp; spaces ({halls.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {halls.map((h, i) => (
                <div key={i} style={{ padding: "10px 14px", border: `1px solid ${editingHall === i ? "var(--brand)" : "var(--line)"}`, borderRadius: 8, background: editingHall === i ? "color-mix(in srgb,var(--brand) 4%,#fff)" : "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{h.name} <span style={{ fontWeight: 400, color: "var(--ink-mute)", fontSize: 12 }}>({h.type})</span></div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      {h.area && `${h.area} · `}Theatre: {h.theatre} · Floating: {h.floating} · Dining: {h.dining}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button type="button" onClick={() => startEditHall(i)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "1px solid var(--brand)", color: "var(--brand)", background: "transparent", cursor: "pointer" }}>Edit</button>
                    <button type="button" onClick={() => removeHall(i)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "1px solid #fcc", color: "#c00", background: "transparent", cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Hall form */}
            <div style={{ border: `1px dashed ${editingHall !== null ? "var(--brand)" : "var(--line)"}`, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...lbl, marginBottom: 0 }}>{editingHall !== null ? `Editing: ${halls[editingHall]?.name}` : "Add new hall"}</span>
                {editingHall !== null && <button type="button" onClick={() => { setEditingHall(null); setHallForm({ name: "", type: "Indoor Banquet", area: "", theatre: 0, floating: 0, dining: 0 }); }} style={{ fontSize: 11, color: "var(--ink-mute)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancel</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><span style={lbl}>Name</span><input style={inp} value={hallForm.name} onChange={e => setHallForm(h => ({ ...h, name: e.target.value }))} placeholder="Grand Ballroom" /></div>
                <div><span style={lbl}>Type</span>
                  <select style={inp} value={hallForm.type} onChange={e => setHallForm(h => ({ ...h, type: e.target.value }))}>
                    {["Indoor Banquet","Outdoor Lawn","Poolside","Rooftop / Terrace","Other"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}><span style={lbl}>Area</span><input style={inp} value={hallForm.area} onChange={e => setHallForm(h => ({ ...h, area: e.target.value }))} placeholder="5,000 sqft" /></div>
                <div><span style={lbl}>Theatre</span><input style={inp} type="number" value={hallForm.theatre} onChange={e => setHallForm(h => ({ ...h, theatre: +e.target.value }))} /></div>
                <div><span style={lbl}>Floating</span><input style={inp} type="number" value={hallForm.floating} onChange={e => setHallForm(h => ({ ...h, floating: +e.target.value }))} /></div>
                <div><span style={lbl}>Dining</span><input style={inp} type="number" value={hallForm.dining} onChange={e => setHallForm(h => ({ ...h, dining: +e.target.value }))} /></div>
              </div>
              <button type="button" onClick={saveHall} style={{ padding: "9px 0", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {editingHall !== null ? "✓ Update hall" : "+ Add hall"}
              </button>
            </div>
          </div>

          {/* ── SECTION: Packages ──────────────────────────────── */}
          <div>
            <div style={sectionHead}>Pricing packages ({packages.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {packages.map((p, i) => (
                <div key={i} style={{ padding: "10px 14px", border: `1px solid ${editingPkg === i ? "var(--brand)" : "var(--line)"}`, borderRadius: 8, background: "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name} <span style={{ color: "var(--brand)" }}>₹{p.pricePerPlate}/plate</span></div>
                    {p.features.length > 0 && <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{p.features.join(" · ")}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button type="button" onClick={() => startEditPkg(i)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "1px solid var(--brand)", color: "var(--brand)", background: "transparent", cursor: "pointer" }}>Edit</button>
                    <button type="button" onClick={() => removePkg(i)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: "1px solid #fcc", color: "#c00", background: "transparent", cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Package form */}
            <div style={{ border: `1px dashed ${editingPkg !== null ? "var(--brand)" : "var(--line)"}`, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...lbl, marginBottom: 0 }}>{editingPkg !== null ? `Editing: ${packages[editingPkg]?.name}` : "Add package"}</span>
                {editingPkg !== null && <button type="button" onClick={() => { setEditingPkg(null); setPkgForm({ name: "", pricePerPlate: "", features: [] }); }} style={{ fontSize: 11, color: "var(--ink-mute)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancel</button>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><span style={lbl}>Package name</span><input style={inp} value={pkgForm.name} onChange={e => setPkgForm(p => ({ ...p, name: e.target.value }))} placeholder="Silver" /></div>
                <div><span style={lbl}>₹ per plate</span><input style={inp} type="number" value={pkgForm.pricePerPlate} onChange={e => setPkgForm(p => ({ ...p, pricePerPlate: e.target.value }))} /></div>
              </div>
              <div>
                <span style={lbl}>Features (press Enter to add)</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <input style={{ ...inp, flex: 1 }} value={pkgFeatureInput} onChange={e => setPkgFeatureInput(e.target.value)}
                    placeholder="e.g. Welcome drink"
                    onKeyDown={e => { if (e.key === "Enter" && pkgFeatureInput.trim()) { setPkgForm(p => ({ ...p, features: [...p.features, pkgFeatureInput.trim()] })); setPkgFeatureInput(""); }}} />
                  <button type="button" onClick={() => { if (pkgFeatureInput.trim()) { setPkgForm(p => ({ ...p, features: [...p.features, pkgFeatureInput.trim()] })); setPkgFeatureInput(""); }}}
                    style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", fontSize: 12, flexShrink: 0 }}>Add</button>
                </div>
                {pkgForm.features.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {pkgForm.features.map((ft, fi) => (
                      <span key={fi} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 12 }}>
                        {ft}
                        <button type="button" onClick={() => setPkgForm(p => ({ ...p, features: p.features.filter((_, ii) => ii !== fi) }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--ink-mute)", lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={savePkg} style={{ padding: "9px 0", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {editingPkg !== null ? "✓ Update package" : "+ Add package"}
              </button>
            </div>
          </div>

          {/* ── SECTION: Transit & Maps ────────────────────────── */}
          <div>
            <div style={sectionHead}>Transit &amp; maps</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><span style={lbl}>Airport distance</span>
                <input style={inp} value={f.locationInfo.airport ?? ""} onChange={e => set("locationInfo", { ...f.locationInfo, airport: e.target.value })} placeholder="e.g. 12 km from Nagpur Airport" />
              </div>
              <div><span style={lbl}>Railway distance</span>
                <input style={inp} value={f.locationInfo.railway ?? ""} onChange={e => set("locationInfo", { ...f.locationInfo, railway: e.target.value })} placeholder="e.g. 5 km from Nagpur Jn." />
              </div>
              <div><span style={lbl}>Nearby hotel cluster</span>
                <input style={inp} value={f.locationInfo.hotelCluster ?? ""} onChange={e => set("locationInfo", { ...f.locationInfo, hotelCluster: e.target.value })} placeholder="e.g. Civil Lines, Sitaburdi" />
              </div>
              <div><span style={lbl}>Google Place ID</span>
                <input style={inp} value={f.googlePlaceId} onChange={e => set("googlePlaceId", e.target.value)} placeholder="ChIJ…" />
              </div>
              <div style={{ gridColumn: "span 2" }}><span style={lbl}>Google Maps URL</span>
                <input style={inp} value={f.googleMapsUrl} onChange={e => set("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/…" />
              </div>
            </div>
          </div>

          {/* ── Save button ──────────────────────────────────────── */}
          {saveErr && <div style={{ fontSize: 12, color: "#c00" }}>{saveErr}</div>}
          <button type="button" onClick={save} disabled={isPending} style={{
            padding: "11px 0", borderRadius: 8, border: "none",
            background: saved ? "#4caf50" : "var(--brand)",
            color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s",
          }}>
            {isPending ? "Saving…" : saved ? "✓ All changes saved!" : "Save all changes"}
          </button>
        </div>
      )}

      {/* ── Delete (rejected only) ─────────────────────────────── */}
      {status === "rejected" && (
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--line)", background: "#fff8f8" }}>
          {!showDelete ? (
            <button type="button" onClick={() => setShowDelete(true)}
              style={{ fontSize: 12, color: "#c00", background: "none", border: "1px solid #fcc", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600 }}>
              🗑 Delete application
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#c00", fontWeight: 500 }}>Permanently delete this application and all its media?</span>
              <button type="button" onClick={deleteApp} disabled={isPending}
                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: "none", background: "#c00", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                {isPending ? "Deleting…" : "Yes, delete"}
              </button>
              <button type="button" onClick={() => setShowDelete(false)}
                style={{ fontSize: 12, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--line)", background: "transparent", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
