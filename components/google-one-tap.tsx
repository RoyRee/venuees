"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

async function generateNonce(): Promise<[string, string]> {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return [raw, hashed];
}

export function GoogleOneTap() {
  const router = useRouter();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const supabase = getBrowserSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) return;

      const [rawNonce, hashedNonce] = await generateNonce();

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google;
        if (!google) return;
        google.accounts.id.initialize({
          client_id: clientId,
          nonce: hashedNonce,
          callback: async (response: { credential: string }) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce: rawNonce,
            });
            if (!error) router.refresh();
          },
          context: "signin",
          itp_support: true,
        });
        google.accounts.id.prompt();
      };
      document.head.appendChild(script);
    });
  }, [router]);

  return null;
}
