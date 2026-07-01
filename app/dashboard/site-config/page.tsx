export const dynamic = "force-dynamic";
export const metadata = { title: "Site Settings — Venuees.in" };

import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { getSiteConfig, getSiteContent, CONFIG_META } from "@/lib/site-config";
import { SettingsShell } from "./settings-shell";

export default async function SiteConfigPage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id, user.email!);
  if (role !== "admin") redirect("/dashboard");

  const [config, content] = await Promise.all([getSiteConfig(), getSiteContent()]);

  return (
    <div className="dash-page">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, color: "var(--ink)", marginBottom: 6 }}>
          Site Settings
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)" }}>
          Enable or disable sections, features, and homepage content. Click <strong>Save all settings</strong> once when you&apos;re done — changes take effect immediately.
        </p>
      </div>

      <SettingsShell
        initialConfig={config}
        initialContent={content}
        meta={CONFIG_META}
      />
    </div>
  );
}
