"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { I } from "./icons";

export function NavUserButton() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) { setLoggedIn(false); return; }

    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Link
      href={loggedIn ? "/dashboard" : "/login"}
      title={loggedIn ? "My dashboard" : "Sign in"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 34, height: 34, borderRadius: "50%",
        border: "1px solid var(--line)",
        color: loggedIn ? "var(--brand)" : "var(--ink-soft)",
        background: loggedIn ? "var(--surface)" : "transparent",
        flexShrink: 0,
        transition: "color 0.15s, background 0.15s",
      }}
    >
      <I.Users width={16} height={16} />
    </Link>
  );
}
