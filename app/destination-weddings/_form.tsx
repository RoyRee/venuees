"use client";

import { useState, useTransition } from "react";

const DESTINATIONS = ["Udaipur", "Goa", "Jaipur", "Coorg", "Jaisalmer", "Rishikesh", "Not sure yet"];
const MONTHS = ["Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027", "Mar 2027", "Apr 2027"];
const BUDGETS = ["Under ₹25L", "₹25L – ₹50L", "₹50L – ₹1Cr", "₹1Cr+"];

export function DestinationEnquiryForm() {
  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [destination, setDestination] = useState("Udaipur");
  const [month,       setMonth]       = useState("Nov 2026");
  const [guests,      setGuests]      = useState("80");
  const [budget,      setBudget]      = useState("Under ₹25L");
  const [message,     setMessage]     = useState("");
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);
  const [isPending, startTransition]  = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "destination_enquiry",
          name,
          phone,
          guest_count: guests,
          message: `Destination: ${destination} | Month: ${month} | Budget: ${budget}${message ? " | " + message : ""}`,
        }),
      });
      if (res.ok) setSuccess(true);
      else setError("Something went wrong. Please try again.");
    });
  }

  if (success) {
    return (
      <div className="enq-fields" style={{ alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }}>
          Got it! We&rsquo;ll call you back within 2 hours with a venue shortlist and estimate.
        </p>
      </div>
    );
  }

  return (
    <div className="enq-fields">
      <form onSubmit={handleSubmit} style={{ display: "contents" }}>
        <div>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
        </div>
        <div>
          <label>Phone / WhatsApp</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 " required />
        </div>
        <div className="row2">
          <div>
            <label>Destination</label>
            <select value={destination} onChange={(e) => setDestination(e.target.value)}>
              {DESTINATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className="row2">
          <div>
            <label>Guests</label>
            <input value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="80" />
          </div>
          <div>
            <label>Budget (INR)</label>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              {BUDGETS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label>Anything else?</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Preferred vibe, guest profile, specific dates…"
          />
        </div>
        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(255,0,0,0.15)", borderRadius: 6, fontSize: 13, color: "#fff" }}>
            {error}
          </div>
        )}
        <button type="submit" className="enq-submit" disabled={isPending}>
          {isPending ? "Sending…" : "Get a plan · free consult"}
        </button>
      </form>
    </div>
  );
}
