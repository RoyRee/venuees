"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function GoogleOneTap() {
  const router = useRouter();

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const supabase = getBrowserSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) return;

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
          callback: async (response: { credential: string }) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
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
