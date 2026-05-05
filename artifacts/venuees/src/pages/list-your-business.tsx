import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { Ornament, I } from "../components/icons";
import { api } from "../lib/api";

const BUSINESS_TYPES = [
  { value: "venue", label: "Wedding venue", icon: "🏛️", desc: "Hotels, lawns, resorts, heritage properties, farmhouses, banquet halls" },
  { value: "vendor", label: "Vendor / service", icon: "🎨", desc: "Photography, décor, makeup, catering, music, mehendi, pandit services" },
  { value: "getaway", label: "Weekend getaway", icon: "🌿", desc: "Forest villas, lake cottages, hill stays within 4 hours of Nagpur" },
];

const VENDOR_CATEGORIES = [
  "Photography", "Videography", "Decorators & florists", "Makeup artists",
  "Caterers", "Mehendi artists", "Music & DJs", "Pandits & priests",
  "Wedding planners", "Invitation designers", "Rental & logistics", "Other",
];

export default function ListYourBusinessPage() {
  const [bizType, setBizType] = useState("venue");
  const [form, setForm] = useState({
    businessName: "", category: "", contactName: "", phone: "", email: "",
    city: "Nagpur", locality: "", website: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.listings.apply({
      businessName: form.businessName,
      businessType: bizType as "venue" | "vendor" | "getaway",
      category: bizType === "vendor" ? form.category : undefined,
      contactName: form.contactName,
      phone: form.phone,
      email: form.email,
      city: form.city,
      locality: form.locality,
      website: form.website || undefined,
      message: form.message || undefined,
    }),
    onSuccess: () => setSubmitted(true),
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="page-hero">
        <Ornament>LIST YOUR BUSINESS</Ornament>
        <h1>Join <span className="italic-serif" style={{ color: "var(--brand)" }}>Venuees.in.</span></h1>
        <p>
          We list only owner-operated venues and vetted vendors. No commission on bookings. No middlemen. Couples see your real price, your real photos, and call you directly.
        </p>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, maxWidth: 1100, margin: "0 auto" }} className="contact-grid">

          <div>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✓</div>
                <h2 style={{ marginBottom: 12 }}>Application received!</h2>
                <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
                  Our team will review your listing and get back to you within 48 hours. We visit every property before listing it.
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: 8 }}>Apply to list</h2>
                <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
                  We personally visit every venue and vet every vendor before listing. Our team will reach out to schedule a visit or call.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
                  {BUSINESS_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setBizType(t.value)}
                      style={{
                        padding: "16px 12px", border: `2px solid ${bizType === t.value ? "var(--brand)" : "var(--line)"}`,
                        borderRadius: "var(--radius-md)", background: bizType === t.value ? "var(--brand-tint, #FFF0F3)" : "var(--bg)",
                        cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: bizType === t.value ? "var(--brand)" : "var(--ink)" }}>{t.label}</div>
                    </button>
                  ))}
                </div>

                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>
                        {bizType === "vendor" ? "Business / studio name" : "Property name"} *
                      </label>
                      <input value={form.businessName} onChange={update("businessName")} placeholder={bizType === "venue" ? "e.g. Mahalaxmi Lawns" : bizType === "vendor" ? "e.g. Studio Ishara" : "e.g. Pench Silver Stream"} required />
                    </div>
                    {bizType === "vendor" && (
                      <div>
                        <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>Category *</label>
                        <select value={form.category} onChange={update("category")} required>
                          <option value="">Select category</option>
                          {VENDOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    )}
                    {bizType !== "vendor" && (
                      <div>
                        <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>Locality *</label>
                        <input value={form.locality} onChange={update("locality")} placeholder="Area or road" required />
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>Contact name *</label>
                      <input value={form.contactName} onChange={update("contactName")} placeholder="Owner / manager" required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>Phone *</label>
                      <input value={form.phone} onChange={update("phone")} placeholder="+91 " required />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>Email *</label>
                      <input type="email" value={form.email} onChange={update("email")} placeholder="you@business.com" required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>Website (optional)</label>
                      <input value={form.website} onChange={update("website")} placeholder="https://..." />
                    </div>
                  </div>

                  {bizType === "vendor" && (
                    <div>
                      <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>Locality</label>
                      <input value={form.locality} onChange={update("locality")} placeholder="Area in Nagpur" />
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, color: "var(--ink-soft)" }}>Tell us about your business</label>
                    <textarea rows={4} value={form.message} onChange={update("message")} placeholder="Capacity, services offered, what makes you stand out…" style={{ resize: "none", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", width: "100%" }} />
                  </div>

                  {mutation.error && <p style={{ color: "red", fontSize: 13 }}>Something went wrong. Please try again.</p>}

                  <button className="btn btn-primary btn-lg" type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Submitting…" : <>Submit application <I.Arrow width={14} height={14} /></>}
                  </button>
                  <p style={{ fontSize: 12, color: "var(--ink-mute)", textAlign: "center" }}>
                    No fee to apply. We'll review and reach out within 48 hours.
                  </p>
                </form>
              </>
            )}
          </div>

          <aside>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-lg)", padding: 32, marginBottom: 20 }}>
              <h4 style={{ marginBottom: 16 }}>Why list on Venuees?</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "₹0", title: "Zero commission", body: "We charge no booking commission. The enquiry comes to you directly." },
                  { icon: "📸", title: "Your photos, your story", body: "Upload your own gallery. We don't replace your images with stock photos." },
                  { icon: "📞", title: "Direct leads", body: "Couples call or WhatsApp you. No middleman relay, no delayed replies." },
                  { icon: "✓", title: "Verified badge", body: "After our site visit, your listing gets a 'Verified by Venuees' badge." },
                  { icon: "🗓️", title: "Real-time availability", body: "Update your calendar. Couples see live availability, not outdated dates." },
                ].map((p) => (
                  <div key={p.title} style={{ display: "flex", gap: 14 }}>
                    <div style={{ fontSize: 22, flexShrink: 0, width: 36, textAlign: "center" }}>{p.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{p.title}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.5 }}>{p.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--brand)", color: "#fff", borderRadius: "var(--radius-lg)", padding: 28 }}>
              <h4 style={{ color: "#fff", marginBottom: 8 }}>Questions first?</h4>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                Call us or walk into our Ramdaspeth studio. Tea's always on.
              </p>
              <a href="tel:+917125550180" className="btn" style={{ background: "#fff", color: "var(--brand)", width: "100%", justifyContent: "center", marginBottom: 8 }}>
                <I.Phone width={14} height={14} /> +91 712 555 0180
              </a>
              <a href="mailto:list@venuees.in" className="btn btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", width: "100%", justifyContent: "center" }}>
                list@venuees.in
              </a>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
