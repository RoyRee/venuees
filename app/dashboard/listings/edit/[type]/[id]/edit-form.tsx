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
const IMAGE_LIMIT = 5;
const VIDEO_LIMIT = 1;
const IMAGE_MAX_BYTES = 600 * 1024;
const VIDEO_MAX_MB = 3;

const TABS = ["Quick updates", "Request changes", "Blocked dates", "Photos & video"] as const;
type Tab = typeof TABS[number];

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
  existingImageCount,
}: {
  listing: EditListingData;
  existingImageCount: number;
}) {
  const [tab, setTab] = useState<Tab>("Quick updates");
  const [form, setForm] = useState<EditListingData>({ ...listing });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

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

  const set = (k: keyof EditListingData, v: string) => setForm((f) => ({ ...f, [k]: v }));
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
    if (media.length === 0) { setPhotoError("Add at least one photo."); return; }
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
            details: { _isEdit: true, _linkedId: form.id, _linkedType: form.linkedType, _photosOnly: true },
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
    const limit = type === "image" ? IMAGE_LIMIT : VIDEO_LIMIT;
    const toAdd = Array.from(files).slice(0, limit - currentCount);
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

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 28, borderBottom: "1px solid var(--line)", overflowX: "auto" }}>
        {TABS.map((t) => (
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
            New photos replace your existing gallery after <strong>admin approval</strong>.
          </div>

          {photoSubmitted ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 6 }}>Photos submitted</div>
              <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>We&apos;ll update your gallery once reviewed.</p>
            </div>
          ) : (
            <>
              {existingImageCount > 0 && media.filter((m) => m.type === "image").length === 0 && (
                <div style={{ padding: "12px 16px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13, color: "var(--ink-soft)" }}>
                  You currently have <strong>{existingImageCount} photo{existingImageCount !== 1 ? "s" : ""}</strong>. Upload new photos to replace them.
                </div>
              )}
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
                  {media.filter((m) => m.type === "image").map((m, i) => (
                    <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
                      <img src={m.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={() => { setMedia((prev) => { URL.revokeObjectURL(prev[prev.findIndex((x) => x.preview === m.preview)].preview); return prev.filter((_, j) => j !== prev.findIndex((x) => x.preview === m.preview)); }); }}
                        style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  ))}
                  {media.filter((m) => m.type === "image").length < IMAGE_LIMIT && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      style={{ aspectRatio: "4/3", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--ink-mute)", fontSize: 12 }}>
                      <span style={{ fontSize: 22 }}>+</span>Add photo
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files, "image"); e.target.value = ""; }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 8 }}>
                  Intro video (optional, max {VIDEO_MAX_MB}MB)
                </label>
                {media.filter((m) => m.type === "video").length === 0 ? (
                  <button type="button" onClick={() => videoRef.current?.click()}
                    style={{ width: "100%", padding: "16px", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)", cursor: "pointer", color: "var(--ink-mute)", fontSize: 13 }}>
                    + Add short video
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 8 }}>
                    <span style={{ fontSize: 20 }}>🎬</span>
                    <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{media.find((m) => m.type === "video")?.fileName}</span>
                    <button type="button" onClick={() => setMedia((prev) => prev.filter((m) => m.type !== "video"))} style={{ fontSize: 13, color: "#c00", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                  </div>
                )}
                <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files, "video"); e.target.value = ""; }} />
              </div>

              {photoError && (
                <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, fontSize: 13, color: "#c00" }}>
                  {photoError}
                </div>
              )}
              <button type="button" onClick={submitPhotos} disabled={isPhotoSubmitting || media.length === 0}
                style={{ padding: "13px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: (isPhotoSubmitting || media.length === 0) ? "not-allowed" : "pointer", opacity: (isPhotoSubmitting || media.length === 0) ? 0.6 : 1 }}>
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
