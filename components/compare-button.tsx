"use client";
import { useEffect, useState } from "react";
import { I } from "./icons";

const KEY = "venuees_compare";
export const COMPARE_MAX = 3;

export type CompareItem = {
  slug: string;
  name: string;
  vegPlate: number;
  locality: string;
};

export function getCompareList(): CompareItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function setCompareList(list: CompareItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("venuees:compare"));
}

export function CompareButton({ slug, name, vegPlate, locality }: CompareItem) {
  const [inList, setInList] = useState(false);
  const [listFull, setListFull] = useState(false);

  useEffect(() => {
    function sync() {
      const list = getCompareList();
      const has = list.some((v) => v.slug === slug);
      setInList(has);
      setListFull(list.length >= COMPARE_MAX && !has);
    }
    sync();
    window.addEventListener("venuees:compare", sync);
    return () => window.removeEventListener("venuees:compare", sync);
  }, [slug]);

  if (listFull) return null;

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const list = getCompareList();
    const idx = list.findIndex((v) => v.slug === slug);
    if (idx >= 0) {
      setCompareList(list.filter((_, i) => i !== idx));
    } else {
      if (list.length >= COMPARE_MAX) return;
      setCompareList([...list, { slug, name, vegPlate, locality }]);
    }
  }

  return (
    <button onClick={toggle} className={`compare-btn${inList ? " on" : ""}`} title={inList ? "Remove from comparison" : "Add to compare"}>
      <I.Check width={10} height={10} />
      {inList ? "Added" : "Compare"}
    </button>
  );
}
