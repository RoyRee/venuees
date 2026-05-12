"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────
type ListingType = "venue" | "vendor" | "getaway";

interface MediaFile {
  data: string;       // base64
  mimeType: string;
  fileName: string;
  type: "image" | "video";
  preview: string;    // object URL for preview
}

interface FormState {
  // Step 1
  listingType: ListingType | "";
  businessType: string;
  // Step 2
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  website: string;
  // Step 3 — venue
  capacityMin: string;
  capacityMax: string;
  vegPlate: string;
  nvPlate: string;
  hallRent: string;
  // Step 3 — vendor
  priceFrom: string;
  yearsExp: string;
  // Step 4
  description: string;
  amenities: string[];
  // Step 5 — media (handled separately)
}

// ── Constants ──────────────────────────────────────────────────────────────
const VENUE_TYPES = ["Hotel / Banquet", "Lawn / Farmhouse", "Heritage / Palace", "Resort", "Rooftop", "Other"];
const VENDOR_TYPES = ["Photography", "Videography", "Décor & Florals", "Catering", "Makeup & Beauty", "Music / DJ", "Event Management", "Invitation & Stationery", "Other"];
const GETAWAY_TYPES = ["Resort / Hotel", "Farmstay", "Heritage Property", "Villa / Bungalow"];
const VENUE_AMENITIES = ["AC Halls", "Outdoor Lawn", "Parking", "In-house Catering", "Outside Catering Allowed", "DJ Allowed", "Valet Parking", "Bridal Suite", "Swimming Pool", "Accommodation", "Generator Backup", "Décor Allowed"];
const IMAGE_LIMIT = 5;
const VIDEO_LIMIT = 1;
const IMAGE_MAX_MB = 2;
const VIDEO_MAX_MB = 10;

const EMPTY: FormState = {
  listingType: "", businessType: "",
  businessName: "", contactName: "", phone: "", email: "", city: "Nagpur", locality: "", website: "",
  capacityMin: "", capacityMax: "", vegPlate: "", nvPlate: "", hallRent: "",
  priceFrom: "", yearsExp: "",
  description: "", amenities: [],
};

// ── Step indicator ─────────────────────────────────────────────────────────
function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < current ? "var(--brand)" : i === current ? "var(--brand)" : "var(--line)", opacity: i === current ? 1 : i < current ? 0.5 : 0.25, transition: "all 0.2s" }} />
      ))}
    </div>
  );
}

// ── Field components ───────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
const inp: React.CSSProperties = { width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, background: "#fff", color: "var(--ink)", boxSizing: "border-box" };

// ── Main component ─────────────────────────────────────────────────────────
export function ApplyForm({ prefillEmail, prefillName }: { prefillEmail?: string; prefillName?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ ...EMPTY, email: prefillEmail ?? "", contactName: prefillName ?? "" });
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) => setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));

  // ── File handling ──────────────────────────────────────────────────────
  async function addFiles(files: FileList | null, type: "image" | "video") {
    if (!files) return;
    const maxMB = type === "image" ? IMAGE_MAX_MB : VIDEO_MAX_MB;
    const currentCount = media.filter((m) => m.type === type).length;
    const limit = type === "image" ? IMAGE_LIMIT : VIDEO_LIMIT;
    const toAdd = Array.from(files).slice(0, limit - currentCount);

    for (const file of toAdd) {
      if (file.size > maxMB * 1024 * 1024) {
        setError(`${file.name} exceeds ${maxMB}MB limit.`);
        continue;
      }
      const data = await toBase64(file);
      setMedia((m) => [...m, { data, mimeType: file.type, fileName: file.name, type, preview: URL.createObjectURL(file) }]);
    }
    setError("");
  }

  function removeMedia(i: number) {
    setMedia((m) => { URL.revokeObjectURL(m[i].preview); return m.filter((_, j) => j !== i); });
  }

  // ── Validation ─────────────────────────────────────────────────────────
  function validate(): string {
    if (step === 0 && !form.listingType) return "Please choose a listing type.";
    if (step === 0 && !form.businessType) return "Please choose a category.";
    if (step === 1) {
      if (!form.businessName.trim()) return "Business name is required.";
      if (!form.contactName.trim()) return "Contact name is required.";
      if (!form.phone.trim()) return "Phone is required.";
      if (!form.email.trim()) return "Email is required.";
      if (!form.city.trim()) return "City is required.";
    }
    if (step === 4 && media.filter((m) => m.type === "image").length === 0) return "Please upload at least one photo.";
    return "";
  }

  function next() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  function submit() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");

    startTransition(async () => {
      const details: Record<string, unknown> = {};
      if (form.listingType === "venue") {
        details.capacityMin = form.capacityMin;
        details.capacityMax = form.capacityMax;
        details.vegPlate = form.vegPlate;
        details.nvPlate = form.nvPlate;
        details.hallRent = form.hallRent;
      } else if (form.listingType === "vendor") {
        details.priceFrom = form.priceFrom;
        details.yearsExp = form.yearsExp;
      }

      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingType: form.listingType,
          businessName: form.businessName,
          businessType: form.businessType,
          contactName: form.contactName,
          phone: form.phone,
          email: form.email,
          city: form.city,
          locality: form.locality,
          website: form.website,
          message: form.description,
          details,
          amenities: form.amenities,
          media: media.map((m) => ({ data: m.data, mimeType: m.mimeType, fileName: m.fileName, type: m.type })),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/dashboard?applied=1");
    });
  }

  const TOTAL_STEPS = 6;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <Steps current={step} total={TOTAL_STEPS} />

      {/* ── Step 0: Type ── */}
      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>What are you listing?</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Choose the type that best describes your business.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(["venue", "vendor", "getaway"] as ListingType[]).map((t) => (
              <button key={t} type="button" onClick={() => { set("listingType", t); set("businessType", ""); }}
                style={{ padding: "18px 16px", border: `2px solid ${form.listingType === t ? "var(--brand)" : "var(--line)"}`, borderRadius: 10, background: form.listingType === t ? "color-mix(in srgb,var(--brand) 6%,#fff)" : "#fff", cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 600, color: form.listingType === t ? "var(--brand)" : "var(--ink)", textTransform: "capitalize" }}>
                {t === "venue" ? "🏛 Venue" : t === "vendor" ? "🎯 Vendor" : "🌿 Getaway"}
                <div style={{ fontSize: 12, fontWeight: 400, color: "var(--ink-mute)", marginTop: 4 }}>
                  {t === "venue" ? "Hotels, lawns, heritage" : t === "vendor" ? "Photo, décor, catering…" : "Resorts, farmstays"}
                </div>
              </button>
            ))}
          </div>

          {form.listingType && (
            <Field label="Category">
              <select value={form.businessType} onChange={(e) => set("businessType", e.target.value)} style={inp}>
                <option value="">Select category…</option>
                {(form.listingType === "venue" ? VENUE_TYPES : form.listingType === "vendor" ? VENDOR_TYPES : GETAWAY_TYPES).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
      )}

      {/* ── Step 1: Basic info ── */}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Basic details</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>How we reach you and identify your business.</p>
          </div>
          <Field label="Business name"><input style={inp} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="e.g. Orange County Farms" required /></Field>
          <Field label="Your name"><input style={inp} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Owner / manager name" required /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Phone"><input style={inp} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 " required /></Field>
            <Field label="Email"><input style={inp} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" required /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="City"><input style={inp} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Nagpur" /></Field>
            <Field label="Locality / area"><input style={inp} value={form.locality} onChange={(e) => set("locality", e.target.value)} placeholder="e.g. Civil Lines" /></Field>
          </div>
          <Field label="Website / Instagram (optional)"><input style={inp} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="URL or @handle" /></Field>
        </div>
      )}

      {/* ── Step 2: Listing specifics ── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Listing details</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>The specifics that help couples find you.</p>
          </div>

          {form.listingType === "venue" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Min guests"><input style={inp} type="number" value={form.capacityMin} onChange={(e) => set("capacityMin", e.target.value)} placeholder="50" /></Field>
              <Field label="Max guests"><input style={inp} type="number" value={form.capacityMax} onChange={(e) => set("capacityMax", e.target.value)} placeholder="500" /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Veg plate (₹)"><input style={inp} type="number" value={form.vegPlate} onChange={(e) => set("vegPlate", e.target.value)} placeholder="800" /></Field>
              <Field label="NV plate (₹)"><input style={inp} type="number" value={form.nvPlate} onChange={(e) => set("nvPlate", e.target.value)} placeholder="1000" /></Field>
              <Field label="Hall rent (₹)"><input style={inp} type="number" value={form.hallRent} onChange={(e) => set("hallRent", e.target.value)} placeholder="50000" /></Field>
            </div>
          </>}

          {form.listingType === "vendor" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Starting price (₹)"><input style={inp} type="number" value={form.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} placeholder="25000" /></Field>
              <Field label="Years of experience"><input style={inp} type="number" value={form.yearsExp} onChange={(e) => set("yearsExp", e.target.value)} placeholder="5" /></Field>
            </div>
          </>}

          {form.listingType === "getaway" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="No. of rooms"><input style={inp} type="number" value={form.capacityMin} onChange={(e) => set("capacityMin", e.target.value)} placeholder="10" /></Field>
              <Field label="Max guests"><input style={inp} type="number" value={form.capacityMax} onChange={(e) => set("capacityMax", e.target.value)} placeholder="40" /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Weekday rate (₹/night)"><input style={inp} type="number" value={form.vegPlate} onChange={(e) => set("vegPlate", e.target.value)} placeholder="8000" /></Field>
              <Field label="Weekend rate (₹/night)"><input style={inp} type="number" value={form.nvPlate} onChange={(e) => set("nvPlate", e.target.value)} placeholder="12000" /></Field>
            </div>
          </>}
        </div>
      )}

      {/* ── Step 3: Description + amenities ── */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>About your business</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Help couples understand what makes you special.</p>
          </div>
          <Field label="Description">
            <textarea style={{ ...inp, height: 140, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={form.listingType === "venue" ? "Describe your venue — location highlights, unique features, what kinds of weddings you host…" : "Describe your service — style, approach, what sets you apart…"} />
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

      {/* ── Step 4: Media ── */}
      {step === 4 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Photos & video</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Up to {IMAGE_LIMIT} photos (max {IMAGE_MAX_MB}MB each) and 1 video (max {VIDEO_MAX_MB}MB).</p>
          </div>

          {/* Photo grid */}
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
                  <span style={{ fontSize: 22 }}>+</span>
                  Add photo
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files, "image")} />
          </div>

          {/* Video */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 8 }}>Intro video (optional)</label>
            {media.filter((m) => m.type === "video").length === 0 ? (
              <button type="button" onClick={() => videoRef.current?.click()} style={{ width: "100%", padding: "20px", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)", cursor: "pointer", color: "var(--ink-mute)", fontSize: 13 }}>
                + Add video (MP4 / WebM, max {VIDEO_MAX_MB}MB)
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 8 }}>
                <span style={{ fontSize: 20 }}>🎬</span>
                <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{media.find((m) => m.type === "video")?.fileName}</span>
                <button type="button" onClick={() => removeMedia(media.findIndex((m) => m.type === "video"))} style={{ fontSize: 13, color: "#c00", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
              </div>
            )}
            <input ref={videoRef} type="file" accept="video/mp4,video/webm" style={{ display: "none" }} onChange={(e) => addFiles(e.target.files, "video")} />
          </div>
        </div>
      )}

      {/* ── Step 5: Review ── */}
      {step === 5 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Review & submit</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Check everything looks right before submitting.</p>
          </div>
          {[
            { label: "Type", value: `${form.listingType} · ${form.businessType}` },
            { label: "Business", value: form.businessName },
            { label: "Contact", value: `${form.contactName} · ${form.phone}` },
            { label: "Email", value: form.email },
            { label: "Location", value: `${form.locality ? form.locality + ", " : ""}${form.city}` },
            { label: "Photos", value: `${media.filter((m) => m.type === "image").length} uploaded` },
            { label: "Video", value: media.some((m) => m.type === "video") ? "1 uploaded" : "None" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
              <span style={{ color: "var(--ink-mute)", fontWeight: 500 }}>{label}</span>
              <span style={{ color: "var(--ink)", textAlign: "right", maxWidth: "60%", textTransform: "capitalize" }}>{value}</span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "var(--ink-mute)" }}>
            We&rsquo;ll review your application within 48 hours. You&rsquo;ll receive a confirmation at {form.email}.
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, fontSize: 13, color: "#c00" }}>
          {error}
        </div>
      )}

      {/* ── Navigation ── */}
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
            {isPending ? "Submitting…" : "Submit application"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
