"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApplicationActions } from "../actions";
import { ApplicationGallery } from "./gallery";

// ── Shared Styles ──────────────────────────────────────────────────────────
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
interface ExistingImage { id: number; url: string; alt: string; isPrimary: boolean; order: number; type: "image" | "video" }
interface Hall { name: string; type: string; area: string; theatre: number; floating: number; dining: number; ph?: string; }
interface Pkg  { name: string; pricePerPlate: string; features: string[]; }

interface AppDetailViewProps {
  app: {
    id: number;
    businessName: string;
    businessType: string;
    contactName: string;
    phone: string;
    email: string;
    city: string;
    locality: string | null;
    website: string | null;
    message: string | null;
    amenities: string[] | null;
    status: string;
    listingType: string | null;
    createdAt: string;
    rejectionNote: string | null;
  };
  details: any;
  media: MediaItem[];
  existingImages: ExistingImage[];
  isEditRequest: boolean;
  linkedType: string;
  linkedId: number;
  keepImageIds: number[] | null;
  keptImages: ExistingImage[];
  removedImages: ExistingImage[];
  statusStyle: { bg: string; color: string };
  isAdmin?: boolean;
}

// ── Main Component ─────────────────────────────────────────────────────────
export function AppDetailView(props: AppDetailViewProps) {
  const {
    app, details, media: initialMedia, existingImages, isEditRequest, linkedType, linkedId,
    keptImages, removedImages, statusStyle, isAdmin = false
  } = props;
  
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const images = initialMedia.filter(m => m.type === "image");
  const videos = initialMedia.filter(m => m.type === "video");

  // ── Form State ───────────────────────────────────────────────────────────
  const initial = {
    businessName: app.businessName, businessType: app.businessType,
    contactName: app.contactName, phone: app.phone, email: app.email,
    city: app.city, locality: app.locality ?? "", website: app.website ?? "",
    message: app.message ?? "", amenities: app.amenities ?? [],
    capacityMin: String(details.capacityMin ?? ""), capacityMax: String(details.capacityMax ?? ""),
    vegPlate: String(details.vegPlate ?? ""), nvPlate: String(details.nvPlate ?? ""),
    hallRent: String(details.hallRent ?? ""), minGuarantee: String(details.minGuarantee ?? ""),
    parking: String(details.parking ?? ""), rooms: String(details.rooms ?? ""),
    priceFrom: String(details.priceFrom ?? ""), yearsExp: String(details.yearsExp ?? ""),
    completed: String(details.completed ?? ""), tagline: String(details.tagline ?? ""),
    whatsapp: String(details.whatsapp ?? ""), instagram: String(details.instagram ?? ""),
    fullAddress: String(details.fullAddress ?? ""), googleMapsUrl: String(details.googleMapsUrl ?? ""),
    googlePlaceId: String(details.googlePlaceId ?? ""),
    halls: Array.isArray(details.halls) ? (details.halls as Hall[]) : [],
    packages: Array.isArray(details.packages) ? (details.packages as Pkg[]) : [],
    locationInfo: details.locationInfo ? (details.locationInfo as any) : {},
  };

  const [f, setF] = useState(initial);
  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) => setF(prev => ({ ...prev, [k]: v }));

  // ── Media ────────────────────────────────────────────────────────────────
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
  const [mediaLoading, setMediaLoading] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function deleteMedia(mediaId: number) {
    setMediaLoading(mediaId);
    await fetch("/api/apply/media", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId }),
    });
    setMediaItems(m => m.filter(x => x.id !== mediaId));
    setMediaLoading(null);
  }

  async function reorderApplicationMedia(direction: -1 | 1, index: number) {
    if (index + direction < 0 || index + direction >= mediaItems.length) return;
    
    const newItems = [...mediaItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + direction];
    newItems[index + direction] = temp;
    
    // Assign correct order to local state so badges update immediately
    const itemsWithOrder = newItems.map((m, i) => ({ ...m, order: i }));
    setMediaItems(itemsWithOrder);

    fetch("/api/apply/media/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: app.id,
        items: itemsWithOrder.map(m => ({ id: m.id, order: m.order })),
      }),
    }).catch(e => console.error("Failed to reorder application media", e));
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
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: app.id, data, mimeType: mime, fileName: file.name, type: isVideo ? "video" : "image", order: mediaItems.length }),
      });
      if (res.ok) {
        const tempId = Date.now();
        setMediaItems(m => [...m, { id: tempId, data, mimeType: mime, type: isVideo ? "video" : "image", fileName: file.name, order: m.length }]);
      }
    }
    router.refresh();
  }

  // ── Halls ────────────────────────────────────────────────────────────────
  const [halls, setHalls] = useState<Hall[]>(f.halls);
  const [editingHall, setEditingHall] = useState<number | null>(null);
  const [hallForm, setHallForm] = useState<Hall>({ name: "", type: "Indoor Banquet", area: "", theatre: 0, floating: 0, dining: 0 });

  function startEditHall(idx: number) { setEditingHall(idx); setHallForm({ ...halls[idx] }); }
  function saveHall() {
    if (!hallForm.name.trim()) { alert("Hall name required"); return; }
    if (editingHall !== null) { setHalls(hs => hs.map((h, i) => i === editingHall ? hallForm : h)); } 
    else { setHalls(hs => [...hs, hallForm]); }
    setEditingHall(null); setHallForm({ name: "", type: "Indoor Banquet", area: "", theatre: 0, floating: 0, dining: 0 });
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
    if (editingPkg !== null) { setPackages(ps => ps.map((p, i) => i === editingPkg ? pkgForm : p)); } 
    else { setPackages(ps => [...ps, pkgForm]); }
    setEditingPkg(null); setPkgForm({ name: "", pricePerPlate: "", features: [] });
  }
  function removePkg(idx: number) { setPackages(ps => ps.filter((_, i) => i !== idx)); }

  // ── Amenities ─────────────────────────────────────────────────────────────
  function toggleAmenity(a: string) {
    setF(prev => ({ ...prev, amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a] }));
  }
  const [customAmenity, setCustomAmenity] = useState("");

  // ── Save all ─────────────────────────────────────────────────────────────
  function save() {
    setSaveErr("");
    startTransition(async () => {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: app.id,
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
              halls: halls, packages: packages, locationInfo: f.locationInfo,
            },
          },
        }),
      });
      if (!res.ok) { setSaveErr("Save failed"); return; }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setIsEditing(false);
      }, 1500);
      router.refresh();
    });
  }

  // ── Delete app ───────────────────────────────────────────────────────────
  function deleteApp() {
    startTransition(async () => {
      await fetch("/api/admin/applications", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id }),
      });
      router.push("/dashboard/applications");
    });
  }

  // ── Layout Style ─────────────────────────────────────────────────────────
  const mobileGridStyle = {
    display: "grid", 
    gridTemplateColumns: "1fr", // Mobile default
    gap: 24,
  };

  return (
    <div className="dash-page" style={{ maxWidth: 1100 }}>
      {/* Back and Edit Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ marginBottom: 24 }}>
          <Link href={isAdmin ? "/dashboard/applications" : "/dashboard/listings"} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-mute)", textDecoration: "none" }}>
            <span>←</span> Back to {isAdmin ? "applications" : "listings"}
          </Link>
        </div>
        <button type="button" onClick={() => setIsEditing(!isEditing)} style={{
          padding: "6px 14px", borderRadius: 8, border: "1px solid var(--line)", 
          background: isEditing ? "color-mix(in srgb,var(--brand) 10%,#fff)" : "var(--surface)", 
          color: isEditing ? "var(--brand)" : "var(--ink)", fontWeight: 600, fontSize: 13, cursor: "pointer"
        }}>
          {isEditing ? "Cancel editing" : "✏️ Edit Details"}
        </button>
      </div>

      {/* Edit request banner */}
      {isEditRequest && (
        <div style={{ marginBottom: 20, padding: "14px 18px", background: "#eef", border: "1px solid #99c", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#448", marginRight: 8 }}>Edit request</span>
            <span style={{ fontSize: 14, color: "var(--ink)" }}>Approving this will <strong>update</strong> the existing {linkedType} listing — not create a new one.</span>
          </div>
          {linkedId > 0 && (
            <Link href={linkedType === "vendor" ? `/vendors` : `/venues`} style={{ fontSize: 13, color: "#448", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
              Browse {linkedType}s →
            </Link>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", margin: 0 }}>{app.businessName}</h1>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: statusStyle.bg, color: statusStyle.color }}>{app.status}</span>
            {app.listingType && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "var(--surface)", color: "var(--ink-mute)", border: "1px solid var(--line)", textTransform: "capitalize" }}>{app.listingType}</span>}
          </div>
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            {app.businessType} · {app.city}{app.locality ? `, ${app.locality}` : ""} · submitted {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
        {app.status === "pending" && !isEditing && <ApplicationActions id={app.id} />}
      </div>

      {/* Main Grid: single column on mobile, app-detail-grid (two cols) on desktop */}
      <div className="app-detail-grid" style={{
        // Override with media queries if needed, but since we rely on app-detail-grid from app.css, we'll let it handle it.
        // I will ensure app-detail-grid is mobile responsive in css next.
      }}>
        
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          
          {isEditing ? (
            // ==========================================
            // EDIT MODE MAIN CONTENT
            // ==========================================
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* ── SECTION: Core ─────────────────────────────────── */}
              <div style={{ border: "1px solid var(--brand)", borderRadius: 12, padding: 18, background: "color-mix(in srgb,var(--brand) 2%,#fff)" }}>
                <div style={sectionHead}>Core info</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
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
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                <div style={sectionHead}>Venue — capacity &amp; pricing</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
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
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                <div style={sectionHead}>Vendor — pricing &amp; experience</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                  <div><span style={lbl}>Price from ₹</span><input style={inp} type="number" value={f.priceFrom} onChange={e => set("priceFrom", e.target.value)} /></div>
                  <div><span style={lbl}>Years exp.</span><input style={inp} type="number" value={f.yearsExp} onChange={e => set("yearsExp", e.target.value)} /></div>
                  <div><span style={lbl}>Events completed</span><input style={inp} type="number" value={f.completed} onChange={e => set("completed", e.target.value)} /></div>
                </div>
              </div>

              {/* ── SECTION: Transit & Maps ────────────────────────── */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                <div style={sectionHead}>Transit &amp; maps</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  <div><span style={lbl}>Airport distance</span><input style={inp} value={f.locationInfo.airport ?? ""} onChange={e => set("locationInfo", { ...f.locationInfo, airport: e.target.value })} placeholder="e.g. 12 km from Nagpur Airport" /></div>
                  <div><span style={lbl}>Railway distance</span><input style={inp} value={f.locationInfo.railway ?? ""} onChange={e => set("locationInfo", { ...f.locationInfo, railway: e.target.value })} placeholder="e.g. 5 km from Nagpur Jn." /></div>
                  <div><span style={lbl}>Nearby hotel cluster</span><input style={inp} value={f.locationInfo.hotelCluster ?? ""} onChange={e => set("locationInfo", { ...f.locationInfo, hotelCluster: e.target.value })} placeholder="e.g. Civil Lines, Sitaburdi" /></div>
                  <div><span style={lbl}>Google Place ID</span><input style={inp} value={f.googlePlaceId} onChange={e => set("googlePlaceId", e.target.value)} placeholder="ChIJ…" /></div>
                  <div style={{ gridColumn: "span 2" }}><span style={lbl}>Google Maps URL</span><input style={inp} value={f.googleMapsUrl} onChange={e => set("googleMapsUrl", e.target.value)} placeholder="https://maps.google.com/…" /></div>
                </div>
              </div>
            </div>
          ) : (
            // ==========================================
            // VIEW MODE MAIN CONTENT
            // ==========================================
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Gallery */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", padding: 16 }}>
                {isEditRequest && existingImages.length > 0 ? (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>
                      Proposed Media Changes
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                      {/* Kept existing images */}
                      {keptImages.map((img) => (
                        <div key={`kept-${img.id}`} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #c8e6c9", background: "#f1f8e9" }}>
                          <div style={{ aspectRatio: "4/3", position: "relative", background: "#000" }}>
                            {img.type === "image" ? ( <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> ) : ( <video src={img.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} /> )}
                          </div>
                          <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 600, color: "#2e7d32", textAlign: "center", background: "#e8f5e9" }}>Keep Existing ({img.type})</div>
                        </div>
                      ))}
                      {/* Removed existing images */}
                      {removedImages.map((img) => (
                        <div key={`removed-${img.id}`} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #ffcdd2", background: "#ffebee" }}>
                          <div style={{ aspectRatio: "4/3", position: "relative", background: "#000" }}>
                            {img.type === "image" ? ( <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} /> ) : ( <video src={img.url} controls style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} /> )}
                            <div style={{ position: "absolute", inset: 0, background: "rgba(244,67,54,0.15)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                              <span style={{ background: "#d32f2f", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>Remove</span>
                            </div>
                          </div>
                          <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 600, color: "#c62828", textAlign: "center", background: "#ffebee" }}>Delete Existing ({img.type})</div>
                        </div>
                      ))}
                      {/* New added media */}
                      {initialMedia.map((m, i) => (
                        <div key={`new-${i}`} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #bbdefb", background: "#e3f2fd" }}>
                          <div style={{ aspectRatio: "4/3", position: "relative", background: "#000" }}>
                            {m.type === "image" ? ( <img src={`data:${m.mimeType};base64,${m.data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> ) : ( <video src={`data:${m.mimeType};base64,${m.data}`} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} /> )}
                            <div style={{ position: "absolute", top: 6, right: 6, pointerEvents: "none" }}>
                              <span style={{ background: "#1976d2", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, textTransform: "uppercase" }}>New</span>
                            </div>
                          </div>
                          <div style={{ padding: "6px 8px", fontSize: 11, fontWeight: 600, color: "#1565c0", textAlign: "center", background: "#e3f2fd" }}>Add New ({m.type})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>
                      Media · {images.length} photo{images.length !== 1 ? "s" : ""}{videos.length > 0 ? ` · ${videos.length} video` : ""}
                    </div>
                    <ApplicationGallery media={initialMedia} />
                  </div>
                )}
              </div>

              {/* Listing preview */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf50" }} />
                  <span style={{ fontSize: 12, color: "var(--ink-mute)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Listing preview · how it will look on venuees.in</span>
                </div>
                <div style={{ padding: "clamp(12px, 3vw, 20px)", background: "#fafaf9" }}>
                  {/* Mock hero */}
                  {images.length > 0 ? (
                    <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 16, height: "clamp(160px, 30vw, 220px)", position: "relative" }}>
                      <img src={`data:${images[0].mimeType};base64,${images[0].data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {images.length > 1 && (
                        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
                          <div style={{ background: "transparent" }} />
                          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 2 }}>
                            {images.slice(1, 3).map((img, i) => (
                              <div key={i} style={{ overflow: "hidden" }}>
                                <img src={`data:${img.mimeType};base64,${img.data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {images.length > 3 && (
                        <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>+{images.length - 3} more</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ height: 160, borderRadius: 10, background: "var(--line)", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-mute)", fontSize: 13 }}>No photos yet</div>
                  )}

                  {/* Name + badges */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "var(--brand)", color: "#fff", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{app.listingType ?? "venue"}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, border: "1px solid var(--line)", color: "var(--ink-mute)", textTransform: "capitalize" }}>{app.businessType}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>{app.businessName}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>📍 {app.locality ? `${app.locality}, ` : ""}{app.city}</div>
                  </div>

                  {/* Pricing / capacity */}
                  {(details.capacityMax || details.vegPlate || details.hallRent || details.priceFrom) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "12px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginBottom: 12 }}>
                      {details.capacityMax && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{String(details.capacityMax)}</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>max guests</div></div>}
                      {details.vegPlate && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>₹{String(details.vegPlate)}</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>veg plate</div></div>}
                      {details.nvPlate && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>₹{String(details.nvPlate)}</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>non-veg plate</div></div>}
                      {details.hallRent && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>₹{(parseInt(String(details.hallRent), 10) / 1000).toFixed(0)}k</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>hall rent</div></div>}
                      {details.priceFrom && <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>₹{(parseInt(String(details.priceFrom), 10) / 1000).toFixed(0)}k+</div><div style={{ fontSize: 11, color: "var(--ink-mute)" }}>starting price</div></div>}
                    </div>
                  )}

                  {/* Tagline */}
                  {details.tagline && <p style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontStyle: "italic", color: "var(--brand)", marginBottom: 10 }}>&ldquo;{String(details.tagline)}&rdquo;</p>}
                  
                  {/* Description */}
                  {app.message && <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 12 }}>{app.message}</p>}

                  {/* Amenities */}
                  {app.amenities && app.amenities.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                      {app.amenities.map((a) => <span key={a} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#fff", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>{a}</span>)}
                    </div>
                  )}

                  {/* Contact Preview */}
                  <div style={{ padding: "10px 14px", background: "#fff", borderRadius: 8, border: "1px solid var(--line)", fontSize: 12, color: "var(--ink-mute)" }}>
                    Contact info visible to enquirers after listing goes live
                  </div>
                </div>
              </div>

              {/* Halls Preview */}
              {app.listingType === "venue" && details.halls && Array.isArray(details.halls) && details.halls.length > 0 && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Submitted Halls ({details.halls.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {details.halls.map((h: any, i: number) => (
                      <div key={i} style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface)" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{h.name} ({h.type})</div>
                        <div style={{ fontSize: 12, color: "var(--ink-soft)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "4px 8px", marginTop: 4 }}>
                          <div>Area: <strong>{h.area}</strong></div>
                          <div>Theatre: <strong>{h.theatre}</strong></div>
                          <div>Floating: <strong>{h.floating}</strong></div>
                          <div>Dining: <strong>{h.dining}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Packages Preview */}
              {app.listingType === "venue" && details.packages && Array.isArray(details.packages) && details.packages.length > 0 && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Submitted Packages ({details.packages.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {details.packages.map((pkg: any, i: number) => (
                      <div key={i} style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 8, background: "var(--surface)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{pkg.name}</span>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "var(--brand)" }}>₹{pkg.pricePerPlate} / plate</span>
                        </div>
                        {pkg.features && pkg.features.length > 0 && (
                          <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 2 }}>
                            {pkg.features.map((f: string, idx: number) => <li key={idx}>{f}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transit/Location Preview */}
              {app.listingType === "venue" && ((details.locationInfo && Object.keys(details.locationInfo).length > 0) || details.googleMapsUrl || details.googlePlaceId) && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Transit & Maps Info</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                    {details.googleMapsUrl && (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ color: "var(--ink-soft)", flexShrink: 0 }}>Google Maps URL:</span>
                        <a href={String(details.googleMapsUrl)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>View Map Link</a>
                      </div>
                    )}
                    {details.googlePlaceId && (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ color: "var(--ink-soft)", flexShrink: 0 }}>Place ID:</span>
                        <span style={{ fontFamily: "monospace", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{String(details.googlePlaceId)}</span>
                      </div>
                    )}
                    {details.locationInfo && Object.entries(details.locationInfo as Record<string, any>).map(([key, val]) => val && (
                      <div key={key} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ color: "var(--ink-soft)", textTransform: "capitalize", flexShrink: 0 }}>{key.replace(/([A-Z])/g, " $1")}:</span>
                        <span style={{ fontWeight: 600, color: "var(--ink)", textAlign: "right" }}>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — details sidebar (or bottom on mobile) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          
          {isEditing ? (
            // ==========================================
            // EDIT MODE SIDEBAR CONTENT
            // ==========================================
            <>
              {/* ── SECTION: Amenities ─────────────────────────────── */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                <div style={sectionHead}>Amenities</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {VENUE_AMENITIES.map(a => (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{
                      padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                      border: f.amenities.includes(a) ? "none" : "1px solid var(--line)",
                      background: f.amenities.includes(a) ? "var(--brand)" : "#fff",
                      color: f.amenities.includes(a) ? "#fff" : "var(--ink-soft)", fontWeight: 500,
                    }}>{a}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...inp, flex: 1, minWidth: 100 }} placeholder="Add custom…" value={customAmenity} onChange={e => setCustomAmenity(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && customAmenity.trim()) { toggleAmenity(customAmenity.trim()); setCustomAmenity(""); }}} />
                  <button type="button" onClick={() => { if (customAmenity.trim()) { toggleAmenity(customAmenity.trim()); setCustomAmenity(""); }}}
                    style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Add</button>
                </div>
                {f.amenities.filter(a => !VENUE_AMENITIES.includes(a)).map(a => (
                  <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 4, margin: "6px 6px 0 0", padding: "4px 10px", borderRadius: 20, background: "var(--brand)", color: "#fff", fontSize: 12 }}>
                    {a} <button type="button" onClick={() => toggleAmenity(a)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>
                  </span>
                ))}
              </div>

              {/* ── SECTION: Photos & videos ───────────────────────── */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                <div style={sectionHead}>Photos &amp; videos ({mediaItems.length})</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8, marginBottom: 12 }}>
                  {mediaItems.map((m, i) => (
                    <div key={m.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)", aspectRatio: "4/3", background: "#000" }}>
                      {m.type === "image"
                        ? <img src={`data:${m.mimeType};base64,${m.data}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 }}>▶</div>
                      }
                      
                      <div style={{ position: "absolute", top: 4, left: 4, display: "flex", gap: 4 }}>
                        <span style={{ background: i === 0 ? "var(--brand)" : "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          {i === 0 ? "Display Image" : `#${i + 1}`}
                        </span>
                      </div>

                      <div style={{ position: "absolute", bottom: 4, right: 4, display: "flex", gap: 4 }}>
                        {i > 0 && (
                          <button type="button" onClick={() => reorderApplicationMedia(-1, i)} style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>←</button>
                        )}
                        {i < mediaItems.length - 1 && (
                          <button type="button" onClick={() => reorderApplicationMedia(1, i)} style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>→</button>
                        )}
                      </div>

                      <button type="button" onClick={() => deleteMedia(m.id)} disabled={mediaLoading === m.id}
                        style={{ position: "absolute", top: 4, right: 4, width: 24, height: 24, borderRadius: "50%", background: "rgba(180,0,0,0.85)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {mediaLoading === m.id ? "…" : "×"}
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => photoInputRef.current?.click()} style={{
                    aspectRatio: "4/3", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)",
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--ink-mute)", fontSize: 12,
                  }}>
                    <span style={{ fontSize: 22 }}>+</span><span>Add photos</span>
                  </button>
                </div>
                <input ref={photoInputRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }}
                  onChange={e => { if (e.target.files?.length) uploadPhotos(e.target.files); }} />
              </div>

              {/* ── SECTION: Halls ─────────────────────────────────── */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                <div style={sectionHead}>Halls &amp; spaces ({halls.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  {halls.map((h, i) => (
                    <div key={i} style={{ padding: "10px", border: `1px solid ${editingHall === i ? "var(--brand)" : "var(--line)"}`, borderRadius: 8, background: editingHall === i ? "color-mix(in srgb,var(--brand) 4%,#fff)" : "var(--surface)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                        <div><div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{h.name}</div><div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{h.type}</div></div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button type="button" onClick={() => startEditHall(i)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 5, border: "1px solid var(--brand)", color: "var(--brand)", background: "transparent", cursor: "pointer" }}>Edit</button>
                          <button type="button" onClick={() => removeHall(i)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 5, border: "1px solid #fcc", color: "#c00", background: "transparent", cursor: "pointer" }}>Del</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{h.area && `${h.area} · `}Th: {h.theatre} · Fl: {h.floating} · Di: {h.dining}</div>
                    </div>
                  ))}
                </div>
                {/* Hall form */}
                <div style={{ border: `1px dashed ${editingHall !== null ? "var(--brand)" : "var(--line)"}`, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...lbl, marginBottom: 0 }}>{editingHall !== null ? `Edit: ${halls[editingHall]?.name}` : "Add hall"}</span>
                    {editingHall !== null && <button type="button" onClick={() => { setEditingHall(null); setHallForm({ name: "", type: "Indoor Banquet", area: "", theatre: 0, floating: 0, dining: 0 }); }} style={{ fontSize: 11, color: "var(--ink-mute)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancel</button>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                    <div style={{ gridColumn: "span 2" }}><span style={lbl}>Name</span><input style={inp} value={hallForm.name} onChange={e => setHallForm(h => ({ ...h, name: e.target.value }))} placeholder="Grand Ballroom" /></div>
                    <div style={{ gridColumn: "span 2" }}><span style={lbl}>Type</span>
                      <select style={inp} value={hallForm.type} onChange={e => setHallForm(h => ({ ...h, type: e.target.value }))}>
                        {["Indoor Banquet","Outdoor Lawn","Poolside","Rooftop / Terrace","Other"].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><span style={lbl}>Area</span><input style={inp} value={hallForm.area} onChange={e => setHallForm(h => ({ ...h, area: e.target.value }))} placeholder="5,000 sqft" /></div>
                    <div><span style={lbl}>Theatre</span><input style={inp} type="number" value={hallForm.theatre} onChange={e => setHallForm(h => ({ ...h, theatre: +e.target.value }))} /></div>
                    <div><span style={lbl}>Floating</span><input style={inp} type="number" value={hallForm.floating} onChange={e => setHallForm(h => ({ ...h, floating: +e.target.value }))} /></div>
                    <div><span style={lbl}>Dining</span><input style={inp} type="number" value={hallForm.dining} onChange={e => setHallForm(h => ({ ...h, dining: +e.target.value }))} /></div>
                  </div>
                  <button type="button" onClick={saveHall} style={{ padding: "9px 0", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    {editingHall !== null ? "✓ Update" : "+ Add"}
                  </button>
                </div>
              </div>

              {/* ── SECTION: Packages ──────────────────────────────── */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                <div style={sectionHead}>Pricing packages ({packages.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  {packages.map((p, i) => (
                    <div key={i} style={{ padding: "10px", border: `1px solid ${editingPkg === i ? "var(--brand)" : "var(--line)"}`, borderRadius: 8, background: "var(--surface)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div><div style={{ fontWeight: 600, fontSize: 13 }}>{p.name} <span style={{ color: "var(--brand)" }}>₹{p.pricePerPlate}</span></div></div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button type="button" onClick={() => startEditPkg(i)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 5, border: "1px solid var(--brand)", color: "var(--brand)", background: "transparent", cursor: "pointer" }}>Edit</button>
                          <button type="button" onClick={() => removePkg(i)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 5, border: "1px solid #fcc", color: "#c00", background: "transparent", cursor: "pointer" }}>Del</button>
                        </div>
                      </div>
                      {p.features.length > 0 && <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>{p.features.join(", ")}</div>}
                    </div>
                  ))}
                </div>
                {/* Package form */}
                <div style={{ border: `1px dashed ${editingPkg !== null ? "var(--brand)" : "var(--line)"}`, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ ...lbl, marginBottom: 0 }}>{editingPkg !== null ? `Edit: ${packages[editingPkg]?.name}` : "Add pkg"}</span>
                    {editingPkg !== null && <button type="button" onClick={() => { setEditingPkg(null); setPkgForm({ name: "", pricePerPlate: "", features: [] }); }} style={{ fontSize: 11, color: "var(--ink-mute)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Cancel</button>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                    <div style={{ gridColumn: "span 2" }}><span style={lbl}>Name</span><input style={inp} value={pkgForm.name} onChange={e => setPkgForm(p => ({ ...p, name: e.target.value }))} placeholder="Silver" /></div>
                    <div style={{ gridColumn: "span 2" }}><span style={lbl}>₹/plate</span><input style={inp} type="number" value={pkgForm.pricePerPlate} onChange={e => setPkgForm(p => ({ ...p, pricePerPlate: e.target.value }))} /></div>
                  </div>
                  <div>
                    <span style={lbl}>Features (press Enter)</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input style={{ ...inp, flex: 1, minWidth: 100 }} value={pkgFeatureInput} onChange={e => setPkgFeatureInput(e.target.value)} placeholder="e.g. DJ"
                        onKeyDown={e => { if (e.key === "Enter" && pkgFeatureInput.trim()) { setPkgForm(p => ({ ...p, features: [...p.features, pkgFeatureInput.trim()] })); setPkgFeatureInput(""); }}} />
                      <button type="button" onClick={() => { if (pkgFeatureInput.trim()) { setPkgForm(p => ({ ...p, features: [...p.features, pkgFeatureInput.trim()] })); setPkgFeatureInput(""); }}}
                        style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", cursor: "pointer", fontSize: 12 }}>Add</button>
                    </div>
                    {pkgForm.features.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                        {pkgForm.features.map((ft, fi) => (
                          <span key={fi} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--line)", fontSize: 11 }}>
                            {ft} <button type="button" onClick={() => setPkgForm(p => ({ ...p, features: p.features.filter((_, ii) => ii !== fi) }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "var(--ink-mute)", padding: 0 }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={savePkg} style={{ padding: "9px 0", borderRadius: 6, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    {editingPkg !== null ? "✓ Update" : "+ Add"}
                  </button>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div style={{ padding: 18, background: "#fff", border: "1px solid var(--brand)", borderRadius: 12, position: "sticky", bottom: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
                {saveErr && <div style={{ fontSize: 12, color: "#c00", marginBottom: 8, textAlign: "center" }}>{saveErr}</div>}
                <button type="button" onClick={save} disabled={isPending} style={{
                  width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                  background: saved ? "#4caf50" : "var(--brand)",
                  color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s",
                }}>
                  {isPending ? "Saving…" : saved ? "✓ Saved!" : "Save all changes"}
                </button>
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "var(--ink-mute)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Cancel editing</button>
                </div>
              </div>

            </>
          ) : (
            // ==========================================
            // VIEW MODE SIDEBAR CONTENT
            // ==========================================
            <>
              {/* Contact */}
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Contact</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{app.contactName}</div>
                <a href={`tel:${app.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--brand)", textDecoration: "none", marginBottom: 4 }}>📞 {app.phone}</a>
                {details.whatsapp && String(details.whatsapp) !== app.phone && (
                  <a href={`https://wa.me/91${String(details.whatsapp).replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--brand)", textDecoration: "none", marginBottom: 4 }}>💬 WhatsApp: {String(details.whatsapp)}</a>
                )}
                <a href={`mailto:${app.email}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--brand)", textDecoration: "none", wordBreak: "break-all", marginBottom: 4 }}>✉ {app.email}</a>
                {details.fullAddress && <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>📍 {String(details.fullAddress)}</div>}
                {app.website && <a href={app.website} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 12, color: "var(--ink-mute)", marginTop: 6, wordBreak: "break-all" }}>🔗 {app.website}</a>}
                {details.instagram && <a href={`https://instagram.com/${String(details.instagram).replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 12, color: "var(--ink-mute)", marginTop: 4 }}>📸 {String(details.instagram)}</a>}
              </div>

              {/* Details */}
              {Object.keys(details).length > 0 && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Details</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(details).filter(([k, v]) => v && !["fullAddress","instagram","whatsapp","halls","packages","locationInfo","googleMapsUrl","googlePlaceId"].includes(k) && !k.startsWith("_")).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, gap: 8 }}>
                        <span style={{ color: "var(--ink-mute)", textTransform: "capitalize", flexShrink: 0 }}>{k.replace(/([A-Z])/g, " $1")}</span>
                        <span style={{ fontWeight: 600, color: "var(--ink)", textAlign: "right", wordBreak: "break-word" }}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities sidebar */}
              {app.amenities && app.amenities.length > 0 && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 10 }}>Amenities</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {app.amenities.map((a) => (
                      <span key={a} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection note */}
              {app.rejectionNote && (
                <div style={{ border: "1px solid #fcc", borderRadius: 12, padding: 16, background: "#fff8f8" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c00", marginBottom: 8 }}>Rejection note</div>
                  <p style={{ fontSize: 13, color: "#900", margin: 0 }}>{app.rejectionNote}</p>
                </div>
              )}

              {/* Decision Actions */}
              {isAdmin && app.status === "pending" && (
                <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>Decision</div>
                  <ApplicationActions id={app.id} />
                </div>
              )}

              {/* Delete App */}
              {isAdmin && app.status === "rejected" && (
                <div style={{ border: "1px solid #fcc", borderRadius: 12, padding: "14px 18px", background: "#fff8f8" }}>
                  {!showDelete ? (
                    <button type="button" onClick={() => setShowDelete(true)}
                      style={{ width: "100%", fontSize: 13, color: "#c00", background: "none", border: "1px solid #fcc", borderRadius: 6, padding: "8px", cursor: "pointer", fontWeight: 600 }}>
                      🗑 Delete application
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "#c00", fontWeight: 500, textAlign: "center" }}>Permanently delete?</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={deleteApp} disabled={isPending}
                          style={{ flex: 1, fontSize: 13, padding: "8px", borderRadius: 6, border: "none", background: "#c00", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                          {isPending ? "…" : "Yes, delete"}
                        </button>
                        <button type="button" onClick={() => setShowDelete(false)}
                          style={{ flex: 1, fontSize: 13, padding: "8px", borderRadius: 6, border: "1px solid #fcc", background: "transparent", color: "#c00", cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
