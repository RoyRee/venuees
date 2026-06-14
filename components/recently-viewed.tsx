"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Photo } from "./photo";
import { I } from "./icons";
import type { RecentItem } from "./record-view";

const KEY = "venuees_recent";

export function RecentlyViewed() {
  const [list, setList] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      setList(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
    } catch { /* ignore */ }
  }, []);

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
        {list.map((v) => {
          const localitySlug = v.locality.split(",")[0].toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={v.slug}
              href={`/venues/nagpur/${localitySlug}/${v.slug}`}
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
                      ₹{v.vegPlate.toLocaleString("en-IN")}/plate
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
