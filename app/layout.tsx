import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ThemeSwitcher } from "@/components/theme-switcher";
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
  title: "Venuees.in — Nagpur's owner-operated wedding platform",
  description:
    "Wedding venues, vendors and planning in Nagpur. Owner-operated, transparent pricing, real availability. Featuring Signature Resorts and 40+ handpicked venues across the orange city.",
  metadataBase: new URL("https://venuees.in"),
  openGraph: {
    title: "Venuees.in — Nagpur weddings, done right",
    description:
      "Signature Resorts + 40 handpicked Nagpur venues. Owner-operated. Real availability. Transparent pricing.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body data-theme="ivory">
        {children}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
