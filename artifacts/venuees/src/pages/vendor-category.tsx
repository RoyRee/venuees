import { Link, useParams, Redirect } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { I, Stars } from "../components/icons";
import { Photo } from "../components/photo";
import { api, type Vendor } from "../lib/api";
import { vendorPhotos } from "../lib/images";

const CATEGORY_META: Record<string, { name: string; blurb: string; ph: string }> = {
  photographers: { name: "Photographers", blurb: "From candid-only storytellers to 3-photographer + film crews. Every portfolio below is from a wedding we personally attended.", ph: "v3" },
  decorators: { name: "Decorators & florists", blurb: "Marigold classicism to pastel florals to full-installation production houses. Price by scale — small mandap to full reception.", ph: "garden" },
  makeup: { name: "Makeup artists", blurb: "Bridal, engagement, mother-of-bride, pre-wedding shoot. Airbrush, HD, and traditional — with honest skin-finish photos.", ph: "rose" },
  caterers: { name: "Caterers", blurb: "Pure veg, Jain, non-veg multi-cuisine — Nagpur's best kitchens. Live stations, chaat counters, dessert bars, late-night snacks.", ph: "saffron" },
  mehendi: { name: "Mehendi artists", blurb: "Arabic, Rajasthani, bridal, kids — solo artists and 4-artist crews that handle full guest lists without smudges.", ph: "v5" },
  music: { name: "Music & DJs", blurb: "Sangeet specialists, shaadi DJs, live instrumentalists and dhol players. Every sound system tested for banquet and lawn acoustics.", ph: "plum" },
  pandits: { name: "Pandits", blurb: "Multi-regional pandits — Maharashtrian, Rajasthani, South Indian, inter-caste ceremonies. Sanskrit shlokas explained in Marathi / Hindi / English.", ph: "v2" },
};

function VendorEnquiryForm({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "+91 ", eventDate: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.enquiries.submit({
      kind: "vendor_enquiry",
      vendorSlug: vendor.slug,
      category: vendor.categorySlug,
      name: form.name,
      phone: form.phone,
      eventDate: form.eventDate,
      message: form.message,
    }),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <h4>Enquiry sent!</h4>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 20 }}>We'll connect you with {vendor.name} within 2 hours.</p>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 28 }}>
      <h3 style={{ marginBottom: 4 }}>Enquire · {vendor.name}</h3>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 20 }}>From ₹{vendor.priceFrom.toLocaleString("en-IN")} · {vendor.completed} weddings done</p>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Phone +91" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder="Event date (e.g. Dec 2026)" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
        <textarea placeholder="Any specific requirements?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} style={{ resize: "none", fontSize: 14, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", fontFamily: "inherit" }} />
        <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending…" : "Send enquiry"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}

function VendorCard({ v, onEnquire }: { v: Vendor; onEnquire: (v: Vendor) => void }) {
  return (
    <div className="vcard">
      <Photo
        src={v.images[0]?.url ?? vendorPhotos[v.slug]}
        alt={v.name}
        variant={v.ph as "v2"}
        label={v.tagline}
        style={{ height: 200 }}
      >
        <button className="save" aria-label="Save"><I.Heart width={16} height={16} /></button>
      </Photo>
      <div className="vcard-body">
        <div className="vcard-row1">
          <span className="chip outline">{v.category}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <Stars value={Number(v.rating)} size={12} /> {v.rating}
            <span style={{ color: "var(--ink-mute)", marginLeft: 4 }}>({v.reviews})</span>
          </span>
        </div>
        <h3 className="vcard-name">{v.name}</h3>
        <div className="vcard-loc"><I.Pin width={12} height={12} /> {v.locality}, {v.city}</div>
        <div className="vcard-specs">
          <span>{v.yearsExp} yrs exp</span>
          <span>·</span>
          <span>{v.completed} weddings</span>
        </div>
        <div className="vcard-price">
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.1em" }}>From</div>
            <b>₹{v.priceFrom.toLocaleString("en-IN")}</b>
          </div>
          <button className="chip" onClick={() => onEnquire(v)}>Enquire</button>
        </div>
      </div>
    </div>
  );
}

export default function VendorCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [enquiryVendor, setEnquiryVendor] = useState<Vendor | null>(null);
  const meta = CATEGORY_META[category];
  if (!meta) return <Redirect to="/vendors" />;

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors", category],
    queryFn: () => api.vendors.list({ category }),
  });

  return (
    <div>
      <MobileNav />
      <TopNav />

      {enquiryVendor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEnquiryVendor(null)}>
          <div style={{ background: "var(--bg)", borderRadius: "var(--radius-lg)", maxWidth: 480, width: "100%", maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
            <VendorEnquiryForm vendor={enquiryVendor} onClose={() => setEnquiryVendor(null)} />
          </div>
        </div>
      )}

      <div className="vl-top">
        <div className="vl-top-inner">
          <nav className="vd-breadcrumb" style={{ borderBottom: "none", padding: 0, marginBottom: 14 }}>
            <Link href="/">Home</Link> <span className="sep">/</span>
            <Link href="/vendors">Vendors</Link> <span className="sep">/</span>
            <span>{meta.name}</span>
          </nav>
          <h1>{meta.name} <span className="italic-serif" style={{ color: "var(--brand)" }}>in Nagpur.</span></h1>
          <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 640, lineHeight: 1.6 }}>{meta.blurb}</p>
        </div>
      </div>

      <div className="vl-body">
        <aside className="vl-filters">
          <div className="f-group">
            <h6>Price range</h6>
            <div className="f-range">
              <input type="range" min={10000} max={500000} defaultValue={150000} />
              <div className="bounds"><span>₹10k</span><span>₹5L+</span></div>
            </div>
          </div>
          <div className="f-group">
            <h6>Experience</h6>
            <label><input type="checkbox" /> 5+ years</label>
            <label><input type="checkbox" /> 10+ years</label>
          </div>
          <div className="f-group" style={{ borderBottom: "none" }}>
            <h6>Rating</h6>
            <label><input type="checkbox" /> 4.5 &amp; above</label>
            <label><input type="checkbox" /> 4.8 &amp; above</label>
          </div>
        </aside>

        <main>
          <div className="vl-results-head">
            <div className="vl-count">
              {isLoading ? "Loading…" : <><b>{vendors.length}</b> {meta.name.toLowerCase()} · Nagpur</>}
            </div>
          </div>

          {isLoading ? (
            <div className="vl-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="vcard" style={{ background: "var(--surface)", borderRadius: "var(--radius-md)", height: 300, opacity: 0.4 }} />
              ))}
            </div>
          ) : (
            <div className="vl-grid">
              {vendors.map((v) => <VendorCard key={v.slug} v={v} onEnquire={setEnquiryVendor} />)}
            </div>
          )}
        </main>
      </div>

      <Footer />
      <MobileTabbar active="Vendors" />
    </div>
  );
}
