export const dynamic = "force-dynamic";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Ornament } from "@/components/icons";
import { BudgetCalculator } from "./calculator";

export const metadata = {
  title: "Wedding Budget Calculator — Nagpur | Venuees.in",
  description:
    "Free wedding budget calculator for Nagpur. Estimate venue, catering, décor, photography and makeup costs for your guest count in 60 seconds — then get matched venues in your budget.",
  openGraph: {
    title: "Wedding Budget Calculator — plan your Nagpur wedding cost",
    description: "Estimate your full wedding cost by guest count and style, free.",
    type: "website",
    url: "https://venuees.in/tools/wedding-budget-calculator",
  },
};

export default function BudgetCalculatorPage() {
  return (
    <div>
      <MobileNav />
      <TopNav />

      <section className="dh-section" style={{ paddingTop: 32 }}>
        <Ornament>FREE TOOL</Ornament>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.08, margin: "14px 0 10px" }}>
          What will your wedding <span className="italic-serif" style={{ color: "var(--brand)" }}>actually cost?</span>
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", maxWidth: 560, lineHeight: 1.6, marginBottom: 36 }}>
          Built on real Nagpur pricing — plates, hall rents, décor and photography rates from venues and vendors on our platform. Adjust the sliders, see your number.
        </p>

        <BudgetCalculator />
      </section>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
