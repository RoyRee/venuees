"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { I } from "./icons";

const TYPES = [
  { slug: "hotel",    label: "Hotels & ballrooms" },
  { slug: "lawn",     label: "Lawns & banquets" },
  { slug: "resort",   label: "Resorts" },
  { slug: "heritage", label: "Heritage venues" },
  { slug: "farmhouse",label: "Farmhouses" },
  { slug: "banquet",  label: "Banquet halls" },
];

const LOCALITIES = [
  "Wardha Road", "Ramdaspeth", "Civil Lines",
  "Koradi Road", "Katol Road", "MIHAN",
];

const AMENITIES = [
  { key: "rooms",    label: "Rooms on-site" },
  { key: "parking",  label: "Parking 100+" },
  { key: "bar",      label: "Alcohol / bar" },
  { key: "dj",       label: "Late-night DJ" },
  { key: "generator",label: "Generator backup" },
  { key: "catering", label: "In-house catering" },
];

const RATINGS = [
  { value: "4.5", label: "4.5 & above" },
  { value: "4.8", label: "4.8 & above" },
];

const CAP_OPTIONS = [
  { value: "100",  label: "100+" },
  { value: "300",  label: "300+" },
  { value: "500",  label: "500+" },
  { value: "800",  label: "800+" },
  { value: "1200", label: "1,200+" },
];

const PLATE_OPTIONS = [
  { value: "800",  label: "Under ₹800" },
  { value: "1000", label: "Under ₹1,000" },
  { value: "1200", label: "Under ₹1,200" },
  { value: "1500", label: "Under ₹1,500" },
  { value: "2000", label: "Under ₹2,000" },
];

export function VenueFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const push = useCallback((params: URLSearchParams) => {
    startTransition(() => {
      router.push(`/venues?${params.toString()}`, { scroll: false });
    });
  }, [router]);

  function getParams() {
    return new URLSearchParams(sp.toString());
  }

  // Toggle a multi-value param (types[], localities[])
  function toggleMulti(key: string, value: string) {
    const params = getParams();
    const current = params.getAll(key);
    params.delete(key);
    if (current.includes(value)) {
      current.filter(v => v !== value).forEach(v => params.append(key, v));
    } else {
      [...current, value].forEach(v => params.append(key, v));
    }
    push(params);
  }

  // Toggle a boolean flag param
  function toggleFlag(key: string) {
    const params = getParams();
    if (params.has(key)) params.delete(key);
    else params.set(key, "1");
    push(params);
  }

  // Set or clear a single-value param
  function setParam(key: string, value: string | null) {
    const params = getParams();
    if (value) params.set(key, value); else params.delete(key);
    push(params);
  }

  // Helpers
  const isType      = (v: string) => sp.getAll("type").includes(v);
  const isLocality  = (v: string) => sp.getAll("locality").includes(v);
  const hasFlag     = (k: string) => sp.has(k);
  const activeCount = [...sp.keys()].filter(k => !["q", "sort"].includes(k)).length;

  function clearAll() {
    const params = getParams();
    ["type", "locality", "minCap", "maxVegPlate", "minRating",
     "rooms", "parking", "bar", "dj", "generator", "catering"].forEach(k => params.delete(k));
    push(params);
  }

  return (
    <>
      {/* Mobile toggle button — only visible ≤1000px */}
      <button
        className="filter-toggle-btn"
        onClick={() => {
          document.getElementById("venue-filters-aside")?.classList.toggle("mobile-open");
        }}
      >
        <I.SlidersH width={15} height={15} />
        Filters
        {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
        {pending && <span className="filter-pending" />}
      </button>

      <aside id="venue-filters-aside" className="vl-filters">
        {/* Header row */}
        <div className="f-header">
          <span>Filters {activeCount > 0 && `(${activeCount})`}</span>
          {activeCount > 0 && (
            <button className="f-clear-all" onClick={clearAll}>Clear all</button>
          )}
          {/* Close button for mobile overlay */}
          <button
            className="f-close-btn"
            onClick={() => document.getElementById("venue-filters-aside")?.classList.remove("mobile-open")}
          >
            <I.X width={18} height={18} />
          </button>
        </div>

        {/* Venue type */}
        <div className="f-group">
          <h6>Venue type</h6>
          {TYPES.map(t => (
            <label key={t.slug} className={isType(t.slug) ? "f-active" : ""}>
              <input
                type="checkbox"
                checked={isType(t.slug)}
                onChange={() => toggleMulti("type", t.slug)}
              />
              {t.label}
            </label>
          ))}
        </div>

        {/* Locality */}
        <div className="f-group">
          <h6>Locality</h6>
          {LOCALITIES.map(l => (
            <label key={l} className={isLocality(l) ? "f-active" : ""}>
              <input
                type="checkbox"
                checked={isLocality(l)}
                onChange={() => toggleMulti("locality", l)}
              />
              {l}
            </label>
          ))}
        </div>

        {/* Capacity */}
        <div className="f-group">
          <h6>Min capacity</h6>
          <div className="f-chips">
            {CAP_OPTIONS.map(o => (
              <button
                key={o.value}
                className={`f-chip ${sp.get("minCap") === o.value ? "active" : ""}`}
                onClick={() => setParam("minCap", sp.get("minCap") === o.value ? null : o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Veg plate budget */}
        <div className="f-group">
          <h6>Veg plate budget</h6>
          <div className="f-chips">
            {PLATE_OPTIONS.map(o => (
              <button
                key={o.value}
                className={`f-chip ${sp.get("maxVegPlate") === o.value ? "active" : ""}`}
                onClick={() => setParam("maxVegPlate", sp.get("maxVegPlate") === o.value ? null : o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Must-haves */}
        <div className="f-group">
          <h6>Must-haves</h6>
          {AMENITIES.map(a => (
            <label key={a.key} className={hasFlag(a.key) ? "f-active" : ""}>
              <input
                type="checkbox"
                checked={hasFlag(a.key)}
                onChange={() => toggleFlag(a.key)}
              />
              {a.label}
            </label>
          ))}
        </div>

        {/* Rating */}
        <div className="f-group" style={{ borderBottom: "none" }}>
          <h6>Minimum rating</h6>
          {RATINGS.map(r => (
            <label key={r.value} className={sp.get("minRating") === r.value ? "f-active" : ""}>
              <input
                type="radio"
                name="minRating"
                checked={sp.get("minRating") === r.value}
                onChange={() => setParam("minRating", sp.get("minRating") === r.value ? null : r.value)}
              />
              {r.label}
            </label>
          ))}
        </div>

        {pending && <div className="f-loading">Updating…</div>}
      </aside>
    </>
  );
}
