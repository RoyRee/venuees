"use client";
import { useState } from "react";
import { I } from "@/components/icons";

type EnquiryFormProps = {
  kind: "venue_enquiry" | "vendor_enquiry" | "getaway_enquiry" | "contact" | "homepage_lead";
  venueSlug?: string;
  vendorSlug?: string;
  getawaySlug?: string;
  venueName?: string;
  contactPhone?: string;
  whatsapp?: string;
  /** visual variant — 'sidebar' (venue detail) | 'section' (contact/event pages) */
  variant?: "sidebar" | "section";
};

export function EnquiryForm({
  kind,
  venueSlug,
  vendorSlug,
  getawaySlug,
  venueName,
  contactPhone,
  whatsapp,
  variant = "sidebar",
}: EnquiryFormProps) {
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("+91 ");
  const [email, setEmail]         = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guests, setGuests]       = useState("150–500");
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 6) {
      setError("Please fill in your name and phone number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          venue_slug:   venueSlug   ?? null,
          vendor_slug:  vendorSlug  ?? null,
          getaway_slug: getawaySlug ?? null,
          name:         name.trim(),
          phone:        phone.trim(),
          email:        email.trim() || null,
          event_date:   eventDate.trim() || null,
          guest_count:  guests || null,
          message:      message.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setDone(true);
      } else {
        setError("Something went wrong — please try again or call us directly.");
      }
    } catch {
      setError("Could not reach the server. Please call or WhatsApp us.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ padding: "28px 24px", background: "var(--surface-tint)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>🎉</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 8 }}>
          We&rsquo;ve got your details!
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
          Expect a call or WhatsApp from us within 2 hours (9am–7pm IST).
          {venueName && <> We&rsquo;ll confirm availability at <b>{venueName}</b> for you.</>}
        </p>
      </div>
    );
  }

  const isSidebar = variant === "sidebar";

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        placeholder="Phone · +91"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        style={inputStyle}
      />
      {!isSidebar && (
        <input
          placeholder="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
      )}
      <input
        placeholder="Event date (or month)"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        style={inputStyle}
      />
      <select
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
        style={inputStyle}
      >
        <option value="">Guest count</option>
        <option value="Under 150">Under 150 guests</option>
        <option value="150–500">150–500 guests</option>
        <option value="500–1,000">500–1,000 guests</option>
        <option value="1,000+">1,000+ guests</option>
      </select>
      {!isSidebar && (
        <textarea
          placeholder="Tell us more — theme, must-haves, questions..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      )}

      {error && (
        <div style={{ fontSize: 12, color: "#c00", padding: "8px 12px", background: "#fff0f0", borderRadius: 6 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-lg"
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Sending…" : "Request availability"} {!loading && <I.Arrow width={14} height={14} />}
      </button>

      {(contactPhone || whatsapp) && (
        <div style={{ display: "flex", gap: 8 }}>
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="btn btn-ghost"
              style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
            >
              <I.Phone width={14} height={14} /> Call
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/91${whatsapp.replace(/\D/g, "")}?text=Hi, I'm interested in ${venueName ?? "your listing"} on Venuees.in`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
            >
              WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="tinyline">No spam. No credit card. Reply in 2 hours.</div>
    </form>
  );
}

// ── Standalone contact page form ─────────────────────────────────────────────

export function ContactEnquiryForm() {
  const [fields, setFields] = useState({
    name: "", phone: "+91 ", email: "", interested: "Wedding venue in Nagpur",
    guests: "Under 150", month: "", budget: "₹5L – ₹15L", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.name.trim() || fields.phone.trim().length < 6) {
      setError("Name and phone are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind:        "contact",
          name:        fields.name.trim(),
          phone:       fields.phone.trim(),
          email:       fields.email.trim() || null,
          event_date:  fields.month.trim() || null,
          guest_count: fields.guests,
          message:     `Interested in: ${fields.interested}. Budget: ${fields.budget}. ${fields.message}`.trim(),
        }),
      });
      const json = await res.json();
      if (json.ok) setDone(true);
      else setError("Something went wrong. Please call us directly.");
    } catch {
      setError("Could not reach the server. Please call or WhatsApp us.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ padding: "40px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "#fff", marginBottom: 10 }}>
          Got it — we&rsquo;ll be in touch within 2 hours.
        </div>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
          Check your WhatsApp and email. Our duty planner will reach out shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="enq-fields">
      <div><label>Your name</label><input value={fields.name} onChange={set("name")} placeholder="Full name" required style={inputStyle} /></div>
      <div className="row2">
        <div><label>Phone</label><input value={fields.phone} onChange={set("phone")} placeholder="+91 " required style={inputStyle} /></div>
        <div><label>Email</label><input type="email" value={fields.email} onChange={set("email")} placeholder="you@example.com" style={inputStyle} /></div>
      </div>
      <div className="row2">
        <div>
          <label>Interested in</label>
          <select value={fields.interested} onChange={set("interested")} style={inputStyle}>
            <option>Wedding venue in Nagpur</option>
            <option>Signature Resorts specifically</option>
            <option>Weekend getaway</option>
            <option>Destination wedding</option>
            <option>Vendors only</option>
            <option>Event management</option>
            <option>Corporate event</option>
          </select>
        </div>
        <div>
          <label>Guest count</label>
          <select value={fields.guests} onChange={set("guests")} style={inputStyle}>
            <option>Under 150</option>
            <option>150–500</option>
            <option>500–1000</option>
            <option>1000+</option>
          </select>
        </div>
      </div>
      <div className="row2">
        <div><label>Event month</label><input value={fields.month} onChange={set("month")} placeholder="e.g. Dec 2026" style={inputStyle} /></div>
        <div>
          <label>Budget range</label>
          <select value={fields.budget} onChange={set("budget")} style={inputStyle}>
            <option>Under ₹5L</option>
            <option>₹5L – ₹15L</option>
            <option>₹15L – ₹50L</option>
            <option>₹50L+</option>
          </select>
        </div>
      </div>
      <div><label>Tell us more</label><textarea value={fields.message} onChange={set("message")} rows={4} placeholder="Rituals, themes, dietary needs, accessibility..." style={{ ...inputStyle, resize: "vertical" }} /></div>
      {error && <div style={{ fontSize: 12, color: "#ffa", padding: "8px 12px", background: "rgba(255,0,0,0.15)", borderRadius: 6 }}>{error}</div>}
      <button type="submit" disabled={loading} className="enq-submit" style={{ opacity: loading ? 0.7 : 1 }}>
        {loading ? "Sending…" : "Send enquiry"}
      </button>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>No credit card · No spam · Reply in 2 hours (9am–7pm IST)</div>
    </form>
  );
}

// ── Event management page form ───────────────────────────────────────────────

export function EventEnquiryForm() {
  const [fields, setFields] = useState({
    name: "", phone: "+91 ", eventType: "Wedding",
    guests: "120", date: "", budget: "₹5L – ₹25L", brief: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.name.trim() || fields.phone.trim().length < 6) {
      setError("Name and phone are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind:        "contact",
          name:        fields.name.trim(),
          phone:       fields.phone.trim(),
          event_date:  fields.date.trim() || null,
          guest_count: fields.guests.trim() || null,
          message:     `Event type: ${fields.eventType}. Budget: ${fields.budget}. ${fields.brief}`.trim(),
        }),
      });
      const json = await res.json();
      if (json.ok) setDone(true);
      else setError("Something went wrong — please try again or call us.");
    } catch {
      setError("Could not reach the server. Please call or WhatsApp us.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink)", marginBottom: 8 }}>
          Brief received — we&rsquo;ll reply within one business day.
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
          Our event team will call or WhatsApp you on the number you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="enq-fields">
      <div><label>Name</label><input value={fields.name} onChange={set("name")} placeholder="Your full name" required style={inputStyle} /></div>
      <div><label>Phone / WhatsApp</label><input value={fields.phone} onChange={set("phone")} placeholder="+91 " required style={inputStyle} /></div>
      <div className="row2">
        <div>
          <label>Event type</label>
          <select value={fields.eventType} onChange={set("eventType")} style={inputStyle}>
            <option>Wedding</option>
            <option>Corporate</option>
            <option>Birthday/anniversary</option>
            <option>Festival party</option>
            <option>Other</option>
          </select>
        </div>
        <div><label>Guests</label><input value={fields.guests} onChange={set("guests")} placeholder="120" style={inputStyle} /></div>
      </div>
      <div className="row2">
        <div><label>Date</label><input value={fields.date} onChange={set("date")} placeholder="DD Mon YYYY" style={inputStyle} /></div>
        <div>
          <label>Budget</label>
          <select value={fields.budget} onChange={set("budget")} style={inputStyle}>
            <option>Under ₹5L</option>
            <option>₹5L – ₹25L</option>
            <option>₹25L+</option>
            <option>Not sure</option>
          </select>
        </div>
      </div>
      <div><label>Brief</label><textarea value={fields.brief} onChange={set("brief")} rows={3} placeholder="Theme, audience, must-haves..." style={{ ...inputStyle, resize: "vertical" }} /></div>
      {error && <div style={{ fontSize: 12, color: "#c00", padding: "8px 12px", background: "#fff0f0", borderRadius: 6 }}>{error}</div>}
      <button type="submit" disabled={loading} className="enq-submit" style={{ opacity: loading ? 0.7 : 1 }}>
        {loading ? "Sending…" : "Send brief"}
      </button>
    </form>
  );
}

const inputStyle: React.CSSProperties = {};
