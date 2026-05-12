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
}

interface MediaFile {
  data: string;
  mimeType: string;
  fileName: string;
  type: "image" | "video";
  preview: string;
}

const VENUE_AMENITIES = ["AC Halls", "Outdoor Lawn", "Parking", "In-house Catering", "Outside Catering Allowed", "DJ Allowed", "Valet Parking", "Bridal Suite", "Swimming Pool", "Accommodation", "Generator Backup", "Décor Allowed"];
const IMAGE_LIMIT = 5;
const VIDEO_LIMIT = 1;
const IMAGE_MAX_BYTES = 600 * 1024;
const VIDEO_MAX_MB = 3;
const TOTAL_STEPS = 5;

function Steps({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= current ? "var(--brand)" : "var(--line)", opacity: i === current ? 1 : i < current ? 0.5 : 0.25, transition: "all 0.2s" }} />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, background: "#fff", color: "var(--ink)", boxSizing: "border-box" };

export function EditListingForm({
  listing,
  existingImageCount,
}: {
  listing: EditListingData;
  existingImageCount: number;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<EditListingData>({ ...listing });
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [error, setError] = useState("");
  const [submitLabel, setSubmitLabel] = useState("Submit for review");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof EditListingData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));

  async function addFiles(files: FileList | null, type: "image" | "video") {
    if (!files) return;
    const currentCount = media.filter((m) => m.type === type).length;
    const limit = type === "image" ? IMAGE_LIMIT : VIDEO_LIMIT;
    const toAdd = Array.from(files).slice(0, limit - currentCount);
    for (const file of toAdd) {
      if (type === "video" && file.size > VIDEO_MAX_MB * 1024 * 1024) {
        setError(`Video must be under ${VIDEO_MAX_MB}MB.`);
        continue;
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
    setError("");
  }

  function removeMedia(i: number) {
    setMedia((m) => { URL.revokeObjectURL(m[i].preview); return m.filter((_, j) => j !== i); });
  }

  function validate(): string {
    if (step === 0) {
      if (!form.name.trim()) return "Business name is required.";
      if (!form.contactName.trim()) return "Contact name is required.";
      if (!form.phone.trim()) return "Phone is required.";
      if (!form.email.trim()) return "Email is required.";
    }
    return "";
  }

  function next() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  }

  function submit() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");

    startTransition(async () => {
      try {
        const details: Record<string, unknown> = {};
        if (form.fullAddress) details.fullAddress = form.fullAddress;
        if (form.instagram)   details.instagram   = form.instagram;
        if (form.whatsapp)    details.whatsapp    = form.whatsapp;

        if (form.listingType === "venue") {
          details.capacityMin  = form.capacityMin;
          details.capacityMax  = form.capacityMax;
          details.vegPlate     = form.vegPlate;
          details.nvPlate      = form.nvPlate;
          details.hallRent     = form.hallRent;
          details.parking      = form.parking;
          details.rooms        = form.rooms;
          details.minGuarantee = form.minGuarantee;
        } else if (form.listingType === "vendor") {
          details.priceFrom = form.priceFrom;
          details.yearsExp  = form.yearsExp;
          details.tagline   = form.tagline;
          details.completed = form.completed;
        } else if (form.listingType === "getaway") {
          details.capacityMin  = form.capacityMin;
          details.capacityMax  = form.capacityMax;
          details.vegPlate     = form.vegPlate;
          details.nvPlate      = form.nvPlate;
          details.parking      = form.parking;
          details.minGuarantee = form.minGuarantee;
        }

        setSubmitLabel("Saving changes…");
        const res1 = await fetch("/api/listings/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            linkedId: form.id,
            linkedType: form.linkedType,
            listingType: form.listingType,
            businessName: form.name,
            businessType: form.businessType,
            contactName: form.contactName,
            phone: form.phone,
            email: form.email,
            city: form.city,
            locality: form.locality,
            website: form.website || null,
            message: form.description,
            details,
            amenities: form.amenities,
          }),
        });

        if (!res1.ok) {
          const d = await res1.json().catch(() => ({}));
          setError(d.error ?? "Something went wrong. Please try again.");
          setSubmitLabel("Submit for review");
          return;
        }
        const { id } = await res1.json();

        // Phase 2: upload each media file separately
        const imageFiles = media.filter((m) => m.type === "image");
        const videoFiles = media.filter((m) => m.type === "video");
        const allMedia = [...imageFiles, ...videoFiles];

        for (let i = 0; i < allMedia.length; i++) {
          const m = allMedia[i];
          setSubmitLabel(
            m.type === "image"
              ? `Uploading photo ${imageFiles.indexOf(m) + 1} of ${imageFiles.length}…`
              : "Uploading video…"
          );
          const res2 = await fetch("/api/apply/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              applicationId: id,
              data: m.data,
              mimeType: m.mimeType,
              fileName: m.fileName,
              type: m.type,
              order: i,
            }),
          });
          if (!res2.ok) {
            setError(`Failed to upload ${m.type}. Please try again.`);
            setSubmitLabel("Submit for review");
            return;
          }
        }

        setSubmitted(true);
      } catch {
        setError("Network error. Please check your connection and try again.");
        setSubmitLabel("Submit for review");
      }
    });
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "color-mix(in srgb,var(--brand) 12%,#fff)", border: "2px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 26 }}>✓</div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 10 }}>Edit submitted!</h2>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 360, margin: "0 auto 24px" }}>
          Your changes are under review. We&rsquo;ll update your live listing within 48 hours once approved.
        </p>
        <a href="/dashboard/listings" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, background: "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          Back to listings
        </a>
      </div>
    );
  }

  return (
    <div>
      <Steps current={step} />

      {/* Step 0: Basic details */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 4 }}>Basic details</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Contact info and location shown on your listing.</p>
          </div>
          <Field label="Business name">
            <input style={inp} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Owner / manager name">
            <input style={inp} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Phone">
              <input style={inp} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="WhatsApp (if different)">
              <input style={inp} type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 " />
            </Field>
          </div>
          <Field label="Email">
            <input style={inp} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="City">
              <input style={inp} value={form.city} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field label="Locality / area">
              <input style={inp} value={form.locality} onChange={(e) => set("locality", e.target.value)} />
            </Field>
          </div>
          <Field label="Full address">
            <input style={inp} value={form.fullAddress} onChange={(e) => set("fullAddress", e.target.value)} placeholder="e.g. Plot 12, Wardha Road, Nagpur – 440025" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Website (optional)">
              <input style={inp} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yoursite.com" />
            </Field>
            <Field label="Instagram (optional)">
              <input style={inp} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@yourhandle" />
            </Field>
          </div>
        </div>
      )}

      {/* Step 1: Listing specifics */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 4 }}>Listing details</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Pricing and capacity shown on your page.</p>
          </div>

          {form.listingType === "venue" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Min guests"><input style={inp} type="number" value={form.capacityMin} onChange={(e) => set("capacityMin", e.target.value)} /></Field>
              <Field label="Max guests"><input style={inp} type="number" value={form.capacityMax} onChange={(e) => set("capacityMax", e.target.value)} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Veg plate (₹)"><input style={inp} type="number" value={form.vegPlate} onChange={(e) => set("vegPlate", e.target.value)} /></Field>
              <Field label="NV plate (₹)"><input style={inp} type="number" value={form.nvPlate} onChange={(e) => set("nvPlate", e.target.value)} /></Field>
              <Field label="Hall rent (₹)"><input style={inp} type="number" value={form.hallRent} onChange={(e) => set("hallRent", e.target.value)} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Car parking spaces"><input style={inp} type="number" value={form.parking} onChange={(e) => set("parking", e.target.value)} /></Field>
              <Field label="Rooms on-site"><input style={inp} type="number" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} /></Field>
              <Field label="Min booking guarantee (₹)"><input style={inp} type="number" value={form.minGuarantee} onChange={(e) => set("minGuarantee", e.target.value)} /></Field>
            </div>
          </>}

          {form.listingType === "vendor" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Starting price (₹)"><input style={inp} type="number" value={form.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} /></Field>
              <Field label="Years of experience"><input style={inp} type="number" value={form.yearsExp} onChange={(e) => set("yearsExp", e.target.value)} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Weddings completed"><input style={inp} type="number" value={form.completed} onChange={(e) => set("completed", e.target.value)} /></Field>
              <div />
            </div>
            <Field label="Your tagline">
              <input style={inp} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder='e.g. "We tell stories, not just take photos."' />
            </Field>
          </>}

          {form.listingType === "getaway" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="No. of rooms / cottages"><input style={inp} type="number" value={form.capacityMin} onChange={(e) => set("capacityMin", e.target.value)} /></Field>
              <Field label="Max guests"><input style={inp} type="number" value={form.capacityMax} onChange={(e) => set("capacityMax", e.target.value)} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Weekday rate (₹/night)"><input style={inp} type="number" value={form.vegPlate} onChange={(e) => set("vegPlate", e.target.value)} /></Field>
              <Field label="Weekend rate (₹/night)"><input style={inp} type="number" value={form.nvPlate} onChange={(e) => set("nvPlate", e.target.value)} /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Car parking spaces"><input style={inp} type="number" value={form.parking} onChange={(e) => set("parking", e.target.value)} /></Field>
              <Field label="Min booking guarantee (₹)"><input style={inp} type="number" value={form.minGuarantee} onChange={(e) => set("minGuarantee", e.target.value)} /></Field>
            </div>
          </>}
        </div>
      )}

      {/* Step 2: Description + amenities */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 4 }}>About your business</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Description and amenities shown on your listing page.</p>
          </div>
          <Field label="Description">
            <textarea
              style={{ ...inp, height: 140, resize: "vertical" }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
          {form.listingType === "venue" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 10 }}>Amenities</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {VENUE_AMENITIES.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    style={{ padding: "7px 14px", borderRadius: 20, fontSize: 13, border: `1px solid ${form.amenities.includes(a) ? "var(--brand)" : "var(--line)"}`, background: form.amenities.includes(a) ? "color-mix(in srgb,var(--brand) 10%,#fff)" : "#fff", color: form.amenities.includes(a) ? "var(--brand)" : "var(--ink-soft)", cursor: "pointer", fontWeight: form.amenities.includes(a) ? 600 : 400 }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Photos & video */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 4 }}>Photos & video</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Upload new photos to replace your current ones, or leave empty to keep them.</p>
          </div>

          {existingImageCount > 0 && media.filter((m) => m.type === "image").length === 0 && (
            <div style={{ padding: "12px 16px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13, color: "var(--ink-soft)" }}>
              📷 You currently have <strong>{existingImageCount} photo{existingImageCount !== 1 ? "s" : ""}</strong>. Upload new photos below to replace them, or continue to keep your existing photos.
            </div>
          )}

          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
              {media.filter((m) => m.type === "image").map((m, i) => (
                <div key={i} style={{ position: "relative", aspectRatio: "4/3", borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
                  <img src={m.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => removeMedia(media.indexOf(m))} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              ))}
              {media.filter((m) => m.type === "image").length < IMAGE_LIMIT && (
                <button type="button" onClick={() => fileRef.current?.click()} style={{ aspectRatio: "4/3", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--ink-mute)", fontSize: 12 }}>
                  <span style={{ fontSize: 22 }}>+</span>Add photo
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files, "image"); e.target.value = ""; }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 8 }}>Intro video (optional, max {VIDEO_MAX_MB}MB)</label>
            {media.filter((m) => m.type === "video").length === 0 ? (
              <button type="button" onClick={() => videoRef.current?.click()} style={{ width: "100%", padding: "16px", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)", cursor: "pointer", color: "var(--ink-mute)", fontSize: 13 }}>
                + Add short video
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 8 }}>
                <span style={{ fontSize: 20 }}>🎬</span>
                <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{media.find((m) => m.type === "video")?.fileName}</span>
                <button type="button" onClick={() => removeMedia(media.findIndex((m) => m.type === "video"))} style={{ fontSize: 13, color: "#c00", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
              </div>
            )}
            <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files, "video"); e.target.value = ""; }} />
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", marginBottom: 4 }}>Review & submit</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Your changes will go live after admin approval (within 48 hours).</p>
          </div>
          {[
            { label: "Business", value: form.name },
            { label: "Category", value: form.businessType },
            { label: "Contact", value: `${form.contactName} · ${form.phone}` },
            { label: "Location", value: `${form.locality ? form.locality + ", " : ""}${form.city}` },
            { label: "New photos", value: `${media.filter((m) => m.type === "image").length} uploaded${media.filter((m) => m.type === "image").length === 0 && existingImageCount > 0 ? ` (keeping ${existingImageCount} existing)` : ""}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
              <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>{label}</span>
              <span style={{ color: "var(--ink)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
            </div>
          ))}
          <div style={{ padding: "14px 16px", background: "#fff8e8", borderRadius: 8, border: "1px solid #f5d87a", fontSize: 13, color: "var(--ink)" }}>
            Your live listing stays unchanged until the admin approves this update.
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, fontSize: 13, color: "#c00" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        {step > 0 && (
          <button type="button" onClick={() => { setError(""); setStep((s) => s - 1); }}
            style={{ flex: 1, padding: "12px", borderRadius: 8, border: "1px solid var(--line)", background: "transparent", fontSize: 14, cursor: "pointer", color: "var(--ink)" }}>
            ← Back
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button type="button" onClick={next}
            style={{ flex: 2, padding: "12px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Continue →
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={isPending}
            style={{ flex: 2, padding: "12px", borderRadius: 8, border: "none", background: isPending ? "var(--ink-mute)" : "var(--brand)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: isPending ? "not-allowed" : "pointer" }}>
            {isPending ? submitLabel : "Submit for review"}
          </button>
        )}
      </div>
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
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      let quality = 0.85;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > maxBytes * (4 / 3) + 30 && quality > 0.3) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      resolve({ data: dataUrl.split(",")[1], mimeType: "image/jpeg" });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toBase64(file).then((data) => resolve({ data, mimeType: file.type }));
    };
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
