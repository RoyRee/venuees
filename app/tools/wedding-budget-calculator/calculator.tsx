"use client";

import { useMemo, useState } from "react";

// Per-head and fixed costs based on typical Nagpur market rates.
const PLATE = { veg: { Essential: 750, Classic: 1100, Premium: 1600 }, nonveg: { Essential: 950, Classic: 1350, Premium: 1900 } };
const VENUE_RENT: Record<string, number> = { "Banquet hall": 80000, "Marriage lawn": 150000, "Hotel ballroom": 250000, "Resort": 350000 };
const DECOR: Record<string, number>      = { Essential: 60000,  Classic: 160000, Premium: 400000 };
const PHOTO: Record<string, number>      = { Essential: 75000,  Classic: 150000, Premium: 300000 };
const MAKEUP: Record<string, number>     = { Essential: 30000,  Classic: 60000,  Premium: 120000 };
const MUSIC: Record<string, number>      = { Essential: 40000,  Classic: 80000,  Premium: 160000 };

const TIERS = ["Essential", "Classic", "Premium"] as const;
type Tier = typeof TIERS[number];

function fmt(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function TierPicker({ value, onChange, label }: { value: Tier; onChange: (t: Tier) => void; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
        {TIERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            style={{
              flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
              background: value === t ? "var(--brand)" : "transparent",
              color: value === t ? "#fff" : "var(--ink-soft)",
              transition: "all .15s",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BudgetCalculator() {
  const [guests, setGuests]   = useState(300);
  const [menu, setMenu]       = useState<"veg" | "nonveg">("veg");
  const [venueType, setVenueType] = useState("Marriage lawn");
  const [catering, setCatering]   = useState<Tier>("Classic");
  const [decor, setDecor]     = useState<Tier>("Classic");
  const [photo, setPhoto]     = useState<Tier>("Classic");
  const [makeup, setMakeup]   = useState<Tier>("Essential");
  const [music, setMusic]     = useState<Tier>("Essential");

  // Lead gate
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [done, setDone]       = useState(false);
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => {
    const cateringCost = guests * PLATE[menu][catering];
    return [
      { label: `Catering — ${guests} guests, ${menu === "veg" ? "veg" : "veg + non-veg"} (${catering})`, value: cateringCost },
      { label: `Venue rent — ${venueType}`, value: VENUE_RENT[venueType] },
      { label: `Décor & mandap (${decor})`, value: DECOR[decor] },
      { label: `Photography & film (${photo})`, value: PHOTO[photo] },
      { label: `Makeup & mehendi (${makeup})`, value: MAKEUP[makeup] },
      { label: `DJ, baraat & entertainment (${music})`, value: MUSIC[music] },
    ];
  }, [guests, menu, venueType, catering, decor, photo, makeup, music]);

  const subtotal = rows.reduce((s, r) => s + r.value, 0);
  const buffer   = Math.round(subtotal * 0.05);
  const total    = subtotal + buffer;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 6) return;
    setLoading(true);
    await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "budget_calculator",
        name: name.trim(),
        phone: phone.trim(),
        guest_count: String(guests),
        message: `Budget calculator result: ${fmt(total)} | ${venueType}, ${menu}, catering ${catering}, décor ${decor}, photo ${photo}, makeup ${makeup}, music ${music}`,
      }),
    }).catch(() => {});
    setLoading(false);
    setDone(true);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28, alignItems: "start", maxWidth: 1000 }}>
      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: "26px 24px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", background: "var(--surface)" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)" }}>Guests</span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 26, color: "var(--brand)" }}>{guests}</span>
          </div>
          <input
            type="range" min={50} max={1500} step={25}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--brand)" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-mute)" }}><span>50</span><span>1500</span></div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 8 }}>Menu</div>
          <div style={{ display: "flex", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
            {(["veg", "nonveg"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMenu(m)}
                style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: menu === m ? "var(--brand)" : "transparent", color: menu === m ? "#fff" : "var(--ink-soft)" }}>
                {m === "veg" ? "Pure veg" : "Veg + non-veg"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 8 }}>Venue type</div>
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
            style={{ width: "100%", padding: "11px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 10, background: "#fff" }}
          >
            {Object.keys(VENUE_RENT).map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>

        <TierPicker label="Catering style" value={catering} onChange={setCatering} />
        <TierPicker label="Décor"          value={decor}    onChange={setDecor} />
        <TierPicker label="Photography"    value={photo}    onChange={setPhoto} />
        <TierPicker label="Makeup & mehendi" value={makeup} onChange={setMakeup} />
        <TierPicker label="DJ & entertainment" value={music} onChange={setMusic} />
      </div>

      {/* Result */}
      <div style={{ position: "sticky", top: 80 }}>
        <div style={{ padding: "26px 24px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", background: "#fff" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 4 }}>
            Estimated total
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 44, color: "var(--ink)", lineHeight: 1.1, marginBottom: 18 }}>
            {fmt(total)}
          </div>

          <div style={{ borderTop: "1px solid var(--line-soft, #eee)" }}>
            {rows.map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line-soft, #f2f2f2)", fontSize: 13 }}>
                <span style={{ color: "var(--ink-soft)" }}>{r.label}</span>
                <span style={{ color: "var(--ink)", fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(r.value)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", fontSize: 13 }}>
              <span style={{ color: "var(--ink-soft)" }}>Buffer & misc (5%)</span>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>{fmt(buffer)}</span>
            </div>
          </div>

          {/* Lead gate */}
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: "2px solid var(--line)" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>✓</div>
                <p style={{ fontSize: 13.5, color: "#444", lineHeight: 1.5 }}>
                  Shortlist on its way! We&rsquo;ll WhatsApp you venues that fit {fmt(total)} within 2 hours.
                </p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                  Get venues that fit this budget
                </div>
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12 }}>
                  We&rsquo;ll WhatsApp you a hand-picked shortlist for {fmt(total)} — free.
                </p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name" required
                    style={{ padding: "11px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}
                  />
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone / WhatsApp" required
                    style={{ padding: "11px 14px", fontSize: 14, border: "1px solid var(--line)", borderRadius: 10, outline: "none" }}
                  />
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                    {loading ? "Sending…" : "WhatsApp me the shortlist"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: "var(--ink-mute)", marginTop: 10, lineHeight: 1.5 }}>
          Estimates based on average Nagpur rates. Actual quotes vary by date, season and venue.
        </p>
      </div>
    </div>
  );
}
