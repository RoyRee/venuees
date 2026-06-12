"use client";
import { useEffect } from "react";

export type RecentItem = {
  slug: string;
  name: string;
  locality: string;
  vegPlate: number;
  ph: string;
  heroImage?: string;
};

const KEY = "venuees_recent";
const MAX = 6;

export function RecordView(item: RecentItem) {
  useEffect(() => {
    try {
      const list: RecentItem[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      const next = [item, ...list.filter((v) => v.slug !== item.slug)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
