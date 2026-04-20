"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { I } from "@/components/icons";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Next 20 months, e.g. ["May 2026", "Jun 2026", …] */
function buildMonths(): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < 20; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d.toLocaleString("en-IN", { month: "short", year: "numeric" }));
  }
  return months;
}
const MONTHS = buildMonths();

const GUEST_OPTIONS = [
  { label: "Under 100", value: "<100" },
  { label: "100 – 200", value: "100-200" },
  { label: "200 – 400", value: "200-400" },
  { label: "400 – 700", value: "400-700" },
  { label: "700 – 1,000", value: "700-1000" },
  { label: "1,000+", value: "1000+" },
];

const VENDOR_CATEGORIES = [
  { label: "All services", value: "" },
  { label: "Photographers", value: "photographers" },
  { label: "Decorators", value: "decorators" },
  { label: "Makeup artists", value: "makeup" },
  { label: "Caterers", value: "caterers" },
  { label: "Music / DJ", value: "music" },
  { label: "Pandits", value: "pandits" },
  { label: "Event planners", value: "planners" },
];

const DESTINATIONS = [
  { label: "Any destination", value: "" },
  { label: "Udaipur", value: "udaipur" },
  { label: "Goa", value: "goa" },
  { label: "Jaipur", value: "jaipur" },
  { label: "Coorg", value: "coorg" },
  { label: "Jaisalmer", value: "jaisalmer" },
  { label: "Rishikesh", value: "rishikesh" },
];

type Tab = "venues" | "getaways" | "destinations" | "vendors";

const TABS: { id: Tab; label: string }[] = [
  { id: "venues", label: "Venues" },
  { id: "getaways", label: "Weekend getaways" },
  { id: "destinations", label: "Destination weddings" },
  { id: "vendors", label: "Vendors" },
];

// ── Field sub-components ──────────────────────────────────────────────────────

function Field({
  icon,
  label,
  children,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`hs-field${last ? " hs-field--last" : ""}`}>
      <span className="hs-field-icon">{icon}</span>
      <div className="hs-field-body">
        <small>{label}</small>
        {children}
      </div>
    </div>
  );
}

// A native <select> styled to look like the plain text input
function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <select
      className="hs-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function HeroSearch() {
  const router = useRouter();
  const tabBarRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>("venues");

  // Venues
  const [venueDate, setVenueDate] = useState(MONTHS[7]);   // ~7 months out
  const [venueGuests, setVenueGuests] = useState("200-400");

  // Getaways
  const [getawayDate, setGetawayDate] = useState(MONTHS[2]);

  // Destinations
  const [destination, setDestination] = useState("");
  const [destGuests, setDestGuests] = useState("100-200");

  // Vendors
  const [vendorCategory, setVendorCategory] = useState("");

  function handleSearch() {
    if (tab === "venues") {
      const p = new URLSearchParams({ date: venueDate, guests: venueGuests });
      router.push(`/venues?${p}`);
    } else if (tab === "getaways") {
      const p = new URLSearchParams({ date: getawayDate });
      router.push(`/weekend-getaways?${p}`);
    } else if (tab === "destinations") {
      const p = new URLSearchParams({ guests: destGuests });
      if (destination) p.set("destination", destination);
      router.push(`/destination-weddings?${p}`);
    } else {
      const base = vendorCategory ? `/vendors/${vendorCategory}` : "/vendors";
      router.push(base);
    }
  }

  // Scroll active tab into view on mobile
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const btn = bar.querySelector<HTMLButtonElement>(".hs-tab.active");
    if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [tab]);

  return (
    <div className="hs">
      {/* ── Tabs ── */}
      <div className="hs-tabs" ref={tabBarRef} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`hs-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Fields ── */}
      <div className="hs-fields" role="tabpanel">
        {tab === "venues" && (
          <>
            <Field icon={<I.Pin width={17} height={17} />} label="WHERE">
              <span className="hs-fixed">Nagpur</span>
            </Field>

            <Field icon={<I.Cal width={17} height={17} />} label="WHEN">
              <SelectField
                value={venueDate}
                onChange={setVenueDate}
                options={MONTHS.map((m) => ({ label: m, value: m }))}
              />
            </Field>

            <Field icon={<I.Users width={17} height={17} />} label="GUESTS">
              <SelectField
                value={venueGuests}
                onChange={setVenueGuests}
                options={GUEST_OPTIONS}
              />
            </Field>
          </>
        )}

        {tab === "getaways" && (
          <>
            <Field icon={<I.Pin width={17} height={17} />} label="FROM">
              <span className="hs-fixed">Nagpur</span>
            </Field>

            <Field icon={<I.Cal width={17} height={17} />} label="WHEN">
              <SelectField
                value={getawayDate}
                onChange={setGetawayDate}
                options={MONTHS.map((m) => ({ label: m, value: m }))}
              />
            </Field>
          </>
        )}

        {tab === "destinations" && (
          <>
            <Field icon={<I.Pin width={17} height={17} />} label="DESTINATION">
              <SelectField
                value={destination}
                onChange={setDestination}
                options={DESTINATIONS}
              />
            </Field>

            <Field icon={<I.Users width={17} height={17} />} label="GUESTS">
              <SelectField
                value={destGuests}
                onChange={setDestGuests}
                options={GUEST_OPTIONS}
              />
            </Field>
          </>
        )}

        {tab === "vendors" && (
          <>
            <Field icon={<I.Search width={17} height={17} />} label="SERVICE">
              <SelectField
                value={vendorCategory}
                onChange={setVendorCategory}
                options={VENDOR_CATEGORIES}
              />
            </Field>

            <Field icon={<I.Pin width={17} height={17} />} label="WHERE">
              <span className="hs-fixed">Nagpur</span>
            </Field>
          </>
        )}

        <button className="hs-btn" onClick={handleSearch} aria-label="Search">
          <I.Search width={16} height={16} />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
}
