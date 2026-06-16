"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Photo } from "./photo";
import { I } from "./icons";
import type { RecentItem } from "./record-view";

const KEY = "venuees_recent";

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

function priceLabel(v: RecentItem): string {
  if (v.vegPlate <= 0) return "";
  if (v.type === "vendor") return `From ₹${v.vegPlate.toLocaleString("en-IN")}`;
  if (v.type === "getaway") return `₹${v.vegPlate.toLocaleString("en-IN")}/night`;
  return `₹${v.vegPlate.toLocaleString("en-IN")}/plate`;
}

export function RecentlyViewed({ enabledSections }: { enabledSections?: string[] }) {
  const [list, setList] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const all: RecentItem[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      const filtered = enabledSections
        ? all.filter((v) => enabledSections.includes(sectionFor(v.type)))
        : all;
      setList(filtered);
    } catch { /* ignore */ }
  }, [enabledSections]);

  if (list.length === 0) return null;

  return (
    <section className="block" style={{ paddingTop: 0 }}>
      <div className="block-head">
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-mute)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>PICK UP WHERE YOU LEFT OFF</div>
          <h2 className="block-title" style={{ fontSize: "clamp(22px, 2.5vw, 32px)" }}>Recently <span className="italic-serif" style={{ color: "var(--brand)" }}>viewed.</span></h2>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
        {list.map((v) => (
          <Link
            key={v.slug}
            href={itemUrl(v)}
            style={{ minWidth: 220, maxWidth: 220, flexShrink: 0, textDecoration: "none" }}
          >
            <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--line-soft)" }}>
              <Photo src={v.heroImage} variant={v.ph} label="" style={{ height: 140 }} />
              <div style={{ padding: "10px 12px", background: "var(--surface)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                  <I.Pin width={10} height={10} /> {v.locality.split(",")[0]}
                </div>
                {v.vegPlate > 0 && (
                  <div style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600, marginTop: 4 }}>
                    {priceLabel(v)}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
