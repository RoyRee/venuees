#!/usr/bin/env tsx
/**
 * Seed script — populates the database with all prototype data from data.ts
 * Run: pnpm tsx scripts/seed.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../lib/db/src/schema/index.js";
import {
  venuesTable, venueHallsTable,
  vendorsTable,
  getawaysTable,
  destinationsTable,
  realWeddingsTable,
} from "../lib/db/src/schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ─── Venues ──────────────────────────────────────────────────────────────────
const venueData = [
  {
    slug: "signature-resorts-nagpur", name: "Signature Resorts", citySlug: "nagpur",
    locality: "Wardha Road, Nagpur", address: "Signature Resorts, Wardha Road, Nagpur — 441108",
    type: "Luxury Resort", typeSlug: "resort", capacityMin: 200, capacityMax: 1200,
    vegPlate: 1250, nvPlate: 1550, hallRent: 75000, minGuarantee: 500000,
    rating: "4.9", reviews: 412, bookingsMonth: 74, tag: "Signature Property",
    description: "Our flagship — 14 landscaped acres on Wardha Road, ten minutes from the airport. Four venues inside one compound: the Mandap Lawn (sunset mandap with a reflecting pond), the Darbar Ballroom (crystal-lit for 600), the Pool Deck (cocktail-friendly under string lights), and the Garden Chaupal for smaller haldi and mehendi days. Sixty-eight guest rooms on-site, so the baraat, the bride's family, and the band all stay under one roof.",
    ph: "garden", amenities: ["Valet · 300 cars","4 venues in one compound","Central AC throughout","68 guest rooms","Bridal suite + groom's lounge","In-house kitchen · vegetarian + non-veg + Jain","Licensed bar","Late-night DJ · no curfew till 2am","Generator backup · 24 hr","Lift + wheelchair access","Wi-Fi campus-wide","CCTV + 24/7 security"],
    isSignature: true, parking: 300, rooms: 68,
    halls: [
      { name: "The Mandap Lawn", ph: "garden", type: "Open-air · lawn", area: "12,000 sq ft", theatre: 1000, floating: 600, dining: 800, order: 0 },
      { name: "Darbar Ballroom", ph: "v2", type: "Indoor · AC", area: "8,400 sq ft", theatre: 800, floating: 400, dining: 600, order: 1 },
      { name: "Pool Deck Lounge", ph: "dusk", type: "Open · poolside", area: "4,200 sq ft", theatre: 250, floating: 300, dining: 180, order: 2 },
      { name: "Garden Chaupal", ph: "v5", type: "Open · landscaped", area: "3,200 sq ft", theatre: 200, floating: 180, dining: 150, order: 3 },
    ],
  },
  {
    slug: "the-centre-point-grand", name: "The Centre Point Grand", citySlug: "nagpur",
    locality: "Ramdaspeth, Nagpur", address: "Plot 24-A, Ramdaspeth, Nagpur — 440010",
    type: "5-Star Luxury Hotel", typeSlug: "hotel", capacityMin: 150, capacityMax: 800,
    vegPlate: 1350, nvPlate: 1650, hallRent: 85000, minGuarantee: 450000,
    rating: "4.8", reviews: 312, bookingsMonth: 62, tag: "Assured",
    description: "A 1920s-era building restored in 2019 — marble ballrooms, courtyard chaupal, rooftop mandap with Nagpur skyline views. We own the building, the kitchen, and the 42 guest rooms. That means no middlemen and no 'starting from' pricing — a wedding here is exactly what the quote says.",
    ph: "v2", amenities: ["Parking · 150 cars","Central AC","Generator backup","Bridal suite","In-house kitchen","Licensed bar","Late-night DJ","42 guest rooms","Lift + accessible","Valet & concierge","Wi-Fi throughout","CCTV + security"],
    isSignature: false, parking: 150, rooms: 42,
    halls: [
      { name: "The Darbar Ballroom", ph: "v2", type: "Indoor · AC", area: "8,400 sq ft", theatre: 800, floating: 400, dining: 600, order: 0 },
      { name: "Courtyard Chaupal", ph: "garden", type: "Open-air", area: "6,200 sq ft", theatre: 500, floating: 300, dining: 400, order: 1 },
      { name: "Rooftop Mandap", ph: "dusk", type: "Open · skyline", area: "3,800 sq ft", theatre: 250, floating: 150, dining: 200, order: 2 },
    ],
  },
  {
    slug: "mahalaxmi-lawns", name: "Mahalaxmi Lawns", citySlug: "nagpur",
    locality: "Wardha Road, Nagpur", address: "Mahalaxmi Lawns, Wardha Road, Nagpur — 440025",
    type: "Lawn & Banquet", typeSlug: "lawn", capacityMin: 300, capacityMax: 1200,
    vegPlate: 950, nvPlate: 1200, hallRent: 55000, minGuarantee: 300000,
    rating: "4.7", reviews: 248, bookingsMonth: 48, tag: "Most Booked",
    description: "An open-lawn wedding venue on Wardha Road — big, floodlit, and made for baraat processions. Dual halls inside for haldi/mehendi, outdoor mandap setup, a separate kitchen block, and our own water supply so your catering never misses a beat.",
    ph: "garden", amenities: ["Parking · 250 cars","Twin indoor halls + AC","Outdoor stage + sound","Bridal suite","In-house catering","Alcohol permitted","DJ allowed till 11pm","Generator backup","Changing rooms","Wi-Fi","Fire safety · NOC-approved"],
    isSignature: false, parking: 250, rooms: null,
    halls: [
      { name: "Main Lawn", ph: "garden", type: "Open · lawn", area: "14,000 sq ft", theatre: 1200, floating: 700, dining: 900, order: 0 },
      { name: "Mahalaxmi Hall", ph: "v3", type: "Indoor · AC", area: "4,800 sq ft", theatre: 400, floating: 220, dining: 300, order: 1 },
      { name: "Ganesha Chamber", ph: "v5", type: "Indoor · AC", area: "2,600 sq ft", theatre: 220, floating: 140, dining: 180, order: 2 },
    ],
  },
  {
    slug: "haveli-ashirwad", name: "Haveli Ashirwad", citySlug: "nagpur",
    locality: "Civil Lines, Nagpur", address: "7 Mount Road, Civil Lines, Nagpur — 440001",
    type: "Heritage Venue", typeSlug: "heritage", capacityMin: 120, capacityMax: 500,
    vegPlate: 1150, nvPlate: 1450, hallRent: 65000, minGuarantee: 280000,
    rating: "4.9", reviews: 187, bookingsMonth: 31, tag: "Handpicked",
    description: "A restored 1930s haveli in Civil Lines, kept as close to original as structure allowed — Burma teak doorframes, inner courtyard with a single neem tree, terrace with a hand-painted ceiling. Intimate weddings only — we cap at 500 so the place doesn't lose its character.",
    ph: "v3", amenities: ["Parking · 80 cars","Split AC in halls","Bridal suite with period furniture","Catering · multi-cuisine","Alcohol permitted","Acoustic music (no heavy DJ)","Generator backup","Heritage photo walk","Wi-Fi","Period-appropriate décor"],
    isSignature: false, parking: 80, rooms: 8,
    halls: [
      { name: "Angan Courtyard", ph: "v3", type: "Open · central", area: "4,200 sq ft", theatre: 350, floating: 200, dining: 250, order: 0 },
      { name: "The Mirror Hall", ph: "v2", type: "Indoor · heritage", area: "2,800 sq ft", theatre: 250, floating: 150, dining: 180, order: 1 },
    ],
  },
  {
    slug: "suraj-palace-resort", name: "Suraj Palace Resort", citySlug: "nagpur",
    locality: "Koradi Road, Nagpur", address: "Suraj Palace, Koradi Road, Nagpur — 441111",
    type: "Resort", typeSlug: "resort", capacityMin: 250, capacityMax: 900,
    vegPlate: 1100, nvPlate: 1400, hallRent: 60000, minGuarantee: 320000,
    rating: "4.6", reviews: 156, bookingsMonth: 22, tag: "New",
    description: "Opened late 2024 — six acres off Koradi Road, purpose-built for multi-day weddings. Pool deck cocktail space, two enclosed banquet halls, and a mandap lawn facing the koi pond. Good pick if you want the family to stay over — 46 rooms, all newly furnished.",
    ph: "dusk", amenities: ["Parking · 200 cars","Central AC","46 rooms + 4 suites","Pool deck","Bridal & groom suite","Multi-cuisine catering","Bar + late-night DJ","Generator + water backup","Wi-Fi","Airport pickup"],
    isSignature: false, parking: 200, rooms: 46,
    halls: [
      { name: "Pool Deck Lounge", ph: "dusk", type: "Open · poolside", area: "5,400 sq ft", theatre: 450, floating: 300, dining: 350, order: 0 },
      { name: "Suraj Banquet", ph: "v2", type: "Indoor · AC", area: "6,200 sq ft", theatre: 550, floating: 280, dining: 400, order: 1 },
      { name: "Koi Mandap Lawn", ph: "garden", type: "Open · landscaped", area: "4,000 sq ft", theatre: 350, floating: 180, dining: 240, order: 2 },
    ],
  },
  {
    slug: "chitnavis-centre", name: "Chitnavis Centre", citySlug: "nagpur",
    locality: "Civil Lines, Nagpur", address: "Chitnavis Centre, Civil Lines, Nagpur — 440001",
    type: "Banquet Hall", typeSlug: "banquet", capacityMin: 100, capacityMax: 450,
    vegPlate: 900, nvPlate: 1150, hallRent: 38000, minGuarantee: 180000,
    rating: "4.5", reviews: 134, bookingsMonth: 28, tag: "Value pick",
    description: "One of Civil Lines' best-kept banquet halls — wood-floor ballroom, mezzanine-level bride's room, and a covered portico for the baraat. Our go-to for couples who want a classic ceremony without paying resort prices.",
    ph: "v2", amenities: ["Parking · 90 cars","Central AC","Bridal suite","In-house + outside catering","Alcohol permitted","DJ till 11pm","Generator backup","Wi-Fi","CCTV"],
    isSignature: false, parking: 90, rooms: null,
    halls: [
      { name: "Chitnavis Ballroom", ph: "v2", type: "Indoor · AC", area: "5,800 sq ft", theatre: 450, floating: 220, dining: 320, order: 0 },
      { name: "Portico Stage", ph: "v3", type: "Covered · open", area: "1,600 sq ft", theatre: 120, floating: 80, dining: 90, order: 1 },
    ],
  },
  {
    slug: "orange-county-farms", name: "Orange County Farms", citySlug: "nagpur",
    locality: "Katol Road, Nagpur", address: "Orange County, Katol Road, Nagpur — 441303",
    type: "Farmhouse", typeSlug: "farmhouse", capacityMin: 80, capacityMax: 350,
    vegPlate: 850, nvPlate: 1050, hallRent: 45000, minGuarantee: 160000,
    rating: "4.8", reviews: 98, bookingsMonth: 18, tag: "Intimate",
    description: "Four acres of orange groves with a central lawn and restored bungalow — the venue of choice for small, warm weddings. Winter season only (Oct–Feb) because the magic is in the orange-blossom air.",
    ph: "v5", amenities: ["Parking · 60 cars","Open-air kitchen","Catering flexible","Alcohol permitted","Acoustic/DJ (light)","Generator backup","Bonfire pit","Glamping tents optional"],
    isSignature: false, parking: 60, rooms: null,
    halls: [
      { name: "The Grove Lawn", ph: "garden", type: "Open · orange grove", area: "8,000 sq ft", theatre: 350, floating: 220, dining: 250, order: 0 },
      { name: "Bungalow Veranda", ph: "v5", type: "Covered · open", area: "1,800 sq ft", theatre: 140, floating: 90, dining: 100, order: 1 },
    ],
  },
  {
    slug: "radisson-blu-nagpur", name: "Radisson Blu Nagpur", citySlug: "nagpur",
    locality: "MIHAN, Nagpur", address: "Radisson Blu, MIHAN, Nagpur — 441108",
    type: "5-Star Hotel", typeSlug: "hotel", capacityMin: 120, capacityMax: 600,
    vegPlate: 1550, nvPlate: 1850, hallRent: 90000, minGuarantee: 520000,
    rating: "4.7", reviews: 289, bookingsMonth: 44, tag: "Assured",
    description: "Closest 5-star to the airport — ideal when your guest list spans multiple cities. Three banquet spaces, a pillarless ballroom for 600, and 180 guest rooms. We partner with them on a preferred-rate agreement for our couples.",
    ph: "v2", amenities: ["Parking · 220 cars","Central AC · premium","180 guest rooms","Airport shuttle","Multi-cuisine menus","Licensed bar","DJ till 12am","Spa on-site","Wi-Fi campus-wide","Concierge + valet"],
    isSignature: false, parking: 220, rooms: 180,
    halls: [
      { name: "Grand Ballroom", ph: "v2", type: "Pillarless · AC", area: "9,200 sq ft", theatre: 600, floating: 340, dining: 480, order: 0 },
      { name: "Sapphire Hall", ph: "v3", type: "Indoor · AC", area: "3,800 sq ft", theatre: 300, floating: 160, dining: 220, order: 1 },
      { name: "Pool Courtyard", ph: "dusk", type: "Open · poolside", area: "3,400 sq ft", theatre: 220, floating: 150, dining: 180, order: 2 },
    ],
  },
];

const vendorData = [
  { slug: "studio-ishara", category: "Photography", categorySlug: "photographers", name: "Studio Ishara", city: "Nagpur", locality: "Dharampeth", rating: "4.9", reviews: 142, priceFrom: 85000, completed: 230, yearsExp: 9, ph: "v3", tagline: "Weddings told in 800 frames.", description: "Candid and portrait specialists serving Nagpur for 9 years." },
  { slug: "lenslight-films", category: "Photography", categorySlug: "photographers", name: "Lenslight Films", city: "Nagpur", locality: "Civil Lines", rating: "4.8", reviews: 96, priceFrom: 115000, completed: 180, yearsExp: 7, ph: "v4", tagline: "Cinema, not just photos.", description: "Cinematic wedding films and same-day edits." },
  { slug: "marigold-mandap-co", category: "Decorators", categorySlug: "decorators", name: "Marigold Mandap Co.", city: "Nagpur", locality: "Sitabuldi", rating: "4.8", reviews: 118, priceFrom: 250000, completed: 310, yearsExp: 12, ph: "garden", tagline: "One lakh marigolds, one knot.", description: "Full mandap and floral décor specialists." },
  { slug: "studio-rang", category: "Decorators", categorySlug: "decorators", name: "Studio Rang", city: "Nagpur", locality: "Shankar Nagar", rating: "4.7", reviews: 84, priceFrom: 180000, completed: 220, yearsExp: 8, ph: "rose", tagline: "Colour that stays in the photos.", description: "Pastel florals and ceiling installations." },
  { slug: "rhea-bridal-makeup", category: "Makeup", categorySlug: "makeup", name: "Rhea Bridal", city: "Nagpur", locality: "Dharampeth", rating: "4.9", reviews: 172, priceFrom: 45000, completed: 340, yearsExp: 10, ph: "rose", tagline: "Your face, your day, your glow.", description: "Airbrush and HD bridal makeup." },
  { slug: "saanvi-makeup-artistry", category: "Makeup", categorySlug: "makeup", name: "Saanvi Makeup Artistry", city: "Nagpur", locality: "Laxmi Nagar", rating: "4.7", reviews: 108, priceFrom: 32000, completed: 210, yearsExp: 6, ph: "v5", tagline: "Soft glam, honest skin.", description: "Natural and soft-glam specialist." },
  { slug: "spice-route-catering", category: "Caterers", categorySlug: "caterers", name: "Spice Route Catering", city: "Nagpur", locality: "Pardi", rating: "4.8", reviews: 224, priceFrom: 750, completed: 560, yearsExp: 15, ph: "saffron", tagline: "Vidarbha flavours. Pan-India menu.", description: "Live stations, chaat counters, full wedding catering." },
  { slug: "sharma-mehendi-art", category: "Mehendi", categorySlug: "mehendi", name: "Sharma Mehendi Art", city: "Nagpur", locality: "Itwari", rating: "4.9", reviews: 156, priceFrom: 12000, completed: 380, yearsExp: 14, ph: "v5", tagline: "Arabic, Rajasthani, bridal — in one steady hand.", description: "Bridal mehendi artist with 14 years experience." },
  { slug: "dj-vihaan", category: "Music & DJ", categorySlug: "music", name: "DJ Vihaan", city: "Nagpur", locality: "Manish Nagar", rating: "4.7", reviews: 88, priceFrom: 55000, completed: 140, yearsExp: 8, ph: "plum", tagline: "Sangeet to sunrise.", description: "Wedding DJ with LED stage setup." },
  { slug: "pandit-shastri-ji", category: "Pandits", categorySlug: "pandits", name: "Pandit Shastri Ji", city: "Nagpur", locality: "Mahal", rating: "5.0", reviews: 264, priceFrom: 11000, completed: 720, yearsExp: 30, ph: "v5", tagline: "Sanskrit shlokas, explained in Marathi + Hindi.", description: "30 years of conducting Hindu weddings across Nagpur." },
];

const getawayData = [
  { slug: "pench-silver-stream", name: "Pench Silver Stream", location: "Pench Tiger Reserve edge, Khawasa", hoursFromNagpur: "2.5 hrs from Nagpur", beds: 4, guests: 10, weekday: 9800, weekend: 14500, rating: "4.9", reviews: 87, ph: "garden", tagline: "Silence is the amenity.", description: "A private forest villa on the edge of Pench Tiger Reserve — infinity pool, no neighbours, tiger country." },
  { slug: "tadoba-tiger-lodge", name: "Tadoba Tiger Lodge", location: "Mohurli Gate, Tadoba", hoursFromNagpur: "3 hrs from Nagpur", beds: 5, guests: 12, weekday: 12500, weekend: 18000, rating: "4.8", reviews: 64, ph: "v4", tagline: "Safari mornings. Bonfire nights.", description: "Jungle lodge at Tadoba's Mohurli gate — sunrise safaris, bonfire evenings, open-sky dining." },
  { slug: "ramtek-hillside-farm", name: "Ramtek Hillside Farm", location: "Ramtek · Nagpur district", hoursFromNagpur: "1 hr from Nagpur", beds: 3, guests: 8, weekday: 7500, weekend: 11000, rating: "4.7", reviews: 52, ph: "v5", tagline: "An hour from home, a world away.", description: "A working orange farm on Ramtek hill — orchard walks, village breakfast, and complete quiet." },
  { slug: "khindsi-lake-cottage", name: "Khindsi Lake Cottage", location: "Khindsi Lake, Ramtek", hoursFromNagpur: "1.5 hrs from Nagpur", beds: 4, guests: 10, weekday: 8800, weekend: 12500, rating: "4.8", reviews: 41, ph: "ocean", tagline: "Sunset over water. Every evening.", description: "Lake-facing cottage at Khindsi with private sunset deck and kayaking." },
  { slug: "seoni-teak-villa", name: "Seoni Teak Villa", location: "Seoni · MP border", hoursFromNagpur: "2 hrs from Nagpur", beds: 3, guests: 8, weekday: 8200, weekend: 11800, rating: "4.6", reviews: 33, ph: "v3", tagline: "Inside Kipling's Jungle Book.", description: "Teak-forest villa near Seoni — the real Jungle Book country." },
  { slug: "chikhaldara-cloud-villa", name: "Chikhaldara Cloud Villa", location: "Chikhaldara hill station", hoursFromNagpur: "4 hrs from Nagpur", beds: 4, guests: 10, weekday: 9200, weekend: 13800, rating: "4.7", reviews: 38, ph: "garden", tagline: "Cooler by 8°, always.", description: "Hilltop villa at Chikhaldara — Maharashtra's only hill station, always 8° cooler than the plains." },
];

const destinationData = [
  { slug: "udaipur", city: "Udaipur", tag: "City of Lakes", ph: "plum", venues: 6, priceFrom: "₹8L", feat: true },
  { slug: "goa", city: "Goa", tag: "Beach & Portuguese charm", ph: "ocean", venues: 8, priceFrom: "₹6L", feat: false },
  { slug: "jaipur", city: "Jaipur", tag: "Royal Rajputana", ph: "v3", venues: 5, priceFrom: "₹9L", feat: false },
  { slug: "coorg", city: "Coorg", tag: "Misty coffee hills", ph: "garden", venues: 4, priceFrom: "₹5L", feat: false },
  { slug: "jaisalmer", city: "Jaisalmer", tag: "Desert romance", ph: "v5", venues: 3, priceFrom: "₹7L", feat: false },
  { slug: "rishikesh", city: "Rishikesh", tag: "Riverside · spiritual", ph: "ocean", venues: 3, priceFrom: "₹4.5L", feat: false },
];

const realWeddingData = [
  { slug: "priya-arjun", couple: "Priya & Arjun", venue: "The Centre Point Grand", date: "Dec 2025", guests: 420, ph: "v2", quote: "The hall was exactly as the mockup. Our wedding cost ₹11,000 less than estimated." },
  { slug: "ananya-rohan", couple: "Ananya & Rohan", venue: "Mahalaxmi Lawns", date: "Nov 2025", guests: 280, ph: "garden", quote: null },
  { slug: "meera-karan", couple: "Meera & Karan", venue: "Haveli Ashirwad", date: "Feb 2026", guests: 180, ph: "dusk", quote: null },
  { slug: "riya-vikram", couple: "Riya & Vikram", venue: "Suraj Palace Resort", date: "Jan 2026", guests: 360, ph: "v3", quote: null },
  { slug: "ishita-dev", couple: "Ishita & Dev", venue: "Pench Silver Stream", date: "Oct 2025", guests: 52, ph: "v4", quote: null },
  { slug: "kavya-nishant", couple: "Kavya & Nishant", venue: "Signature Resorts", date: "Dec 2025", guests: 480, ph: "garden", quote: null },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Venues
  for (const v of venueData) {
    const { halls, ...venueRow } = v;
    const [inserted] = await db
      .insert(venuesTable)
      .values(venueRow)
      .onConflictDoNothing()
      .returning({ id: venuesTable.id });

    if (inserted) {
      for (const hall of halls) {
        await db.insert(venueHallsTable).values({ venueId: inserted.id, ...hall }).onConflictDoNothing();
      }
      console.log(`  ✓ Venue: ${v.name}`);
    } else {
      console.log(`  – Venue exists: ${v.name}`);
    }
  }

  // Vendors
  for (const v of vendorData) {
    await db.insert(vendorsTable).values(v).onConflictDoNothing();
    console.log(`  ✓ Vendor: ${v.name}`);
  }

  // Getaways
  for (const g of getawayData) {
    await db.insert(getawaysTable).values(g).onConflictDoNothing();
    console.log(`  ✓ Getaway: ${g.name}`);
  }

  // Destinations
  for (const d of destinationData) {
    await db.insert(destinationsTable).values(d).onConflictDoNothing();
    console.log(`  ✓ Destination: ${d.city}`);
  }

  // Real Weddings
  for (const w of realWeddingData) {
    await db.insert(realWeddingsTable).values(w).onConflictDoNothing();
    console.log(`  ✓ Real Wedding: ${w.couple}`);
  }

  console.log("\n✅ Seed complete!");
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
