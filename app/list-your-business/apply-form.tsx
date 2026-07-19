"use client";
import { useState, useTransition, useRef } from "react";

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
  listingType: ListingType | "";
  businessType: string;
  businessName: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  locality: string;
  fullAddress: string;
  website: string;
  instagram: string;
  // venue
  capacityMin: string;
  capacityMax: string;
  vegPlate: string;
  nvPlate: string;
  hallRent: string;
  minGuarantee: string;
  parking: string;
  rooms: string;
  // vendor
  priceFrom: string;
  yearsExp: string;
  tagline: string;
  completed: string;
  // shared
  description: string;
  amenities: string[];
  // new venue sub-sections
  halls: Array<{ name: string; type: string; area: string; theatre: number; floating: number; dining: number; ph?: string }>;
  packages: Array<{ name: string; pricePerPlate: number; features: string[] }>;
  locationInfo: { airport?: string; railway?: string; hotelCluster?: string };
  googleMapsUrl: string;
  googlePlaceId: string;
}

// ── Constants ──────────────────────────────────────────────────────────────
const VENUE_TYPES = ["Hotel / Banquet", "Lawn / Farmhouse", "Heritage / Palace", "Resort", "Rooftop", "Other"];
const VENDOR_TYPES = ["Photography", "Videography", "Décor & Florals", "Catering", "Makeup & Beauty", "Music / DJ", "Event Management", "Invitation & Stationery", "Other"];
const GETAWAY_TYPES = ["Resort / Hotel", "Farmstay", "Heritage Property", "Villa / Bungalow"];
const VENUE_AMENITIES = ["AC Halls", "Outdoor Lawn", "Parking", "In-house Catering", "Outside Catering Allowed", "DJ Allowed", "Valet Parking", "Bridal Suite", "Swimming Pool", "Accommodation", "Generator Backup", "Décor Allowed"];
const IMAGE_LIMIT = 80;
const VIDEO_LIMIT = 1;
const IMAGE_MAX_BYTES = 600 * 1024;   // compress images to ≤600 KB
const VIDEO_MAX_MB = 3;               // 3 MB base64 ≈ 4 MB, fits under Vercel 4.5 MB limit

const EMPTY: FormState = {
  listingType: "", businessType: "",
  businessName: "", contactName: "", phone: "", whatsapp: "", email: "",
  city: "Nagpur", locality: "", fullAddress: "", website: "", instagram: "",
  capacityMin: "", capacityMax: "", vegPlate: "", nvPlate: "", hallRent: "",
  minGuarantee: "", parking: "", rooms: "",
  priceFrom: "", yearsExp: "", tagline: "", completed: "",
  description: "", amenities: [],
  halls: [],
  packages: [],
  locationInfo: {},
  googleMapsUrl: "",
  googlePlaceId: "",
};

// ── Step indicator ─────────────────────────────────────────────────────────
function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
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

// ── Main component ─────────────────────────────────────────────────────────
export function ApplyForm({
  prefillEmail,
  prefillName,
  enabledTypes,
  adminMode,
}: {
  prefillEmail?: string;
  prefillName?: string;
  /** Which listing types to show — driven by site_config feature flags */
  enabledTypes?: ListingType[];
  /** When true, admin is listing on behalf of a venue owner */
  adminMode?: boolean;
}) {
  const availableTypes: ListingType[] = enabledTypes ?? ["venue", "vendor", "getaway"];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ ...EMPTY, email: prefillEmail ?? "", contactName: prefillName ?? "" });
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [error, setError] = useState("");
  const [submitLabel, setSubmitLabel] = useState(adminMode ? "List this business" : "Submit application");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [ownerEmail, setOwnerEmail] = useState("");

  const [customAmenityInput, setCustomAmenityInput] = useState("");
  const [tempHallImage, setTempHallImage] = useState("");
  // null = adding new hall; number = index of hall being edited
  const [editingHallIdx, setEditingHallIdx] = useState<number | null>(null);

  // hall form refs
  const hallNameRef   = useRef<HTMLInputElement>(null);
  const hallTypeRef   = useRef<HTMLSelectElement>(null);
  const hallAreaRef   = useRef<HTMLInputElement>(null);
  const hallTheatreRef= useRef<HTMLInputElement>(null);
  const hallFloatingRef=useRef<HTMLInputElement>(null);
  const hallDiningRef = useRef<HTMLInputElement>(null);
  const hallFileRef   = useRef<HTMLInputElement>(null);

  function startEditHall(idx: number) {
    const h = form.halls[idx];
    setEditingHallIdx(idx);
    setTempHallImage(h.ph?.startsWith("data:") || h.ph?.startsWith("http") ? h.ph : "");
    // Wait a tick for refs to be available in the DOM
    setTimeout(() => {
      if (hallNameRef.current)    hallNameRef.current.value    = h.name;
      if (hallTypeRef.current)    hallTypeRef.current.value    = h.type;
      if (hallAreaRef.current)    hallAreaRef.current.value    = h.area;
      if (hallTheatreRef.current) hallTheatreRef.current.value = String(h.theatre);
      if (hallFloatingRef.current)hallFloatingRef.current.value= String(h.floating);
      if (hallDiningRef.current)  hallDiningRef.current.value  = String(h.dining);
    }, 0);
  }

  function cancelEditHall() {
    setEditingHallIdx(null);
    setTempHallImage("");
    if (hallNameRef.current)    hallNameRef.current.value    = "";
    if (hallTypeRef.current)    hallTypeRef.current.value    = "Indoor Banquet";
    if (hallAreaRef.current)    hallAreaRef.current.value    = "";
    if (hallTheatreRef.current) hallTheatreRef.current.value = "";
    if (hallFloatingRef.current)hallFloatingRef.current.value= "";
    if (hallDiningRef.current)  hallDiningRef.current.value  = "";
    if (hallFileRef.current)    hallFileRef.current.value    = "";
  }

  function saveHall() {
    if (!hallNameRef.current?.value.trim()) { alert("Please enter hall name"); return; }
    const updated = {
      name:     hallNameRef.current!.value.trim(),
      type:     hallTypeRef.current?.value ?? "Indoor Banquet",
      area:     hallAreaRef.current?.value.trim() || "N/A",
      theatre:  Number(hallTheatreRef.current?.value) || 0,
      floating: Number(hallFloatingRef.current?.value) || 0,
      dining:   Number(hallDiningRef.current?.value) || 0,
      ph:       tempHallImage || "v2",
    };
    if (editingHallIdx !== null) {
      setForm(f => ({ ...f, halls: f.halls.map((h, i) => i === editingHallIdx ? updated : h) }));
    } else {
      setForm(f => ({ ...f, halls: [...f.halls, updated] }));
    }
    cancelEditHall();
  }

  const set = (k: any, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) => setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));
  const addCustomAmenity = () => {
    const val = customAmenityInput.trim();
    if (!val || form.amenities.includes(val)) { setCustomAmenityInput(""); return; }
    setForm((f) => ({ ...f, amenities: [...f.amenities, val] }));
    setCustomAmenityInput("");
  };

  // ── File handling ──────────────────────────────────────────────────────
  async function addFiles(files: FileList | null, type: "image" | "video") {
    if (!files) return;
    const currentCount = media.filter((m) => m.type === type).length;
    const limit = type === "image" ? IMAGE_LIMIT : VIDEO_LIMIT;
    const toAdd = Array.from(files).slice(0, limit - currentCount);

    for (const file of toAdd) {
      if (type === "video" && file.size > VIDEO_MAX_MB * 1024 * 1024) {
        setError(`Video must be under ${VIDEO_MAX_MB}MB. Try trimming it first.`);
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

  const stepsList = [
    "Type",
    "Basic Info",
    "Details",
    "Description",
    ...(form.listingType === "venue" ? ["Halls", "Packages", "Location"] : []),
    "Media",
    "Review"
  ];
  const TOTAL_STEPS = stepsList.length;

  let stepName = "";
  if (step === 0) stepName = "type";
  else if (step === 1) stepName = "basic";
  else if (step === 2) stepName = "details";
  else if (step === 3) stepName = "description";
  else {
    const isVenue = form.listingType === "venue";
    if (isVenue) {
      if (step === 4) stepName = "halls";
      else if (step === 5) stepName = "packages";
      else if (step === 6) stepName = "location";
      else if (step === 7) stepName = "media";
      else if (step === 8) stepName = "review";
    } else {
      if (step === 4) stepName = "media";
      else if (step === 5) stepName = "review";
    }
  }

  // ── Validation ─────────────────────────────────────────────────────────
  function validate(): string {
    if (stepName === "type" && !form.listingType) return "Please choose a listing type.";
    if (stepName === "type" && !form.businessType) return "Please choose a category.";
    if (stepName === "basic") {
      if (!form.businessName.trim()) return "Business name is required.";
      if (!form.contactName.trim()) return "Contact name is required.";
      if (!form.phone.trim()) return "Phone is required.";
      if (!form.email.trim()) return "Email is required.";
      if (!form.city.trim()) return "City is required.";
    }
    if (stepName === "media" && media.filter((m) => m.type === "image").length === 0) return "Please upload at least one photo.";
    return "";
  }

  function next() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  }

  // ── Submit: two-phase ──────────────────────────────────────────────────
  function submit() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");

    startTransition(async () => {
      try {
        // Phase 1: submit form data
        const details: Record<string, unknown> = {};
        // Common fields
        if (form.fullAddress) details.fullAddress = form.fullAddress;
        if (form.instagram)   details.instagram   = form.instagram;
        if (form.whatsapp)    details.whatsapp    = form.whatsapp;

        if (form.listingType === "venue") {
          details.capacityMin   = form.capacityMin;
          details.capacityMax   = form.capacityMax;
          details.vegPlate      = form.vegPlate;
          details.nvPlate       = form.nvPlate;
          details.hallRent      = form.hallRent;
          details.parking       = form.parking;
          details.rooms         = form.rooms;
          details.minGuarantee  = form.minGuarantee;
          
          details.halls         = form.halls;
          details.packages      = form.packages;
          details.locationInfo  = form.locationInfo;
          details.googleMapsUrl = form.googleMapsUrl;
          details.googlePlaceId = form.googlePlaceId;
        } else if (form.listingType === "vendor") {
          details.priceFrom  = form.priceFrom;
          details.yearsExp   = form.yearsExp;
          details.tagline    = form.tagline;
          details.completed  = form.completed;
        } else if (form.listingType === "getaway") {
          details.capacityMin  = form.capacityMin;
          details.capacityMax  = form.capacityMax;
          details.vegPlate     = form.vegPlate;
          details.nvPlate      = form.nvPlate;
          details.parking      = form.parking;
          details.minGuarantee = form.minGuarantee;
        }

        setSubmitLabel("Saving details…");
        const res1 = await fetch("/api/apply", {
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
            website: form.website || form.instagram || null,
            message: form.description,
            details,
            amenities: form.amenities,
            ...(adminMode ? { adminSubmit: true, ownerEmail: ownerEmail.trim() } : {}),
          }),
        });
        if (!res1.ok) {
          const d = await res1.json().catch(() => ({}));
          setError(d.error ?? "Something went wrong. Please try again.");
          setSubmitLabel(adminMode ? "List this business" : "Submit application");
          return;
        }
        const { id } = await res1.json();

        // Phase 2: upload each media file separately
        const imageFiles = media.filter((m) => m.type === "image");
        const videoFiles = media.filter((m) => m.type === "video");
        const allMedia = [...imageFiles, ...videoFiles];

        for (let i = 0; i < allMedia.length; i++) {
          const m = allMedia[i];
          setSubmitLabel(`Uploading ${m.type === "image" ? `photo ${imageFiles.indexOf(m) + 1} of ${imageFiles.length}` : "video"}…`);
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
            setSubmitLabel(adminMode ? "List this business" : "Submit application");
            return;
          }
        }

        setSubmitted(true);
      } catch {
        setError("Network error. Please check your connection and try again.");
        setSubmitLabel(adminMode ? "List this business" : "Submit application");
      }
    });
  }

  // ── Success screen ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "color-mix(in srgb,var(--brand) 12%,#fff)", border: "2px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 26 }}>✓</div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--ink)", marginBottom: 10 }}>Application submitted!</h2>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 360, margin: "0 auto" }}>
          We&rsquo;ll review your application within 48 hours and get back to you at <strong>{form.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <Steps current={step} total={TOTAL_STEPS} />

      {/* ── Step 0: Type ── */}
      {stepName === "type" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>What are you listing?</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Choose the type that best describes your business.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: availableTypes.length === 1 ? "1fr" : "1fr 1fr", gap: 10 }}>
            {availableTypes.map((t) => (
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
      {stepName === "basic" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Basic details</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>How we reach you and identify your business.</p>
          </div>

          {adminMode && (
            <div style={{ background: "#f0f4ff", border: "1px solid #c7d4f0", borderRadius: 10, padding: 16, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5b6ea8", marginBottom: 8 }}>OWNER'S EMAIL (for onboarding)</div>
              <input style={inp} type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="owner@example.com — they will receive a listing notification" />
              <p style={{ fontSize: 12, color: "#7889b5", marginTop: 6 }}>This person will receive an email inviting them to claim the listing. When they sign up with this email, the listing will appear in their account.</p>
            </div>
          )}
          <Field label="Business name"><input style={inp} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="e.g. Orange County Farms" /></Field>
          <Field label="Owner / manager name"><input style={inp} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Your full name" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Phone"><input style={inp} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 " /></Field>
            <Field label="WhatsApp (if different)"><input style={inp} type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 " /></Field>
          </div>
          <Field label="Email"><input style={inp} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="City"><input style={inp} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Nagpur" /></Field>
            <Field label="Locality / area"><input style={inp} value={form.locality} onChange={(e) => set("locality", e.target.value)} placeholder="e.g. Civil Lines" /></Field>
          </div>
          <Field label="Full address (shown on listing)"><input style={inp} value={form.fullAddress} onChange={(e) => set("fullAddress", e.target.value)} placeholder="e.g. Plot 12, Wardha Road, Nagpur – 440025" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Website (optional)"><input style={inp} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yoursite.com" /></Field>
            <Field label="Instagram (optional)"><input style={inp} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@yourhandle" /></Field>
          </div>
        </div>
      )}

      {/* ── Step 2: Listing specifics ── */}
      {stepName === "details" && (
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Car parking spaces"><input style={inp} type="number" value={form.parking} onChange={(e) => set("parking", e.target.value)} placeholder="100" /></Field>
              <Field label="Rooms on-site (0 if none)"><input style={inp} type="number" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} placeholder="0" /></Field>
              <Field label="Min booking guarantee (₹)"><input style={inp} type="number" value={form.minGuarantee} onChange={(e) => set("minGuarantee", e.target.value)} placeholder="500000" /></Field>
            </div>
          </>}

          {form.listingType === "vendor" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Starting price (₹)"><input style={inp} type="number" value={form.priceFrom} onChange={(e) => set("priceFrom", e.target.value)} placeholder="25000" /></Field>
              <Field label="Years of experience"><input style={inp} type="number" value={form.yearsExp} onChange={(e) => set("yearsExp", e.target.value)} placeholder="5" /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Weddings completed"><input style={inp} type="number" value={form.completed} onChange={(e) => set("completed", e.target.value)} placeholder="80" /></Field>
              <div>{/* spacer */}</div>
            </div>
            <Field label="Your tagline (shown on listing — what makes you unique)">
              <input style={inp} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder='e.g. "We tell stories, not just take photos."' />
            </Field>
          </>}

          {form.listingType === "getaway" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="No. of rooms / cottages"><input style={inp} type="number" value={form.capacityMin} onChange={(e) => set("capacityMin", e.target.value)} placeholder="10" /></Field>
              <Field label="Max guests"><input style={inp} type="number" value={form.capacityMax} onChange={(e) => set("capacityMax", e.target.value)} placeholder="40" /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Weekday rate (₹/night)"><input style={inp} type="number" value={form.vegPlate} onChange={(e) => set("vegPlate", e.target.value)} placeholder="8000" /></Field>
              <Field label="Weekend rate (₹/night)"><input style={inp} type="number" value={form.nvPlate} onChange={(e) => set("nvPlate", e.target.value)} placeholder="12000" /></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Car parking spaces"><input style={inp} type="number" value={form.parking} onChange={(e) => set("parking", e.target.value)} placeholder="20" /></Field>
              <Field label="Min booking guarantee (₹)"><input style={inp} type="number" value={form.minGuarantee} onChange={(e) => set("minGuarantee", e.target.value)} placeholder="0" /></Field>
            </div>
          </>}
        </div>
      )}

      {/* ── Step 3: Description + amenities ── */}
      {stepName === "description" && (
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
                {form.amenities.filter((a) => !VENUE_AMENITIES.includes(a)).map((a) => (
                  <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px 7px 14px", borderRadius: 20, fontSize: 13, border: "1px solid var(--brand)", background: "color-mix(in srgb,var(--brand) 10%,#fff)", color: "var(--brand)", fontWeight: 600 }}>
                    {a}
                    <button type="button" onClick={() => toggleAmenity(a)} aria-label={`Remove ${a}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "var(--brand)", fontSize: 15, display: "flex", alignItems: "center" }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  type="text"
                  value={customAmenityInput}
                  onChange={(e) => setCustomAmenityInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                  placeholder="Add custom amenity…"
                  style={{ flex: 1, padding: "7px 14px", borderRadius: 20, fontSize: 13, border: "1px solid var(--line)", outline: "none", color: "var(--ink)" }}
                />
                <button type="button" onClick={addCustomAmenity} style={{ padding: "7px 18px", borderRadius: 20, fontSize: 13, border: "1px solid var(--brand)", background: "var(--brand)", color: "#fff", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                  + Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4 (Venue): Halls ── */}
      {stepName === "halls" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Halls & capacities</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Add banquets, lawns, or halls available at your venue.</p>
          </div>

          {/* Existing halls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {form.halls.map((hall, idx) => (
              <div key={idx} style={{
                padding: 16, border: `2px solid ${editingHallIdx === idx ? "var(--brand)" : "var(--line)"}`,
                borderRadius: 10, background: editingHallIdx === idx ? "color-mix(in srgb,var(--brand) 4%,#fff)" : "var(--surface)",
                position: "relative", display: "flex", gap: 16, alignItems: "center",
              }}>
                {hall.ph && (hall.ph.startsWith("data:") || hall.ph.startsWith("http")) ? (
                  <img src={hall.ph} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 80, height: 60, borderRadius: 6, background: "var(--line)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--ink-mute)" }}>No Image</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 6 }}>{hall.name || `Hall #${idx + 1}`}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
                    <div>Type: <span style={{ color: "var(--ink)" }}>{hall.type}</span></div>
                    <div>Area: <span style={{ color: "var(--ink)" }}>{hall.area}</span></div>
                    <div>Theatre: <span style={{ color: "var(--ink)" }}>{hall.theatre}</span></div>
                    <div>Floating: <span style={{ color: "var(--ink)" }}>{hall.floating}</span></div>
                    <div>Dining: <span style={{ color: "var(--ink)" }}>{hall.dining}</span></div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => startEditHall(idx)}
                    style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid var(--brand)", background: "transparent", color: "var(--brand)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => { setForm(f => ({ ...f, halls: f.halls.filter((_, i) => i !== idx) })); if (editingHallIdx === idx) cancelEditHall(); }}
                    style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #fcc", background: "transparent", color: "#c00", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit hall form */}
          <div style={{ border: `1px dashed ${editingHallIdx !== null ? "var(--brand)" : "var(--line)"}`, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: editingHallIdx !== null ? "var(--brand)" : "var(--ink)" }}>
                {editingHallIdx !== null ? `Editing: ${form.halls[editingHallIdx]?.name || `Hall #${editingHallIdx + 1}`}` : "Add new hall / area"}
              </div>
              {editingHallIdx !== null && (
                <button type="button" onClick={cancelEditHall}
                  style={{ fontSize: 12, color: "var(--ink-mute)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Cancel edit
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Hall name">
                <input ref={hallNameRef} style={inp} placeholder="e.g. Grand Ballroom" />
              </Field>
              <Field label="Type">
                <select ref={hallTypeRef} style={inp}>
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
                  <input ref={hallAreaRef} style={inp} placeholder="5,000 sqft" />
                </Field>
              </div>
              <Field label="Theatre">
                <input ref={hallTheatreRef} type="number" style={inp} placeholder="100" />
              </Field>
              <Field label="Floating">
                <input ref={hallFloatingRef} type="number" style={inp} placeholder="250" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Dining capacity">
                <input ref={hallDiningRef} type="number" style={inp} placeholder="80" />
              </Field>
              <Field label="Hall Image (Optional)">
                <input ref={hallFileRef} type="file" accept="image/*" onChange={async (e) => {
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
            <button type="button" onClick={saveHall}
              style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
              {editingHallIdx !== null ? "✓ Save changes" : "+ Add Hall"}
            </button>
          </div>
        </div>
      )}


      {/* ── Step 5 (Venue): Packages ── */}
      {stepName === "packages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Pricing packages</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Add wedding/event packages you offer to clients.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
          </div>

          <div style={{ border: "1px dashed var(--line)", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>Add new package</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Package name">
                <input id="new-pkg-name" style={inp} placeholder="e.g. Gold Buffet Package" />
              </Field>
              <Field label="Price per plate (₹)">
                <input id="new-pkg-price" type="number" style={inp} placeholder="1200" />
              </Field>
            </div>
            
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>Package features</label>
              <div id="new-pkg-features-list" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}></div>
              <div style={{ display: "flex", gap: 8 }}>
                <input id="new-pkg-feature-input" style={{ ...inp, flex: 1 }} placeholder="e.g. 4 Welcome Drinks" onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const featInput = document.getElementById("new-pkg-feature-input") as HTMLInputElement;
                    const featVal = featInput.value.trim();
                    if (!featVal) return;
                    
                    const listEl = document.getElementById("new-pkg-features-list");
                    if (listEl) {
                      const tag = document.createElement("span");
                      tag.className = "pkg-feat-tag";
                      tag.setAttribute("style", "display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; background: var(--line); color: var(--ink); font-size: 12px; font-weight: 500;");
                      tag.innerHTML = `${featVal} <button type="button" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--ink-soft); padding: 0;" onclick="this.parentElement.remove()">×</button>`;
                      listEl.appendChild(tag);
                    }
                    featInput.value = "";
                  }
                }} />
                <button type="button" onClick={() => {
                  const featInput = document.getElementById("new-pkg-feature-input") as HTMLInputElement;
                  const featVal = featInput.value.trim();
                  if (!featVal) return;
                  
                  const listEl = document.getElementById("new-pkg-features-list");
                  if (listEl) {
                    const tag = document.createElement("span");
                    tag.className = "pkg-feat-tag";
                    tag.setAttribute("style", "display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; background: var(--line); color: var(--ink); font-size: 12px; font-weight: 500;");
                    tag.innerHTML = `${featVal} <button type="button" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--ink-soft); padding: 0;" onclick="this.parentElement.remove()">×</button>`;
                    listEl.appendChild(tag);
                  }
                  featInput.value = "";
                }} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                  Add feature
                </button>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}>Press Enter or click Add feature to insert package features.</div>
            </div>

            <button type="button" onClick={() => {
              const nameEl = document.getElementById("new-pkg-name") as HTMLInputElement;
              const priceEl = document.getElementById("new-pkg-price") as HTMLInputElement;
              const listEl = document.getElementById("new-pkg-features-list");
              
              if (!nameEl.value.trim()) return alert("Please enter package name");
              if (!priceEl.value.trim()) return alert("Please enter package price");
              
              const features: string[] = [];
              if (listEl) {
                const tags = listEl.getElementsByClassName("pkg-feat-tag");
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
              + Add Package
            </button>
          </div>
        </div>
      )}

      {/* ── Step 6 (Venue): Location ── */}
      {stepName === "location" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Location & proximities</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Map integration details and transit distances.</p>
          </div>

          <Field label="Google Maps URL">
            <input style={inp} value={form.googleMapsUrl} onChange={(e) => set("googleMapsUrl", e.target.value)} placeholder="https://maps.app.goo.gl/..." />
          </Field>
          
          <Field label="Google Place ID (Optional)">
            <input style={inp} value={form.googlePlaceId} onChange={(e) => set("googlePlaceId", e.target.value)} placeholder="e.g. ChIJ..." />
          </Field>

          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-mute)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 10 }}>Transit distances</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Distance to Airport (e.g. 15 km)">
              <input style={inp} value={form.locationInfo.airport || ""} onChange={(e) => {
                const val = e.target.value;
                setForm(f => ({ ...f, locationInfo: { ...f.locationInfo, airport: val } }));
              }} placeholder="15 km" />
            </Field>
            
            <Field label="Distance to Railway Station">
              <input style={inp} value={form.locationInfo.railway || ""} onChange={(e) => {
                const val = e.target.value;
                setForm(f => ({ ...f, locationInfo: { ...f.locationInfo, railway: val } }));
              }} placeholder="8 km" />
            </Field>
          </div>
          
          <Field label="Nearby Hotel Clusters (e.g. 2 km from Wardha Road hotels)">
            <input style={inp} value={form.locationInfo.hotelCluster || ""} onChange={(e) => {
              const val = e.target.value;
              setForm(f => ({ ...f, locationInfo: { ...f.locationInfo, hotelCluster: val } }));
            }} placeholder="2 km" />
          </Field>
        </div>
      )}

      {/* ── Step: Media ── */}
      {stepName === "media" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--ink)", marginBottom: 6 }}>Photos & video</h2>
            <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>Up to {IMAGE_LIMIT} photos · 1 short video (max {VIDEO_MAX_MB}MB).</p>
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
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files, "image"); e.target.value = ""; }} />
          </div>

          {/* Video */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", display: "block", marginBottom: 8 }}>Intro video (optional, max {VIDEO_MAX_MB}MB)</label>
            {media.filter((m) => m.type === "video").length === 0 ? (
              <button type="button" onClick={() => videoRef.current?.click()} style={{ width: "100%", padding: "20px", borderRadius: 8, border: "2px dashed var(--line)", background: "var(--surface)", cursor: "pointer", color: "var(--ink-mute)", fontSize: 13 }}>
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

      {/* ── Step: Review ── */}
      {stepName === "review" && (
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
            {isPending ? submitLabel : (adminMode ? "List this business" : "Submit application")}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
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
      // base64 is ~4/3 of raw bytes; keep reducing until under budget
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
