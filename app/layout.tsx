import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { WhatsAppFAB } from "@/components/whatsapp-fab";
import { GoogleOneTap } from "@/components/google-one-tap";
import { ExitIntentPopup } from "@/components/exit-intent-popup";
import { CityProvider } from "@/components/city-context";
import { db, citiesTable } from "@/lib/db";
import { eq } from "drizzle-orm";
import "@/styles/tokens.css";
import "@/styles/app.css";
import "@/styles/pages.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Venuees.in — Crafted for celebrations",
  description:
    "Nagpur's wedding platform by Bsquare Hospitality. Transparent pricing, real availability, 40+ handpicked venues. Featuring Signature Resorts and the best of the orange city.",
  metadataBase: new URL("https://venuees.in"),
  openGraph: {
    title: "Venuees.in — Crafted for celebrations",
    description:
      "Bsquare Hospitality's wedding platform. Signature Resorts + 40 handpicked Nagpur venues. Real availability. Transparent pricing.",
    type: "website",
  },
};

async function getActiveCities() {
  try {
    return await db
      .select({ id: citiesTable.id, name: citiesTable.name, slug: citiesTable.slug, lat: citiesTable.lat, lng: citiesTable.lng })
      .from(citiesTable)
      .where(eq(citiesTable.isActive, true))
      .orderBy(citiesTable.name);
  } catch {
    return [{ id: 1, name: "Nagpur", slug: "nagpur", lat: 21.1458, lng: 79.0882 }];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cities = await getActiveCities();

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body data-theme="blush">
        <CityProvider cities={cities}>
          {children}
        </CityProvider>
        <WhatsAppFAB phone={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919922151527"} />
        <GoogleOneTap />
        <ExitIntentPopup />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
