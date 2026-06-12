"use client";
import { useEffect, useState } from "react";
import { I } from "./icons";
import { getCompareList, setCompareList, CompareItem } from "./compare-button";

export function CompareBar() {
  const [list, setList] = useState<CompareItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function sync() { setList(getCompareList()); }
    sync();
    window.addEventListener("venuees:compare", sync);
    return () => window.removeEventListener("venuees:compare", sync);
  }, []);

  if (list.length === 0) return null;

  function remove(slug: string) {
    setCompareList(getCompareList().filter((v) => v.slug !== slug));
  }

  function clearAll() {
    setCompareList([]);
    setFormOpen(false);
    setSent(false);
  }

  async function submitAll(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/enquiries/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueSlugs: list.map((v) => v.slug), name, phone }),
      });
      setSent(true);
      setCompareList([]);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  return (
    <div className="compare-bar">
      <div className="compare-bar-inner">
        <div className="compare-venues">
          {list.map((v) => (
            <span key={v.slug} className="compare-chip">
              {v.name}
              <button onClick={() => remove(v.slug)} aria-label="Remove">
                <I.X width={9} height={9} />
              </button>
            </span>
          ))}
          {list.length < 3 && (
            <span className="compare-slot">+{3 - list.length} slot{3 - list.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        <div className="compare-actions">
          {sent ? (
            <span style={{ color: "#1a7f37", fontSize: 13, fontWeight: 500 }}>
              Enquiries sent to {list.length || "all"} venues!
            </span>
          ) : formOpen ? (
            <form onSubmit={submitAll} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="compare-input" />
              <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 phone" className="compare-input" />
              <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} disabled={loading}>
                {loading ? "Sending…" : `Send to ${list.length} venue${list.length !== 1 ? "s" : ""}`}
              </button>
              <button type="button" className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 13 }} onClick={() => setFormOpen(false)}>Cancel</button>
            </form>
          ) : (
            <>
              <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={clearAll}>Clear</button>
              <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setFormOpen(true)}>
                Enquire all {list.length} <I.Arrow width={12} height={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
