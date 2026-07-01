import Link from "next/link";
import { redirect } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { I } from "@/components/icons";
import { getServerSupabase } from "@/lib/supabase/server";
import { getSiteConfig, getSiteContent, CONTENT_DEFAULTS } from "@/lib/site-config";
import { ApplyForm } from "./apply-form";
import { HeroCarousel } from "@/components/hero-carousel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "List your business — Venuees.in",
  description: "Partner with Venuees.in. Flat annual listing · zero commission on bookings · transparent analytics for venue owners and wedding vendors across Nagpur.",
};

export default async function ListYourBusinessPage() {
  const [cfg, siteContent] = await Promise.all([
    getSiteConfig().catch(() => null),
    getSiteContent().catch(() => CONTENT_DEFAULTS),
  ]);
  if (cfg && cfg.feature_applications === false) redirect("/");

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase!.auth.getUser();
  const prefillEmail = user?.email ?? "";
  const prefillName = user?.user_metadata?.full_name ?? "";

  // Only show listing types that are enabled in site_config
  const enabledTypes = (
    [
      cfg?.section_venues   !== false ? "venue"   : null,
      cfg?.section_vendors  !== false ? "vendor"  : null,
      cfg?.section_getaways !== false ? "getaway" : null,
    ] as const
  ).filter(Boolean) as ("venue" | "vendor" | "getaway")[];
  return (
    <div className="dh">
      <MobileNav />
      <TopNav />

      <section className="dh-hero">
        <div className="dh-hero-bg">
          <HeroCarousel
            images={siteContent.hero_images}
            interval={siteContent.hero_carousel_interval}
          />
        </div>
        <div className="dh-hero-content">
          <div className="eyebrow" style={{ color: "#F0D7B0" }}>For venue owners &amp; vendors</div>
          <h1>Keep your margins. <span className="italic-serif">Grow your book.</span></h1>
          <p>
            We&rsquo;re an owner-operator platform. Meaning we charge a flat annual listing — and take zero commission on the weddings we send you. What you quote is what you keep.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
            <Link href="#apply" className="btn btn-primary btn-lg">Apply to list <I.Arrow width={14} height={14} /></Link>
            <Link href="/contact" className="btn btn-ghost btn-lg" style={{ borderColor: "#FFF8EA", color: "#FFF8EA" }}>Talk to partnerships</Link>
          </div>
        </div>
      </section>

      <section id="apply" style={{ padding: "60px 20px", background: "var(--surface-warm, #FFFCF8)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 40px)", color: "var(--ink)", marginBottom: 8 }}>Apply to list <span className="italic-serif" style={{ color: "var(--brand)" }}>on Venuees.in</span></h2>
            <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 440, margin: "0 auto" }}>Tell us about your business. We&rsquo;ll review within 48 hours.</p>
          </div>
          <ApplyForm prefillEmail={prefillEmail} prefillName={prefillName} enabledTypes={enabledTypes} />
        </div>
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
