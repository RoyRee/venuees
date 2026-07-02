"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { I } from "./icons";

export function SaveButton({
  type,
  slug,
  size = 18,
  className,
  style,
}: {
  type: "venue" | "vendor" | "getaway";
  slug: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then(({ saved: list }) => setSaved((list as string[]).includes(slug)))
      .catch(() => {});
  }, [slug]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const supabase = getBrowserSupabase();
    if (!supabase) { router.push("/login"); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push(`/login?redirect=/venues`); return; }

    setLoading(true);
    const next = !saved;
    setSaved(next);
    await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, slug, action: next ? "save" : "unsave" }),
    }).catch(() => setSaved(!next));
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Unsave" : "Save"}
      className={className || "save"}
      style={{ opacity: loading ? 0.6 : 1, ...style }}
    >
      <I.Heart
        width={size}
        height={size}
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
      />
    </button>
  );
}
