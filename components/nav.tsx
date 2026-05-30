import { getSiteConfig, CONFIG_DEFAULTS } from "@/lib/site-config";
import { TopNavClient, MobileNavClient, MobileTabbarClient } from "./nav-client";

async function fetchCfg() {
  return getSiteConfig().catch(() => ({ ...CONFIG_DEFAULTS }));
}

export async function TopNav() {
  const cfg = await fetchCfg();
  return <TopNavClient cfg={cfg} />;
}

export async function MobileNav() {
  const cfg = await fetchCfg();
  return <MobileNavClient cfg={cfg} />;
}

export function MobileTabbar({ active }: { active?: string }) {
  return <MobileTabbarClient active={active} />;
}
