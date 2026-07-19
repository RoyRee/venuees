"use client";
import { useState, useTransition, useRef } from "react";

export interface EditListingData {
  id: number;
  linkedType: "venue" | "vendor";
  listingType: string;
  businessType: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  whatsapp: string;
  city: string;
  locality: string;
  fullAddress: string;
  website: string;
  instagram: string;
  capacityMin: string;
  capacityMax: string;
  vegPlate: string;
  nvPlate: string;
  hallRent: string;
  minGuarantee: string;
  parking: string;
  rooms: string;
  priceFrom: string;
  yearsExp: string;
  tagline: string;
  completed: string;
  description: string;
  amenities: string[];
  blockedDates: string[];
  // venue sub-sections
  halls: Array<{ name: string; type: string; area: string; theatre: number; floating: number; dining: number; ph?: string }>;
  packages: Array<{ name: string; pricePerPlate: number; features: string[] }>;
  locationInfo: { airport?: string; railway?: string; hotelCluster?: string };
  googleMapsUrl: string;
  googlePlaceId: string;
}

interface MediaFile {
  data: string;
  mimeType: string;
  fileName: string;
  type: "image" | "video";
  preview: string;
}

const VENUE_AMENITIES = [
  "AC Halls", "Outdoor Lawn", "Parking", "In-house Catering",
  "Outside Catering Allowed", "DJ Allowed", "Valet Parking", "Bridal Suite",
  "Swimming Pool", "Accommodation", "Generator Backup", "Décor Allowed",
];
const IMAGE_LIMIT = 80;
const VIDEO_LIMIT = 1;
const IMAGE_MAX_BYTES = 600 * 1024;
const VIDEO_MAX_MB = 3;

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 14px", fontSize: 14,
  border: "1px solid var(--line)", borderRadius: 8,
  background: "#fff", color: "var(--ink)", boxSizing: "border-box",
};

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)" }}>{label}</label>
        {note && <span style={{ fontSize: 11, color: "var(--ink-mute)" }}>{note}</span>}
      </div>
      {children}
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{sub}</div>
    </div>
  );
}

export function EditListingForm({
  listing,
  existingImages: initialExistingImages = [],
}: {
  listing: EditListingData;
  existingImages?: Array<{ id: number; url: string; alt: string; isPrimary: boolean; order: number; type: "image" | "video" }>;
}) {
  const [existingImages, setExistingImages] = useState(initialExistingImages);
  const [keepImageIds, setKeepImageIds] = useState<number[]>(
    initialExistingImages.map((img) => img.id)
  );

  async function reorderExistingImages(direction: -1 | 1, index: number) {
    if (index + direction < 0 || index + direction >= existingImages.length) return;
    
    // Swap locally
    const newImages = [...existingImages];
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    
    // Reassign order
    const orderedItems = newImages.map((img, i) => ({ id: img.id, order: i }));
    setExistingImages(newImages);

    // Call API
    fetch("/api/vendor/media/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingType: listing.linkedType,
        listingId: listing.id,
        items: orderedItems,
      }),
    }).catch(e => console.error("Failed to reorder live media", e));
  }
  const [tab, setTab] = useState<string>("Quick updates");
  const [form, setForm] = useState<EditListingData>({ ...listing });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hallsSaving, setHallsSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [packagesSaving, setPackagesSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [locationSaving, setLocationSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Request-changes state
  const [reqName, setReqName] = useState(listing.name);
  const [reqLocality, setReqLocality] = useState(listing.locality);
  const [reqAddress, setReqAddress] = useState(listing.fullAddress);
  const [reqCity, setReqCity] = useState(listing.city);
  const [reqSubmitted, setReqSubmitted] = useState(false);
  const [reqError, setReqError] = useState("");
  const [isPendingReq, startReqTransition] = useTransition();

  // Blocked dates state
  const [blockedDates, setBlockedDates] = useState<string[]>(listing.blockedDates);
  const [dateInput, setDateInput] = useState("");
  const [datesSaving, setDatesSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Photos state
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [photoSubmitLabel, setPhotoSubmitLabel] = useState("Submit photos for review");
  const [photoSubmitted, setPhotoSubmitted] = useState(false);
  const [isPhotoSubmitting, startPhotoTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [tempHallImage, setTempHallImage] = useState("");

  const set = (k: any, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  const addCustomAmenity = () => {
    const val = customAmenityInput.trim();
    if (!val || form.amenities.includes(val)) { setCustomAmenityInput(""); return; }
    setForm((f) => ({ ...f, amenities: [...f.amenities, val] }));
    setCustomAmenityInput("");
  };

  async function saveQuick() {
    setSaveStatus("saving");
    try {
      const body: Record<string, unknown> = {
        type: form.linkedType,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        description: form.description,
      };
      if (form.listingType === "venue") {
        body.vegPlate     = form.vegPlate;
        body.nvPlate      = form.nvPlate;
        body.hallRent     = form.hallRent;
        body.minGuarantee = form.minGuarantee;
        body.capacityMin  = form.capacityMin;
        body.capacityMax  = form.capacityMax;
        body.parking      = form.parking;
        body.rooms        = form.rooms;
        body.amenities    = form.amenities;
      } else if (form.listingType === "vendor") {
        body.priceFrom  = form.priceFrom;
        body.yearsExp   = form.yearsExp;
        body.completed  = form.completed;
        body.tagline    = form.tagline;
      }
      const res = await fetch(`/api/listings/${form.id}/quick-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  async function saveHalls() {
    setHallsSaving("saving");
    try {
      const res = await fetch(`/api/listings/${form.id}/quick-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.linkedType,
          halls: form.halls,
        }),
      });
      if (!res.ok) throw new Error();
      setHallsSaving("saved");
      setTimeout(() => setHallsSaving("idle"), 3000);
    } catch {
      setHallsSaving("error");
      setTimeout(() => setHallsSaving("idle"), 4000);
    }
  }

  async function savePackages() {
    setPackagesSaving("saving");
    try {
      const res = await fetch(`/api/listings/${form.id}/quick-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.linkedType,
          packages: form.packages,
        }),
      });
      if (!res.ok) throw new Error();
      setPackagesSaving("saved");
      setTimeout(() => setPackagesSaving("idle"), 3000);
    } catch {
      setPackagesSaving("error");
      setTimeout(() => setPackagesSaving("idle"), 4000);
    }
  }

  async function saveLocation() {
    setLocationSaving("saving");
    try {
      const res = await fetch(`/api/listings/${form.id}/quick-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.linkedType,
          locationInfo: form.locationInfo,
          googleMapsUrl: form.googleMapsUrl,
          googlePlaceId: form.googlePlaceId,
        }),
      });
      if (!res.ok) throw new Error();
      setLocationSaving("saved");
      setTimeout(() => setLocationSaving("idle"), 3000);
    } catch {
      setLocationSaving("error");
      setTimeout(() => setLocationSaving("idle"), 4000);
    }
  }

  function submitRequestChange() {
    setReqError("");
    const changed: Record<string, { from: string; to: string }> = {};
    if (reqName.trim()     !== listing.name)        changed.name     = { from: listing.name,        to: reqName.trim() };
    if (reqLocality.trim() !== listing.locality)    changed.locality = { from: listing.locality,    to: reqLocality.trim() };
    if (reqAddress.trim()  !== listing.fullAddress) changed.address  = { from: listing.fullAddress, to: reqAddress.trim() };
    if (reqCity.trim()     !== listing.city)        changed.city     = { from: listing.city,        to: reqCity.trim() };

    if (Object.keys(changed).length === 0) {
      setReqError("No changes detected.");
      return;
    }

    startReqTransition(async () => {
      const res = await fetch("/api/listings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedId: form.id,
          linkedType: form.linkedType,
          listingType: form.listingType,
          businessName: reqName.trim(),
          businessType: form.businessType,
          contactName: form.contactName,
          phone: form.phone,
          email: form.email,
          city: reqCity.trim(),
          locality: reqLocality.trim(),
          message: form.description,
          details: {
            _isEdit: true,
            _linkedId: form.id,
            _linkedType: form.linkedType,
            fullAddress: reqAddress.trim(),
            _changedFields: changed,
          },
          amenities: form.amenities,
        }),
      });
      if (!res.ok) { setReqError("Something went wrong. Please try again."); return; }
      setReqSubmitted(true);
    });
  }

  async function saveBlockedDates() {
    setDatesSaving("saving");
    try {
      const res = await fetch(`/api/listings/${form.id}/blocked-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: blockedDates }),
      });
      if (!res.ok) throw new Error();
      setDatesSaving("saved");
      setTimeout(() => setDatesSaving("idle"), 3000);
    } catch {
      setDatesSaving("error");
      setTimeout(() => setDatesSaving("idle"), 4000);
    }
  }

  function addBlockedDate() {
    if (!dateInput) return;
    if (!blockedDates.includes(dateInput)) setBlockedDates((d) => [...d, dateInput].sort());
    setDateInput("");
  }

  function submitPhotos() {
    const isSameAsExisting = keepImageIds.length === existingImages.length &&
      keepImageIds.every(id => existingImages.some(img => img.id === id));

    if (media.length === 0 && isSameAsExisting) {
      setPhotoError("No changes made. Add new photos/video or remove existing ones.");
      return;
    }
    setPhotoError("");
    startPhotoTransition(async () => {
      try {
        const res1 = await fetch("/api/listings/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            linkedId: form.id, linkedType: form.linkedType, listingType: form.listingType,
            businessName: form.name, businessType: form.businessType,
            contactName: form.contactName, phone: form.phone, email: form.email,
            city: form.city, locality: form.locality,
            details: { _isEdit: true, _linkedId: form.id, _linkedType: form.linkedType, _photosOnly: true, keepImageIds },
          }),
        });
        if (!res1.ok) throw new Error();
        const { id } = await res1.json();

        const allMedia = [...media.filter((m) => m.type === "image"), ...media.filter((m) => m.type === "video")];
        for (let i = 0; i < allMedia.length; i++) {
          const m = allMedia[i];
          setPhotoSubmitLabel(m.type === "image" ? `Uploading photo ${i + 1}/${allMedia.length}…` : "Uploading video…");
          const res2 = await fetch("/api/apply/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId: id, data: m.data, mimeType: m.mimeType, fileName: m.fileName, type: m.type, order: i }),
          });
          if (!res2.ok) throw new Error();
        }
        setPhotoSubmitted(true);
      } catch {
        setPhotoError("Upload failed. Please try again.");
        setPhotoSubmitLabel("Submit photos for review");
      }
    });
  }

  async function addFiles(files: FileList | null, type: "image" | "video") {
    if (!files) return;
    const currentCount = media.filter((m) => m.type === type).length;
    const existingCount = existingImages.filter(img => keepImageIds.includes(img.id) && img.type === type).length;
    const limit = type === "image" ? IMAGE_LIMIT : VIDEO_LIMIT;
    const toAdd = Array.from(files).slice(0, limit - (currentCount + existingCount));
    for (const file of toAdd) {
      if (type === "video" && file.size > VIDEO_MAX_MB * 1024 * 1024) {
        setPhotoError(`Video must be under ${VIDEO_MAX_MB}MB.`); continue;
      }
      const preview = URL.createObjectURL(file);
      if (type === "image") {
        const { data, mimeType } = await compressImage(file, IMAGE_MAX_BYTES);
        setMedia((m) => [...m, { data, mimeType, fileName: file.name, type, preview }]);
      } else {
        const data = await toBase64(file);
        setMedia((m) => [...m, { data, mimeType: file.type, fileName: file.name, type, preview }]);
      }
    }
    setPhotoError("");
  }

  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const isVenue = form.listingType === "venue" || form.listingType === "getaway";

  const tabsList = [
    "Quick updates",
    ...(form.listingType === "venue" ? ["Halls", "Packages", "Location details"] : []),
    "Request changes",
    "Blocked dates",
    "Photos & video"
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 28, borderBottom: "1px solid var(--line)", overflowX: "auto" }}>
        {tabsList.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "10px 16px", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
              border: "none", background: "transparent", cursor: "pointer",
              color: tab === t ? "var(--brand)" : "var(--ink-soft)",
              borderBottom: tab === t ? "2px solid var(--brand)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t}
            {t === "Blocked dates" && blockedDates.length > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 6px", borderRadius: 99, background: "var(--brand)", color: "#fff" }}>
                {blockedDates.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Quick updates ── */}
      {tab === "Quick updates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ padding: "10px 14px", background: "#f0fff4", borderRadius: 8, border: "1px solid #a6e6b4", fontSize: 13, color: "#1a6630" }}>
            Changes here go <strong>live immediately</strong> — no admin approval needed.
          </div>

          {/* Contact */}
          <div>
            <SectionHead title="Contact details" sub="Displayed on your listing and shared with enquiries." />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Phone">
                  <input style={inp} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210" />
                </Field>
                <Field label="WhatsApp (if different)">
                  <input style={inp} type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 " />
                </Field>
              </div>
              <Field label="Email">
                <input style={inp} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Pricing & capacity — venues */}
          {isVenue && (
            <div>
              <SectionHead title="Pricing" sub="Per-plate and hall rental shown on your listing page." />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <Field label="Veg plate (₹)">
                    <input style={inp} type="number" value={form.vegPlate} onChange={(e) => set("vegPlate", e.target.value)} />
                  </Field>
                  <Field label="NV plate (₹)">
                    <input style={inp} type="number" value={form.nvPlate} onChange={(e) => set("nvPlate", e.target.value)} />
                  </Field>
                  <Field label="Hall rent (₹)" note="per event">
                    <input style={inp} type="number" value={form.hallRent} onChange={(e) => set("hallRent", e.target.value)} />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <Field label="Min guests">
                    <input style={inp} type="number" value={form.capacityMin} onChange={(e) => set("capacityMin", e.target.value)} />
                  </Field>
                  <Field label="Max guests">
                    <input style={inp} type="number" value={form.capacityMax} onChange={(e) => set("capacityMax", e.target.value)} />
                  </Field>
                  <Field label="Min guarantee (₹)">
                    <input style={inp} type="number" value={form.minGuarantee} onChange={(e) => set("minGuarantee", e.target.value)} />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Car parking spaces">
                    <input style={inp} type="number" value={form.parking} onChange={(e) => set("parking", e.target.value)} />
                  </Field>
                  <Field label="Rooms on-site">
                    <input style={inp} type="number" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Pricing — vendors */}
          {form.listingType === "vendor" && (
            <div>
              <SectionHead title="Pricing & experience" sub="Shown on your profile." />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Starting price (₹)">
                  <input style={inp} type="number" value={form.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} />
                </Field>
                <Field label="Years of experience">
                  <input style={inp} type="number" value={form.yearsExp} onChange={(e) => set("yearsExp", e.target.value)} />
                </Field>
                <Field label="Weddings completed">
                  <input style={inp} type="number" value={form.completed} onChange={(e) => set("completed", e.target.value)} />
                </Field>
                <div />
              </div>
              <div style={{ marginTop: 12 }}>
                <Field label="Tagline">
                  <input style={inp} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder='e.g. "We tell stories, not just take photos."' />
                </Field>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <SectionHead title="About your listing" sub="Description shown on your page." />
            <textarea
              style={{ ...inp, height: 120, resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Amenities — venues */}
          {isVenue && (
            <div>
              <SectionHead title="Amenities" sub="Select all that apply to your venue." />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {VENUE_AMENITIES.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: form.amenities.includes(a) ? 600 : 400, border: `1px solid ${form.amenities.includes(a) ? "var(--brand)" : "var(--line)"}`, background: form.amenities.includes(a) ? "color-mix(in srgb,var(--brand) 10%,#fff)" : "#fff", color: form.amenities.includes(a) ? "var(--brand)" : "var(--ink-soft)" }}>
                    {a}
                  </button>
                ))}
                {form.amenities.filter((a) => !VENUE_AMENITIES.includes(a)).map((a) => (
                  <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px 7px 14px", borderRadius: 20, fontSize: 13, border: "1px solid var(--brand)", background: "color-mix(in srgb,var(--brand) 10%,#fff)", color: "var(--brand)", fontWeight: 600 }}>
                    {a}
                    <button type="button" onClick={() => toggleAmenity(a)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "var(--brand)", fontSize: 15, display: "flex", alignItems: "center" }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={customAmenityInput} onChange={(e) => setCustomAmenityInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                  placeholder="Add custom amenity…"
                  style={{ flex: 1, padding: "7px 14px", borderRadius: 20, fontSize: 13, border: "1px solid var(--line)", outline: "none", color: "var(--ink)" }} />
                <button type="button" onClick={addCustomAmenity} style={{ padding: "7px 18px", borderRadius: 20, fontSize: 13, border: "1px solid var(--brand)", background: "var(--brand)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                  + Add
                </button>
              </div>
            </div>
          )}

          {/* Save button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <button type="button" onClick={saveQuick} disabled={saveStatus === "saving"}
              style={{ flex: 1, padding: "13px", borderRadius: 8, border: "none", background: saveStatus === "error" ? "#c00" : "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: saveStatus === "saving" ? "not-allowed" : "pointer", opacity: saveStatus === "saving" ? 0.7 : 1 }}>
              {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "✓ Saved!" : saveStatus === "error" ? "Error — retry" : "Save changes"}
            </button>
            {saveStatus === "saved" && (
              <span style={{ fontSize: 13, color: "#1a6630" }}>Your listing is updated.</span>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Halls ── */}
      {tab === "Halls" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: "10px 14px", background: "#f0fff4", borderRadius: 8, border: "1px solid #a6e6b4", fontSize: 13, color: "#1a6630" }}>
            Changes here go <strong>live immediately</strong>.
          </div>

          <div>
            <SectionHead title="Manage Halls & capacities" sub="Configure halls, banquet areas, and lawns at your venue." />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {form.halls.map((hall, idx) => (
                <div key={idx} style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", position: "relative", display: "flex", gap: 16, alignItems: "center" }}>
                  {hall.ph && (hall.ph.startsWith("data:") || hall.ph.startsWith("http") || hall.ph.startsWith("/")) ? (
                    <img src={hall.ph} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 80, height: 60, borderRadius: 6, background: "var(--line)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--ink-mute)" }}>No Image</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <button type="button" onClick={() => {
                      setForm(f => ({ ...f, halls: f.halls.filter((_, i) => i !== idx) }));
                    }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 13 }}>Remove</button>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 6 }}>{hall.name || `Hall #${idx + 1}`}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-soft)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
                      <div>Type: <span style={{ color: "var(--ink)" }}>{hall.type}</span></div>
                      <div>Area: <span style={{ color: "var(--ink)" }}>{hall.area}</span></div>
                      <div>Theatre: <span style={{ color: "var(--ink)" }}>{hall.theatre}</span></div>
                      <div>Floating: <span style={{ color: "var(--ink)" }}>{hall.floating}</span></div>
                      <div>Dining: <span style={{ color: "var(--ink)" }}>{hall.dining}</span></div>
                    </div>
                  </div>
                </div>
              ))}
              {form.halls.length === 0 && (
                <div style={{ padding: "24px", textAlign: "center", border: "1px dashed var(--line)", borderRadius: 8, fontSize: 13, color: "var(--ink-mute)" }}>
                  No halls added yet. Add at least one hall or area below.
                </div>
              )}
            </div>

            <div style={{ border: "1px dashed var(--line)", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Add new hall / area</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Hall name">
                  <input id="edit-hall-name" style={inp} placeholder="e.g. Imperial Ballroom" />
                </Field>
                <Field label="Type">
                  <select id="edit-hall-type" style={inp}>
                    <option value="Indoor Banquet">Indoor Banquet</option>
                    <option value="Outdoor Lawn">Outdoor Lawn</option>
                    <option value="Poolside">Poolside</option>
                    <option value="Rooftop / Terrace">Rooftop / Terrace</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <Field label="Area (e.g. 5,000 sq.ft.)">
                    <input id="edit-hall-area" style={inp} placeholder="5,000 sqft" />
                  </Field>
                </div>
                <Field label="Theatre">
                  <input id="edit-hall-theatre" type="number" style={inp} placeholder="150" />
                </Field>
                <Field label="Floating">
                  <input id="edit-hall-floating" type="number" style={inp} placeholder="300" />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Dining capacity">
                  <input id="edit-hall-dining" type="number" style={inp} placeholder="100" />
                </Field>
                <Field label="Hall Image (Optional)">
                  <input id="edit-hall-image-file" type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const { data } = await compressImage(file, IMAGE_MAX_BYTES);
                      setTempHallImage(`data:image/jpeg;base64,${data}`);
                    } else {
                      setTempHallImage("");
                    }
                  }} style={{ ...inp, padding: "6px 12px" }} />
                </Field>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => {
                  const nameEl = document.getElementById("edit-hall-name") as HTMLInputElement;
                  const typeEl = document.getElementById("edit-hall-type") as HTMLSelectElement;
                  const areaEl = document.getElementById("edit-hall-area") as HTMLInputElement;
                  const theatreEl = document.getElementById("edit-hall-theatre") as HTMLInputElement;
                  const floatingEl = document.getElementById("edit-hall-floating") as HTMLInputElement;
                  const diningEl = document.getElementById("edit-hall-dining") as HTMLInputElement;
                  const fileInput = document.getElementById("edit-hall-image-file") as HTMLInputElement;
                  
                  if (!nameEl.value.trim()) return alert("Please enter hall name");
                  
                  const newHall = {
                    name: nameEl.value.trim(),
                    type: typeEl.value,
                    area: areaEl.value.trim() || "N/A",
                    theatre: Number(theatreEl.value) || 0,
                    floating: Number(floatingEl.value) || 0,
                    dining: Number(diningEl.value) || 0,
                    ph: tempHallImage || "v2"
                  };
                  
                  setForm(f => ({ ...f, halls: [...f.halls, newHall] }));
                  setTempHallImage("");
                  nameEl.value = "";
                  areaEl.value = "";
                  theatreEl.value = "";
                  floatingEl.value = "";
                  diningEl.value = "";
                  if (fileInput) fileInput.value = "";
                }} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  + Add to list
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <button type="button" onClick={saveHalls} disabled={hallsSaving === "saving"}
                style={{ flex: 1, padding: "13px", borderRadius: 8, border: "none", background: hallsSaving === "error" ? "#c00" : "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: hallsSaving === "saving" ? "not-allowed" : "pointer", opacity: hallsSaving === "saving" ? 0.7 : 1 }}>
                {hallsSaving === "saving" ? "Saving…" : hallsSaving === "saved" ? "✓ Halls saved!" : hallsSaving === "error" ? "Error — retry" : "Save halls"}
              </button>
              {hallsSaving === "saved" && (
                <span style={{ fontSize: 13, color: "#1a6630" }}>Halls updated successfully.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Packages ── */}
      {tab === "Packages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: "10px 14px", background: "#f0fff4", borderRadius: 8, border: "1px solid #a6e6b4", fontSize: 13, color: "#1a6630" }}>
            Changes here go <strong>live immediately</strong>.
          </div>

          <div>
            <SectionHead title="Manage packages & pricing" sub="Configure custom catering or booking packages." />
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {form.packages.map((pkg, idx) => (
                <div key={idx} style={{ padding: 16, border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", position: "relative" }}>
                  <button type="button" onClick={() => {
                    setForm(f => ({ ...f, packages: f.packages.filter((_, i) => i !== idx) }));
                  }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#c00", cursor: "pointer", fontSize: 13 }}>Remove</button>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>{pkg.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--brand)", margin: "2px 0 6px" }}>₹{pkg.pricePerPlate} per plate</div>
                  {pkg.features.length > 0 && (
                    <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 2 }}>
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx}>{feat}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {form.packages.length === 0 && (
                <div style={{ padding: "24px", textAlign: "center", border: "1px dashed var(--line)", borderRadius: 8, fontSize: 13, color: "var(--ink-mute)" }}>
                  No packages added yet. Define packages below.
                </div>
              )}
            </div>

            <div style={{ border: "1px dashed var(--line)", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Add new package</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Package name">
                  <input id="edit-pkg-name" style={inp} placeholder="e.g. Premium Gold Buffet" />
                </Field>
                <Field label="Price per plate (₹)">
                  <input id="edit-pkg-price" type="number" style={inp} placeholder="1500" />
                </Field>
              </div>
              
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>Package features</label>
                <div id="edit-pkg-features-list" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input id="edit-pkg-feature-input" style={{ ...inp, flex: 1 }} placeholder="e.g. 5 Welcome Drinks" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const featInput = document.getElementById("edit-pkg-feature-input") as HTMLInputElement;
                      const featVal = featInput.value.trim();
                      if (!featVal) return;
                      
                      const listEl = document.getElementById("edit-pkg-features-list");
                      if (listEl) {
                        const tag = document.createElement("span");
                        tag.className = "edit-pkg-feat-tag";
                        tag.setAttribute("style", "display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; background: var(--line); color: var(--ink); font-size: 12px; font-weight: 500;");
                        tag.innerHTML = `${featVal} <button type="button" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--ink-soft); padding: 0;" onclick="this.parentElement.remove()">×</button>`;
                        listEl.appendChild(tag);
                      }
                      featInput.value = "";
                    }
                  }} />
                  <button type="button" onClick={() => {
                    const featInput = document.getElementById("edit-pkg-feature-input") as HTMLInputElement;
                    const featVal = featInput.value.trim();
                    if (!featVal) return;
                    
                    const listEl = document.getElementById("edit-pkg-features-list");
                    if (listEl) {
                      const tag = document.createElement("span");
                      tag.className = "edit-pkg-feat-tag";
                      tag.setAttribute("style", "display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; background: var(--line); color: var(--ink); font-size: 12px; font-weight: 500;");
                      tag.innerHTML = `${featVal} <button type="button" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--ink-soft); padding: 0;" onclick="this.parentElement.remove()">×</button>`;
                      listEl.appendChild(tag);
                    }
                    featInput.value = "";
                  }} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    Add feature
                  </button>
                </div>
              </div>

              <button type="button" onClick={() => {
                const nameEl = document.getElementById("edit-pkg-name") as HTMLInputElement;
                const priceEl = document.getElementById("edit-pkg-price") as HTMLInputElement;
                const listEl = document.getElementById("edit-pkg-features-list");
                
                if (!nameEl.value.trim()) return alert("Please enter package name");
                if (!priceEl.value.trim()) return alert("Please enter package price");
                
                const features: string[] = [];
                if (listEl) {
                  const tags = listEl.getElementsByClassName("edit-pkg-feat-tag");
                  for (let i = 0; i < tags.length; i++) {
                    const txt = (tags[i] as HTMLElement).innerText.slice(0, -2).trim();
                    if (txt) features.push(txt);
                  }
                }
                
                const newPkg = {
                  name: nameEl.value.trim(),
                  pricePerPlate: Number(priceEl.value) || 0,
                  features
                };
                
                setForm(f => ({ ...f, packages: [...f.packages, newPkg] }));
                nameEl.value = "";
                priceEl.value = "";
                if (listEl) listEl.innerHTML = "";
              }} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
                + Add Package to list
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <button type="button" onClick={savePackages} disabled={packagesSaving === "saving"}
                style={{ flex: 1, padding: "13px", borderRadius: 8, border: "none", background: packagesSaving === "error" ? "#c00" : "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: packagesSaving === "saving" ? "not-allowed" : "pointer", opacity: packagesSaving === "saving" ? 0.7 : 1 }}>
                {packagesSaving === "saving" ? "Saving…" : packagesSaving === "saved" ? "✓ Packages saved!" : packagesSaving === "error" ? "Error — retry" : "Save packages"}
              </button>
              {packagesSaving === "saved" && (
                <span style={{ fontSize: 13, color: "#1a6630" }}>Packages updated successfully.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Location details ── */}
      {tab === "Location details" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: "10px 14px", background: "#f0fff4", borderRadius: 8, border: "1px solid #a6e6b4", fontSize: 13, color: "#1a6630" }}>
            Changes here go <strong>live immediately</strong>.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SectionHead title="Maps & transit proximities" sub="Maps links and transit details shown on your page." />
            
            <Field label="Google Maps URL">
              <input style={inp} value={form.googleMapsUrl} onChange={(e) => set("googleMapsUrl", e.target.value)} placeholder="https://maps.app.goo.gl/..." />
            </Field>
            
            <Field label="Google Place ID">
              <input style={inp} value={form.googlePlaceId} onChange={(e) => set("googlePlaceId", e.target.value)} placeholder="e.g. ChIJ..." />
            </Field>

            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginTop: 10 }}>Transit distances</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Distance to Airport">
                <input style={inp} value={form.locationInfo.airport || ""} onChange={(e) => {
                  const val = e.target.value;
                  setForm(f => ({ ...f, locationInfo: { ...f.locationInfo, airport: val } }));
                }} placeholder="e.g. 12 km" />
              </Field>
              
              <Field label="Distance to Railway Station">
                <input style={inp} value={form.locationInfo.railway || ""} onChange={(e) => {
                  const val = e.target.value;
                  setForm(f => ({ ...f, locationInfo: { ...f.locationInfo, railway: val } }));
                }} placeholder="e.g. 5 km" />
              </Field>
            </div>
            
            <Field label="Nearby Hotel Clusters">
              <input style={inp} value={form.locationInfo.hotelCluster || ""} onChange={(e) => {
                const val = e.target.value;
                setForm(f => ({ ...f, locationInfo: { ...f.locationInfo, hotelCluster: val } }));
              }} placeholder="e.g. 3 km from airport hotels" />
            </Field>

            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid var(--line)", marginTop: 8 }}>
              <button type="button" onClick={saveLocation} disabled={locationSaving === "saving"}
                style={{ flex: 1, padding: "13px", borderRadius: 8, border: "none", background: locationSaving === "error" ? "#c00" : "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: locationSaving === "saving" ? "not-allowed" : "pointer", opacity: locationSaving === "saving" ? 0.7 : 1 }}>
                {locationSaving === "saving" ? "Saving…" : locationSaving === "saved" ? "✓ Location saved!" : locationSaving === "error" ? "Error — retry" : "Save location details"}
              </button>
              {locationSaving === "saved" && (
                <span style={{ fontSize: 13, color: "#1a6630" }}>Location details updated successfully.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Request changes ── */}
      {tab === "Request changes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: "10px 14px", background: "#fff8e8", borderRadius: 8, border: "1px solid #f5d87a", fontSize: 13, color: "#7a5a00" }}>
            These changes affect how your listing appears in search and require <strong>admin approval</strong> (within 48 hours).
          </div>

          {reqSubmitted ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 6 }}>Request submitted</div>
              <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Your change request is under review. We&apos;ll update your listing within 48 hours.</p>
              <button type="button" onClick={() => setReqSubmitted(false)} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, border: "1px solid var(--line)", background: "transparent", fontSize: 13, cursor: "pointer", color: "var(--ink)" }}>
                Make another request
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Business / venue name">
                  <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 4 }}>Current: <em>{listing.name}</em></div>
                  <input style={inp} value={reqName} onChange={(e) => setReqName(e.target.value)} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="City">
                    <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 4 }}>Current: <em>{listing.city}</em></div>
                    <input style={inp} value={reqCity} onChange={(e) => setReqCity(e.target.value)} />
                  </Field>
                  <Field label="Locality / area">
                    <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 4 }}>Current: <em>{listing.locality}</em></div>
                    <input style={inp} value={reqLocality} onChange={(e) => setReqLocality(e.target.value)} />
                  </Field>
                </div>
                <Field label="Full address">
                  <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 4 }}>Current: <em>{listing.fullAddress || "—"}</em></div>
                  <input style={inp} value={reqAddress} onChange={(e) => setReqAddress(e.target.value)} />
                </Field>
              </div>
              {reqError && (
                <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, fontSize: 13, color: "#c00" }}>
                  {reqError}
                </div>
              )}
              <button type="button" onClick={submitRequestChange} disabled={isPendingReq}
                style={{ padding: "13px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: isPendingReq ? "not-allowed" : "pointer", opacity: isPendingReq ? 0.7 : 1 }}>
                {isPendingReq ? "Submitting…" : "Submit for review"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Blocked dates ── */}
      {tab === "Blocked dates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {form.linkedType !== "venue" ? (
            <p style={{ fontSize: 14, color: "var(--ink-soft)", padding: "20px 0" }}>Blocked dates are only available for venue listings.</p>
          ) : (
            <>
              <div>
                <SectionHead title="Mark unavailable dates" sub="Dates shown as blocked to users checking availability. Saves instantly." />
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input type="date" min={minDate} value={dateInput} onChange={(e) => setDateInput(e.target.value)}
                    style={{ ...inp, flex: 1 }} />
                  <button type="button" onClick={addBlockedDate} disabled={!dateInput}
                    style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: dateInput ? "pointer" : "not-allowed", opacity: dateInput ? 1 : 0.5, whiteSpace: "nowrap" }}>
                    + Block date
                  </button>
                </div>

                {blockedDates.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", border: "1px dashed var(--line)", borderRadius: 8, fontSize: 13, color: "var(--ink-mute)" }}>
                    No dates blocked. Your venue shows as available for all dates.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {blockedDates.map((d) => (
                      <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px 6px 12px", borderRadius: 20, background: "#fff0f0", border: "1px solid #fcc", fontSize: 13, color: "#c00" }}>
                        {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        <button type="button" onClick={() => setBlockedDates((prev) => prev.filter((x) => x !== d))}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#c00", fontSize: 15, padding: 0, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                <button type="button" onClick={saveBlockedDates} disabled={datesSaving === "saving"}
                  style={{ flex: 1, padding: "13px", borderRadius: 8, border: "none", background: datesSaving === "error" ? "#c00" : "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: datesSaving === "saving" ? "not-allowed" : "pointer", opacity: datesSaving === "saving" ? 0.7 : 1 }}>
                  {datesSaving === "saving" ? "Saving…" : datesSaving === "saved" ? "✓ Dates saved!" : datesSaving === "error" ? "Error — retry" : "Save blocked dates"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Photos & video ── */}
      {tab === "Photos & video" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: "10px 14px", background: "#fff8e8", borderRadius: 8, border: "1px solid #f5d87a", fontSize: 13, color: "#7a5a00" }}>
            New media will be added or removed from your listing after <strong>admin approval</strong>.
          </div>

          {photoSubmitted ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 6 }}>Changes submitted</div>
              <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>We&apos;ll update your gallery once reviewed.</p>
            </div>
          ) : (
            <>
              {/* Existing Media Gallery */}
              {existingImages.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 8 }}>
                    Existing media
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
                    {existingImages.map((img, i) => {
                      const isKept = keepImageIds.includes(img.id);
                      return (
                        <div
                          key={img.id}
                          style={{
                            position: "relative",
                            aspectRatio: "4/3",
                            borderRadius: 8,
                            overflow: "hidden",
                            border: `1px solid ${isKept ? "var(--line)" : "transparent"}`,
                            opacity: isKept ? 1 : 0.45,
                            transition: "all 0.2s ease",
                            background: isKept ? "transparent" : "#ffebee",
                          }}
                        >
                          {img.type === "image" ? (
                            <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <video src={img.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                          
                          {/* Order Badges and Reorder Controls */}
                          {isKept && (
                            <div style={{ position: "absolute", top: 4, left: 4, display: "flex", gap: 4 }}>
                              <span style={{ background: i === 0 ? "var(--brand)" : "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                                {i === 0 ? "Display Image" : `#${i + 1}`}
                              </span>
                            </div>
                          )}

                          {isKept && (
                            <div style={{ position: "absolute", bottom: 4, right: 4, display: "flex", gap: 4 }}>
                              {i > 0 && (
                                <button type="button" onClick={() => reorderExistingImages(-1, i)} style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>←</button>
                              )}
                              {i < existingImages.length - 1 && (
                                <button type="button" onClick={() => reorderExistingImages(1, i)} style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>→</button>
                              )}
                            </div>
                          )}
                          
                          {isKept ? (
                            <button
                              type="button"
                              onClick={() => setKeepImageIds((prev) => prev.filter((id) => id !== img.id))}
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: "rgba(192, 0, 0, 0.8)",
                                border: "none",
                                color: "#fff",
                                cursor: "pointer",
                                fontSize: 14,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Remove image"
                            >
                              ×
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setKeepImageIds((prev) => [...prev, img.id])}
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.55)",
                                border: "none",
                                color: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 600,
                                gap: 2,
                              }}
                            >
                              <span>Remove requested</span>
                              <span style={{ textDecoration: "underline", fontSize: 10 }}>Restore</span>
                            </button>
                          )}
                          
                          {img.type === "video" && isKept && (
                            <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>
                              🎬 Video
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploading new photos */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 8 }}>
                  Upload new photos (max {IMAGE_LIMIT} total)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
                  {media.filter((m) => m.type === "image").map((m, i) => (
                    <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
                      <img src={m.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={() => { setMedia((prev) => { URL.revokeObjectURL(prev[prev.findIndex((x) => x.preview === m.preview)].preview); return prev.filter((_, j) => j !== prev.findIndex((x) => x.preview === m.preview)); }); }}
                        style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  ))}
                  {media.filter((m) => m.type === "image").length + existingImages.filter(img => keepImageIds.includes(img.id) && img.type === "image").length < IMAGE_LIMIT && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      style={{ aspectRatio: "4/3", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--ink-mute)", fontSize: 12 }}>
                      <span style={{ fontSize: 22 }}>+</span>Add photo
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files, "image"); e.target.value = ""; }} />
              </div>

              {/* Uploading new video */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 8 }}>
                  Upload new video (optional, max {VIDEO_LIMIT} total, max {VIDEO_MAX_MB}MB)
                </label>
                {media.filter((m) => m.type === "video").length + existingImages.filter(img => keepImageIds.includes(img.id) && img.type === "video").length === 0 ? (
                  <button type="button" onClick={() => videoRef.current?.click()}
                    style={{ width: "100%", padding: "16px", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)", cursor: "pointer", color: "var(--ink-mute)", fontSize: 13 }}>
                    + Add short video
                  </button>
                ) : (
                  <div>
                    {media.filter((m) => m.type === "video").length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 8 }}>
                        <span style={{ fontSize: 20 }}>🎬</span>
                        <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{media.find((m) => m.type === "video")?.fileName}</span>
                        <button type="button" onClick={() => setMedia((prev) => prev.filter((m) => m.type !== "video"))} style={{ fontSize: 13, color: "#c00", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 8, background: "#f9f9f9" }}>
                        <span style={{ fontSize: 20 }}>🎬</span>
                        <span style={{ flex: 1, fontSize: 13, color: "var(--ink-soft)" }}>Existing video kept. Remove it from &quot;Existing media&quot; above to replace.</span>
                      </div>
                    )}
                  </div>
                )}
                <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files, "video"); e.target.value = ""; }} />
              </div>

              {photoError && (
                <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, fontSize: 13, color: "#c00" }}>
                  {photoError}
                </div>
              )}
              
              <button type="button" onClick={submitPhotos}
                disabled={isPhotoSubmitting || (media.length === 0 && keepImageIds.length === existingImages.length && keepImageIds.every(id => existingImages.some(img => img.id === id)))}
                style={{
                  padding: "13px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--brand)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: (isPhotoSubmitting || (media.length === 0 && keepImageIds.length === existingImages.length && keepImageIds.every(id => existingImages.some(img => img.id === id)))) ? "not-allowed" : "pointer",
                  opacity: (isPhotoSubmitting || (media.length === 0 && keepImageIds.length === existingImages.length && keepImageIds.every(id => existingImages.some(img => img.id === id)))) ? 0.6 : 1
                }}>
                {isPhotoSubmitting ? photoSubmitLabel : "Submit photos for review"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

async function compressImage(file: File, maxBytes: number): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const MAX_DIM = 1920;
      if (width > MAX_DIM || height > MAX_DIM) {
        const scale = MAX_DIM / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      let quality = 0.85;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > maxBytes * (4 / 3) + 30 && quality > 0.3) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      resolve({ data: dataUrl.split(",")[1], mimeType: "image/jpeg" });
    };
    img.onerror = () => { URL.revokeObjectURL(url); toBase64(file).then((data) => resolve({ data, mimeType: file.type })); };
    img.src = url;
  });
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
