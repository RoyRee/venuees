export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, MobileNav, MobileTabbar } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Ornament } from "@/components/icons";
import { requireSection } from "@/lib/section-guard";

// Static post data — will be replaced with DB reads when blog CMS is built (Phase 2)
const POSTS: Record<string, {
  slug: string; title: string; category: string; read: string;
  ph: string; date: string; excerpt: string; body: string;
}> = {
  "nagpur-wedding-budget-2026": {
    slug: "nagpur-wedding-budget-2026",
    title: "The real cost of a Nagpur wedding in 2026",
    category: "Planning",
    read: "8 min",
    ph: "v2",
    date: "Mar 14, 2026",
    excerpt: "We pulled data from 312 weddings we managed in 2025 and broke it down by venue type, guest count, and season.",
    body: `
We managed 312 weddings in 2025. Every invoice, every vendor quote, every last-minute add-on — we tracked it all. Here's what a Nagpur wedding actually costs, broken down honestly.

## The numbers nobody tells you

The average Nagpur wedding in 2025 cost **₹18.4L** for 350 guests. But that number hides enormous variance. A farmhouse wedding for 120 intimate guests ran ₹6.2L. A five-star hotel affair for 800 came to ₹68L.

The biggest cost drivers, in order:

1. **Catering** — 38–42% of total budget, always. Veg plate at good venues: ₹950–₹1,550. Non-veg: add ₹250–₹350.
2. **Venue hall rent** — ₹38,000 to ₹90,000 per function. Most couples run 3 functions minimum.
3. **Photography + film** — ₹85,000–₹2,40,000. The range is real; so is the quality difference.
4. **Décor** — ₹1.8L–₹6L. Marigold-heavy mandap setups cost less than floral European-style installs.
5. **Music (DJ + band)** — ₹55,000–₹1.8L. Sangeet nights push this up fast.

## Seasonal impact

Winter (Oct–Feb) is peak season in Nagpur. Venues book 18 months ahead. Prices are 15–22% higher than off-peak.

Monsoon (Jul–Aug) is the biggest discount window — some venues drop 30% but outdoor functions are risky. We've done two monsoon weddings. Both were beautiful. Both also involved 45 minutes of genuine panic.

## What you can cut without noticing

- **Printed menus and stationery** — couples look at them once. Save ₹40,000–₹80,000.
- **Photo booths** — 60% of guests never use them. Only worth it for sangeet nights.
- **Extra décor at the baraat entry** — guests are focused on the groom. Spend the money on the mandap instead.

## What you should never cut

- Photography and videography. This is the only artefact that survives the day.
- The coordinator on the day. ₹25,000–₹60,000 is nothing for the insurance it provides.
- Food quality and quantity. Your guests will remember hunger.

## Our estimate calculator

Use this as a starting framework:

| Item | Budget (₹L) | Mid (₹L) | Premium (₹L) |
|---|---|---|---|
| Venue (3 functions) | 1.5–3 | 4–7 | 8–18 |
| Catering (400 pax, veg) | 4–5 | 5–7 | 7–12 |
| Photography + film | 0.85–1.2 | 1.5–2 | 2.5–5 |
| Décor + florals | 1.5–2.5 | 3–5 | 6–15 |
| Music (DJ + band) | 0.6–1 | 1.2–2 | 2.5–5 |
| Makeup (bride + family) | 0.5–0.8 | 1–1.5 | 2–4 |
| Mehendi | 0.15–0.25 | 0.3–0.5 | 0.6–1.2 |
| Pandit | 0.1–0.15 | 0.15–0.2 | 0.2–0.3 |
| Invitations + printing | 0.3–0.5 | 0.5–0.8 | 1–2 |
| **Total** | **9.5–14L** | **16–24L** | **30–62L** |

Want a personalised estimate? [Send us your details →](/contact)
    `.trim(),
  },
  "winter-vs-monsoon": {
    slug: "winter-vs-monsoon",
    title: "Winter vs. monsoon weddings in Vidarbha — a data story",
    category: "Seasons",
    read: "6 min",
    ph: "garden",
    date: "Feb 28, 2026",
    excerpt: "Peak season vs. off-season — what the data from 200 Vidarbha weddings actually shows.",
    body: "Full article coming soon. [Contact us](/contact) for personalised advice on your wedding date.",
  },
  "signature-resorts-tour": {
    slug: "signature-resorts-tour",
    title: "A walkthrough of Signature Resorts · four venues inside one compound",
    category: "Venues",
    read: "5 min",
    ph: "dusk",
    date: "Feb 12, 2026",
    excerpt: "The Mandap Lawn, the Darbar Ballroom, the Pool Deck, and the Garden Chaupal — what each space is actually like.",
    body: "Full article coming soon. [Tour Signature Resorts →](/venues/nagpur/wardha-road/signature-resorts-nagpur)",
  },
  "vendor-red-flags": {
    slug: "vendor-red-flags",
    title: "5 vendor red flags we've learned to spot",
    category: "Vendors",
    read: "7 min",
    ph: "rose",
    date: "Jan 30, 2026",
    excerpt: "A decade of running weddings has taught us exactly what to watch for. Here are the 5 things that make us walk away.",
    body: "Full article coming soon. [Browse vetted vendors →](/vendors)",
  },
  "interfaith-weddings": {
    slug: "interfaith-weddings",
    title: "Interfaith weddings in Nagpur — logistics and etiquette",
    category: "Culture",
    read: "9 min",
    ph: "plum",
    date: "Jan 18, 2026",
    excerpt: "From Hindu-Christian ceremonies to Hindu-Muslim weddings — practical guidance on navigating two families, two sets of rituals.",
    body: "Full article coming soon. [Talk to us →](/contact)",
  },
  "farmhouse-wedding-guide": {
    slug: "farmhouse-wedding-guide",
    title: "Farmhouse weddings · what nobody tells you about the bathrooms",
    category: "Planning",
    read: "4 min",
    ph: "v5",
    date: "Dec 22, 2025",
    excerpt: "The checklist every farmhouse wedding couple needs — and the one thing 70% of them forget to ask about.",
    body: "Full article coming soon. [Browse farmhouse venues →](/venues?type=farmhouse)",
  },
};

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return {};
  return {
    title: `${post.title} — Venuees.in Journal`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://venuees.in/blog/${slug}`,
    },
  };
}

// Minimal markdown → HTML converter for headings, bold, tables, links
function renderBody(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 style="font-family:var(--font-serif);font-size:clamp(22px,2.5vw,30px);margin:32px 0 12px;color:var(--ink)">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:18px;margin:24px 0 8px;color:var(--ink)">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--brand)">$1</a>')
    .replace(/^\| (.+) \|$/gm, (line) => {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      return `<tr>${cells.map((c) => `<td style="padding:8px 12px;border:1px solid var(--line)">${c}</td>`).join("")}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, (table) =>
      `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0">${table}</table>`
    )
    .replace(/^(?!<[h|t]).+$/gm, (line) =>
      line.trim() ? `<p style="font-size:15px;line-height:1.75;color:var(--ink-soft);margin:0 0 16px">${line}</p>` : ""
    );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSection("section_blog");
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "author": { "@type": "Organization", "name": "Venuees.in" },
    "publisher": {
      "@type": "Organization",
      "name": "Venuees.in",
      "url": "https://venuees.in",
    },
    "url": `https://venuees.in/blog/${slug}`,
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <MobileNav />
      <TopNav />

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 80px" }}>
        <nav style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 24 }}>
          <Link href="/" style={{ color: "var(--ink-mute)" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link href="/blog" style={{ color: "var(--ink-mute)" }}>Journal</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--ink)" }}>{post.category}</span>
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <span className="chip">{post.category}</span>
          <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{post.date}</span>
          <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>·</span>
          <span style={{ fontSize: 12, color: "var(--ink-mute)" }}>{post.read} read</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20 }}>
          {post.title}
        </h1>

        <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 40, borderBottom: "1px solid var(--line)", paddingBottom: 32 }}>
          {post.excerpt}
        </p>

        <div dangerouslySetInnerHTML={{ __html: renderBody(post.body) }} />

        <div style={{ marginTop: 60, padding: "32px 28px", background: "var(--brand)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
          <Ornament style={{ color: "#F0D7B0" }}>PLAN YOUR WEDDING</Ornament>
          <h2 style={{ color: "#fff", fontSize: "clamp(22px, 3vw, 32px)", margin: "14px 0 12px", lineHeight: 1.15 }}>
            Ready to look at venues?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Tell us your date, guest count, and budget — we&rsquo;ll come back within 2 hours with availability across 42 Nagpur venues.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn btn-lg" style={{ background: "#fff", color: "var(--brand)" }}>
              Send us a brief →
            </Link>
            <Link href="/venues" className="btn btn-ghost btn-lg" style={{ borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}>
              Browse venues
            </Link>
          </div>
        </div>
      </article>

      <Footer />
      <MobileTabbar />
    </div>
  );
}
