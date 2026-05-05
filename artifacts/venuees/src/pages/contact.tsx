import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TopNav, MobileNav, MobileTabbar } from "../components/nav";
import { Footer } from "../components/footer";
import { Ornament, I } from "../components/icons";
import { api } from "../lib/api";

const SITE = {
  phone: "+91 712 555 0180",
  address: "Plot 14, Ramdaspeth, Nagpur 440010",
  email: "hello@venuees.in",
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", phone: "+91 ", email: "", interest: "Wedding venue in Nagpur",
    guestCount: "150-500", eventDate: "", budget: "₹5L – ₹15L", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.enquiries.submit({
      kind: "contact",
      name: form.name,
      phone: form.phone,
      email: form.email,
      guestCount: form.guestCount,
      eventDate: form.eventDate,
      message: `Interest: ${form.interest}\nBudget: ${form.budget}\n\n${form.message}`,
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
        <Ornament>GET IN TOUCH</Ornament>
        <h1>Let&rsquo;s plan something <span className="italic-serif" style={{ color: "var(--brand)" }}>properly.</span></h1>
        <p>Share the basics and we&rsquo;ll reply within two hours during business days. Walk-ins to our Ramdaspeth studio are always welcome — tea&rsquo;s on us.</p>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 60 }} className="contact-grid">

          <div style={{ background: "var(--brand)", color: "#fff", padding: 48, borderRadius: "var(--radius-lg)" }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.05, marginBottom: 20 }}>Enquire</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.6, marginBottom: 30 }}>
              Tell us what you&rsquo;re planning. The more you share, the sharper our first reply.
            </p>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#fff" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>
                <h3 style={{ color: "#fff", marginBottom: 8 }}>We've got your enquiry!</h3>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Expect a call or WhatsApp from us within 2 hours (9am–7pm IST).</p>
              </div>
            ) : (
              <form className="enq-fields" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
                <div><label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Your name</label>
                  <input placeholder="Full name" value={form.name} onChange={update("name")} required style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }} /></div>
                <div className="row2">
                  <div><label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Phone</label>
                    <input placeholder="+91 " value={form.phone} onChange={update("phone")} required style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }} /></div>
                  <div><label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Email</label>
                    <input placeholder="you@example.com" type="email" value={form.email} onChange={update("email")} style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }} /></div>
                </div>
                <div className="row2">
                  <div><label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Interested in</label>
                    <select value={form.interest} onChange={update("interest")} style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
                      <option>Wedding venue in Nagpur</option>
                      <option>Signature Resorts specifically</option>
                      <option>Weekend getaway</option>
                      <option>Destination wedding</option>
                      <option>Vendors only</option>
                      <option>Event management</option>
                      <option>Corporate event</option>
                    </select>
                  </div>
                  <div><label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Guest count</label>
                    <select value={form.guestCount} onChange={update("guestCount")} style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
                      <option value="Under 150">Under 150</option>
                      <option value="150-500">150–500</option>
                      <option value="500-1000">500–1,000</option>
                      <option value="1000+">1,000+</option>
                    </select>
                  </div>
                </div>
                <div className="row2">
                  <div><label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Event month</label>
                    <input placeholder="e.g. Dec 2026" value={form.eventDate} onChange={update("eventDate")} style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }} /></div>
                  <div><label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Budget range</label>
                    <select value={form.budget} onChange={update("budget")} style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }}>
                      <option>Under ₹5L</option>
                      <option>₹5L – ₹15L</option>
                      <option>₹15L – ₹50L</option>
                      <option>₹50L+</option>
                    </select>
                  </div>
                </div>
                <div><label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Tell us more</label>
                  <textarea rows={4} placeholder="Rituals, themes, dietary needs, accessibility..." value={form.message} onChange={update("message")} style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", resize: "none", fontFamily: "inherit", fontSize: 14, padding: "10px 12px", borderRadius: "var(--radius-sm)", width: "100%" }} /></div>
                {mutation.error && <p style={{ color: "#ffb3b3", fontSize: 12 }}>Something went wrong. Please try again.</p>}
                <button className="enq-submit" type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Sending…" : "Send enquiry"}
                </button>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>No credit card · No spam · Reply in 2 hours (9am–7pm IST)</div>
              </form>
            )}
          </div>

          <aside>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: 28, marginBottom: 20 }}>
              <h4 style={{ marginBottom: 16 }}>Studio address</h4>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)" }}>{SITE.address}</p>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="btn btn-ghost" style={{ justifyContent: "center", gap: 8 }}>
                  <I.Phone width={14} height={14} /> {SITE.phone}
                </a>
                <a href={`mailto:${SITE.email}`} className="btn btn-ghost" style={{ justifyContent: "center", gap: 8 }}>
                  {SITE.email}
                </a>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: 28, marginBottom: 20 }}>
              <h4 style={{ marginBottom: 12 }}>Office hours</h4>
              <div style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 2 }}>
                <div>Mon – Sat · 9am – 7pm IST</div>
                <div>Sunday · 10am – 4pm IST</div>
                <div style={{ color: "var(--ink-mute)", fontSize: 12, marginTop: 8 }}>WhatsApp preferred for quick queries</div>
              </div>
            </div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--line-soft)", borderRadius: "var(--radius-md)", padding: 28 }}>
              <h4 style={{ marginBottom: 12 }}>List your business</h4>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 16 }}>Own a venue, vendor service, or getaway property? Apply to list on Venuees.in.</p>
              <a href="/list-your-business" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>Apply to list <I.Arrow width={13} height={13} /></a>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
