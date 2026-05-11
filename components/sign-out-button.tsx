"use client";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      style={{ fontSize: 13, color: "var(--ink-mute)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
    >
      Sign out
    </button>
  );
}
