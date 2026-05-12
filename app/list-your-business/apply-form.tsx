"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Venue · hotel", "Venue · lawn", "Venue · heritage", "Venue · farmhouse",
  "Photography", "Décor", "Catering", "Makeup", "Music / DJ", "Other vendor",
];

export function ApplyForm({ prefillEmail, prefillName }: { prefillEmail?: string; prefillName?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    startTransition(async () => {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/dashboard?applied=1");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="enq-fields">
      <div>
        <label>Business name</label>
        <input name="businessName" placeholder="e.g. Orange County Farms" required />
      </div>
      <div>
        <label>Owner / contact name</label>
        <input name="contactName" defaultValue={prefillName ?? ""} placeholder="Your full name" required />
      </div>
      <div className="row2">
        <div>
          <label>Phone</label>
          <input name="phone" type="tel" placeholder="+91 " required />
        </div>
        <div>
          <label>Category</label>
          <select name="businessType" required>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="row2">
        <div>
          <label>Email</label>
          <input name="email" type="email" defaultValue={prefillEmail ?? ""} placeholder="you@example.com" required />
        </div>
        <div>
          <label>City</label>
          <input name="city" placeholder="Nagpur" defaultValue="Nagpur" required />
        </div>
      </div>
      <div>
        <label>Locality / area</label>
        <input name="locality" placeholder="e.g. Civil Lines, Wardha Road" />
      </div>
      <div>
        <label>Website / Instagram / portfolio link</label>
        <input name="website" placeholder="URL" />
      </div>
      <div>
        <label>Tell us about your work</label>
        <textarea name="message" rows={4} placeholder="Years in business, last 3 weddings, capacity..." />
      </div>
      {error && (
        <div style={{ padding: "10px 14px", background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, fontSize: 13, color: "#c00" }}>
          {error}
        </div>
      )}
      <button type="submit" className="enq-submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
