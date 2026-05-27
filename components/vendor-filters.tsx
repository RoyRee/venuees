"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { I } from "./icons";

const PRICE_OPTIONS = [
  { value: "20000",  label: "Under ₹20k" },
  { value: "50000",  label: "Under ₹50k" },
  { value: "100000", label: "Under ₹1L" },
  { value: "200000", label: "Under ₹2L" },
  { value: "500000", label: "Under ₹5L" },
];

const YEARS_OPTIONS = [
  { value: "2",  label: "2+ years" },
  { value: "5",  label: "5+ years" },
  { value: "10", label: "10+ years" },
];

const RATING_OPTIONS = [
  { value: "4.0", label: "4.0 & above" },
  { value: "4.5", label: "4.5 & above" },
  { value: "4.8", label: "4.8 & above" },
];

const LOCALITIES = [
  "Dharampeth", "Civil Lines", "Sitabuldi",
  "Ramdaspeth", "Laxmi Nagar", "Wardha Road",
];

export function VendorFilters({ basePath }: { basePath: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const push = useCallback((params: URLSearchParams) => {
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`, { scroll: false });
    });
  }, [router, basePath]);

  function getParams() { return new URLSearchParams(sp.toString()); }

  function setParam(key: string, value: string | null) {
    const params = getParams();
    if (value) params.set(key, value); else params.delete(key);
    push(params);
  }

  function toggleLocality(loc: string) {
    const params = getParams();
    if (params.get("locality") === loc) params.delete("locality");
    else params.set("locality", loc);
    push(params);
  }

  const activeCount = [...sp.keys()].filter(k => k !== "sort").length;

  function clearAll() {
    const params = getParams();
    ["maxPrice", "minYears", "locality", "minRating"].forEach(k => params.delete(k));
    push(params);
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="filter-toggle-btn"
        onClick={() => document.getElementById("vendor-filters-aside")?.classList.toggle("mobile-open")}
      >
        <I.SlidersH width={15} height={15} />
        Filters
        {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
      </button>

      <aside id="vendor-filters-aside" className="vl-filters">
        <div className="f-header">
          <span>Filters {activeCount > 0 && `(${activeCount})`}</span>
          {activeCount > 0 && <button className="f-clear-all" onClick={clearAll}>Clear all</button>}
          <button
            className="f-close-btn"
            onClick={() => document.getElementById("vendor-filters-aside")?.classList.remove("mobile-open")}
          >
            <I.X width={18} height={18} />
          </button>
        </div>

        {/* Price */}
        <div className="f-group">
          <h6>Max price</h6>
          <div className="f-chips">
            {PRICE_OPTIONS.map(o => (
              <button
                key={o.value}
                className={`f-chip ${sp.get("maxPrice") === o.value ? "active" : ""}`}
                onClick={() => setParam("maxPrice", sp.get("maxPrice") === o.value ? null : o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="f-group">
          <h6>Experience</h6>
          {YEARS_OPTIONS.map(o => (
            <label key={o.value} className={sp.get("minYears") === o.value ? "f-active" : ""}>
              <input
                type="radio"
                name="minYears"
                checked={sp.get("minYears") === o.value}
                onChange={() => setParam("minYears", sp.get("minYears") === o.value ? null : o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>

        {/* Locality */}
        <div className="f-group">
          <h6>Based in</h6>
          {LOCALITIES.map(l => (
            <label key={l} className={sp.get("locality") === l ? "f-active" : ""}>
              <input
                type="checkbox"
                checked={sp.get("locality") === l}
                onChange={() => toggleLocality(l)}
              />
              {l}
            </label>
          ))}
        </div>

        {/* Rating */}
        <div className="f-group" style={{ borderBottom: "none" }}>
          <h6>Minimum rating</h6>
          {RATING_OPTIONS.map(r => (
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
