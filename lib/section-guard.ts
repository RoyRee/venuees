import { getSiteConfig } from "@/lib/site-config";
import { redirect } from "next/navigation";
import type { SiteConfigKey } from "@/lib/site-config";

export async function requireSection(key: SiteConfigKey) {
  const cfg = await getSiteConfig();
  if (!cfg[key]) redirect("/");
}
