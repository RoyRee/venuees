"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { I } from "./icons";
import type { RecentItem } from "./record-view";

const MODAL_KEY   = "venuees_modal_shown";
const VISIT_KEY   = "venuees_last_visit";
const RECENT_KEY  = "venuees_recent";
const MODAL_GAP   = 7 * 24 * 60 * 60 * 1000; // 7 days
const MIN_AWAY    = 1 * 24 * 60 * 60 * 1000;  // must have been gone at least 1 day
const MAX_AWAY    = 30 * 24 * 60 * 60 * 1000; // but not more than 30 days

function itemUrl(v: RecentItem): string {
  if (v.type === "vendor") return `/vendors/${v.categorySlug ?? ""}/${v.slug}`;
  if (v.type === "getaway") return `/weekend-getaways/${v.slug}`;
  const localitySlug = v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-");
  return `/venues/nagpur/${localitySlug}/${v.slug}`;
}

function sectionFor(type: RecentItem["type"] | undefined): string {
  if (type === "vendor") return "section_vendors";
  if (type === "getaway") return "section_getaways";
  return "section_venues";
}

function priceDetail(v: RecentItem): string {
  if (v.vegPlate <= 0) return "";
  if (v.type === "vendor") return `From ₹${v.vegPlate.toLocaleString("en-IN")}`;
  if (v.type === "getaway") return `₹${v.vegPlate.toLocaleString("en-IN")}/night`;
  return `₹${v.vegPlate.toLocaleString("en-IN")}/plate`;
}

export function WelcomeBackModal({ enabledSections }: { enabledSections?: string[] }) {
  const [show, setShow] = useState(false);
  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const now      = Date.now();
      const lastVisit = parseInt(localStorage.getItem(VISIT_KEY) ?? "0", 10);
      const lastModal = parseInt(localStorage.getItem(MODAL_KEY) ?? "0", 10);
      const away      = now - lastVisit;

      localStorage.setItem(VISIT_KEY, String(now));

      if (lastVisit > 0 && away >= MIN_AWAY && away <= MAX_AWAY && now - lastModal >= MODAL_GAP) {
        const all: RecentItem[] = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
        const filtered = enabledSections
          ? all.filter((v) => enabledSections.includes(sectionFor(v.type)))
          : all;
        if (filtered.length > 0) {
          setRecent(filtered.slice(0, 3));
          setTimeout(() => setShow(true), 1200);
        }
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    localStorage.setItem(MODAL_KEY, String(Date.now()));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      onClick={dismiss}
      style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 80px" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--bg)", borderRadius: 18, padding: "28px 24px", width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,0.22)", animation: "slideUp 0.3s ease" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Welcome back</div>
            <h3 style={{ fontSize: 20, fontFamily: "var(--font-serif)", lineHeight: 1.2, margin: 0 }}>
              Pick up where you <span style={{ fontStyle: "italic", color: "var(--brand)" }}>left off.</span>
            </h3>
          </div>
          <button onClick={dismiss} style={{ cursor: "pointer", color: "var(--ink-mute)", padding: 4, marginTop: -4 }}>
            <I.X width={18} height={18} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16, lineHeight: 1.5 }}>
          You looked at {recent.length === 1 ? "something" : `${recent.length} listings`} last time. Availability may have changed — check now.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recent.map((v) => {
            const price = priceDetail(v);
            return (
              <Link
                key={v.slug}
                href={itemUrl(v)}
                onClick={dismiss}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--line-soft)", borderRadius: 10, textDecoration: "none", background: "var(--surface)", transition: "border-color 0.15s" }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--surface-tint)" }}>
                  {v.heroImage && (
                    <img src={v.heroImage} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{v.locality.split(",")[0]}{price ? ` · ${price}` : ""}</div>
                </div>
                <I.Arrow width={14} height={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Link href="/venues" onClick={dismiss} className="btn btn-primary" style={{ flex: 1, textAlign: "center", padding: "10px" }}>
            Browse all venues
          </Link>
          <button onClick={dismiss} className="btn btn-ghost" style={{ padding: "10px 16px" }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
