"use client";
import { useState } from "react";
import { MUHURAT_DATES } from "@/lib/muhurat";

type DayState = "avail" | "booked" | "muhurat" | "past";

function buildMonth(year: number, month: number, blocked: Set<string>): {
  label: string; firstDow: number; days: { n: number; state: DayState; iso: string }[];
} {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const label = new Date(year, month, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstDow = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const n = i + 1;
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
    let state: DayState = "avail";
    if (iso < today) state = "past";
    else if (blocked.has(iso)) state = "booked";
    else if (MUHURAT_DATES.has(iso)) state = "muhurat";
    return { n, state, iso };
  });

  return { label, firstDow, days };
}

function scrollToForm(iso: string) {
  window.dispatchEvent(new CustomEvent("selectDate", { detail: iso }));
  const form = document.getElementById("enquiry-form");
  if (form) {
    const top = form.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function CalMonth({ year, month, blocked }: { year: number; month: number; blocked: Set<string> }) {
  const { label, firstDow, days } = buildMonth(year, month, blocked);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", marginBottom: 12 }}>
        {label}
      </div>
      <div className="cal-head">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="cal">
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`pad-${i}`} className="day" style={{ visibility: "hidden" }} />
        ))}
        {days.map((d) => (
          <div
            key={d.n}
            className={`day ${d.state}`}
            title={d.state === "muhurat" ? "✨ Muhurat date — auspicious for weddings" : undefined}
            onClick={d.state === "avail" || d.state === "muhurat" ? () => scrollToForm(d.iso) : undefined}
            style={{
              cursor: d.state === "avail" || d.state === "muhurat" ? "pointer" : "default",
              position: "relative",
            }}
          >
            {d.state === "muhurat" && (
              <span style={{
                position: "absolute", top: 2, right: 3,
                fontSize: 7, lineHeight: 1, color: "#b45309",
              }}>✦</span>
            )}
            {d.n}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VenueCalendar({ blockedDates }: { blockedDates: string[] }) {
  const blocked = new Set(blockedDates);
  const now = new Date();

  // Find the month offset of the first upcoming muhurat date
  function firstMuhuratOffset(): number {
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const upcoming = [...MUHURAT_DATES].sort().find((d) => d >= today);
    if (!upcoming) return 0;
    const [y, m] = upcoming.split("-").map(Number);
    return (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth());
  }

  const [offset, setOffset] = useState(firstMuhuratOffset);

  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button
          onClick={() => setOffset((o) => Math.max(o - 1, 0))}
          disabled={offset === 0}
          style={{ background: "none", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 12px", cursor: offset === 0 ? "default" : "pointer", opacity: offset === 0 ? 0.3 : 1, fontSize: 14, color: "var(--ink)" }}
        >
          ← Earlier
        </button>
        <button
          onClick={() => setOffset((o) => o + 1)}
          style={{ background: "none", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, color: "var(--ink)" }}
        >
          Later →
        </button>
      </div>

      <CalMonth year={d.getFullYear()} month={d.getMonth()} blocked={blocked} />

      <div className="cal-legend" style={{ marginTop: 4 }}>
        <span><span className="dot" style={{ background: "var(--mehendi)" }} /> Available — tap to book</span>
        <span><span className="dot" style={{ background: "#b45309" }} />✦ Muhurat</span>
        <span><span className="dot" style={{ background: "var(--line)" }} /> Booked</span>
      </div>
    </div>
  );
}
