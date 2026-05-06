#!/usr/bin/env npx tsx
/**
 * Seed the database with all static data from lib/data.ts
 *
 * Run: npm run db:seed
 * Requires: DATABASE_URL set in .env.local
 *
 * Safe to run multiple times — uses INSERT ... ON CONFLICT DO NOTHING
 * so existing rows are never overwritten.
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import {
  venuesTable, venueHallsTable,
  vendorsTable,
  getawaysTable,
  destinationsTable,
  realWeddingsTable,
} from "../lib/db/schema/index";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local before seeding.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool);

// ─── Venues ──────────────────────────────────────────────────────────────────

const venueRows = [
  {
    slug: "signature-resorts-nagpur", name: "Signature Resorts", citySlug: "nagpur",
    locality: "Wardha Road, Nagpur", address: "Signature Resorts, Wardha Road, Nagpur — 441108",
    type: "Luxury Resort", typeSlug: "resort", capacityMin: 200, capacityMax: 1200,
    vegPlate: 1250, nvPlate: 1550, hallRent: 75000, minGuarantee: 500000,
    rating: "4.9", reviews: 412, bookingsMonth: 74, tag: "Signature Property",
    description: "Our flagship — 14 landscaped acres on Wardha Road, ten minutes from the airport. Four venues inside one compound: the Mandap Lawn (sunset mandap with a reflecting pond), the Darbar Ballroom (crystal-lit for 600), the Pool Deck (cocktail-friendly under string lights), and the Garden Chaupal for smaller haldi and mehendi days. Sixty-eight guest rooms on-site, so the baraat, the bride's family, and the band all stay under one roof.",
    ph: "garden", scene: "signature resorts · mandap lawn at golden hour",
    amenities: ["Valet · 300 cars","4 venues in one compound","Central AC throughout","68 guest rooms","Bridal suite + groom's lounge","In-house kitchen · vegetarian + non-veg + Jain","Licensed bar","Late-night DJ · no curfew till 2am","Generator backup · 24 hr","Lift + wheelchair access","Wi-Fi campus-wide","CCTV + 24/7 security"],
    isSignature: true, parking: 300, rooms: 68,
    halls: [
      { name: "The Mandap Lawn",   ph: "garden", type: "Open-air · lawn",      area: "12,000 sq ft", theatre: 1000, floating: 600, dining: 800, order: 0 },
      { name: "Darbar Ballroom",   ph: "v2",     type: "Indoor · AC",           area: "8,400 sq ft",  theatre: 800,  floating: 400, dining: 600, order: 1 },
      { name: "Pool Deck Lounge",  ph: "dusk",   type: "Open · poolside",       area: "4,200 sq ft",  theatre: 250,  floating: 300, dining: 180, order: 2 },
      { name: "Garden Chaupal",    ph: "v5",     type: "Open · landscaped",     area: "3,200 sq ft",  theatre: 200,  floating: 180, dining: 150, order: 3 },
    ],
  },
  {
    slug: "the-centre-point-grand", name: "The Centre Point Grand", citySlug: "nagpur",
    locality: "Ramdaspeth, Nagpur", address: "Plot 24-A, Ramdaspeth, Nagpur — 440010",
    type: "5-Star Luxury Hotel", typeSlug: "hotel", capacityMin: 150, capacityMax: 800,
    vegPlate: 1350, nvPlate: 1650, hallRent: 85000, minGuarantee: 450000,
    rating: "4.8", reviews: 312, bookingsMonth: 62, tag: "Assured",
    description: "A 1920s-era building restored in 2019 — marble ballrooms, courtyard chaupal, rooftop mandap with Nagpur skyline views. We own the building, the kitchen, and the 42 guest rooms. That means no middlemen and no 'starting from' pricing — a wedding here is exactly what the quote says.",
    ph: "v2", scene: "hotel ballroom · crystal chandeliers",
    amenities: ["Parking · 150 cars","Central AC","Generator backup","Bridal suite","In-house kitchen","Licensed bar","Late-night DJ","42 guest rooms","Lift + accessible","Valet & concierge","Wi-Fi throughout","CCTV + security"],
    isSignature: false, parking: 150, rooms: 42,
    halls: [
      { name: "The Darbar Ballroom", ph: "v2",     type: "Indoor · AC",     area: "8,400 sq ft", theatre: 800, floating: 400, dining: 600, order: 0 },
      { name: "Courtyard Chaupal",   ph: "garden", type: "Open-air",         area: "6,200 sq ft", theatre: 500, floating: 300, dining: 400, order: 1 },
      { name: "Rooftop Mandap",      ph: "dusk",   type: "Open · skyline",  area: "3,800 sq ft", theatre: 250, floating: 150, dining: 200, order: 2 },
    ],
  },
  {
    slug: "mahalaxmi-lawns", name: "Mahalaxmi Lawns", citySlug: "nagpur",
    locality: "Wardha Road, Nagpur", address: "Mahalaxmi Lawns, Wardha Road, Nagpur — 440025",
    type: "Lawn & Banquet", typeSlug: "lawn", capacityMin: 300, capacityMax: 1200,
    vegPlate: 950, nvPlate: 1200, hallRent: 55000, minGuarantee: 300000,
    rating: "4.7", reviews: 248, bookingsMonth: 48, tag: "Most Booked",
    description: "An open-lawn wedding venue on Wardha Road — big, floodlit, and made for baraat processions. Dual halls inside for haldi/mehendi, outdoor mandap setup, a separate kitchen block, and our own water supply so your catering never misses a beat.",
    ph: "garden", scene: "open lawn · marigold mandap",
    amenities: ["Parking · 250 cars","Twin indoor halls + AC","Outdoor stage + sound","Bridal suite","In-house catering","Alcohol permitted","DJ allowed till 11pm","Generator backup","Changing rooms","Wi-Fi","Fire safety · NOC-approved"],
    isSignature: false, parking: 250, rooms: null,
    halls: [
      { name: "Main Lawn",        ph: "garden", type: "Open · lawn",    area: "14,000 sq ft", theatre: 1200, floating: 700, dining: 900, order: 0 },
      { name: "Mahalaxmi Hall",   ph: "v3",     type: "Indoor · AC",    area: "4,800 sq ft",  theatre: 400,  floating: 220, dining: 300, order: 1 },
      { name: "Ganesha Chamber",  ph: "v5",     type: "Indoor · AC",    area: "2,600 sq ft",  theatre: 220,  floating: 140, dining: 180, order: 2 },
    ],
  },
  {
    slug: "haveli-ashirwad", name: "Haveli Ashirwad", citySlug: "nagpur",
    locality: "Civil Lines, Nagpur", address: "7 Mount Road, Civil Lines, Nagpur — 440001",
    type: "Heritage Venue", typeSlug: "heritage", capacityMin: 120, capacityMax: 500,
    vegPlate: 1150, nvPlate: 1450, hallRent: 65000, minGuarantee: 280000,
    rating: "4.9", reviews: 187, bookingsMonth: 31, tag: "Handpicked",
    description: "A restored 1930s haveli in Civil Lines, kept as close to original as structure allowed — Burma teak doorframes, inner courtyard with a single neem tree, terrace with a hand-painted ceiling. Intimate weddings only — we cap at 500 so the place doesn't lose its character.",
    ph: "v3", scene: "heritage courtyard · arches",
    amenities: ["Parking · 80 cars","Split AC in halls","Bridal suite with period furniture","Catering · multi-cuisine","Alcohol permitted","Acoustic music (no heavy DJ)","Generator backup","Heritage photo walk","Wi-Fi","Period-appropriate décor"],
    isSignature: false, parking: 80, rooms: 8,
    halls: [
      { name: "Angan Courtyard", ph: "v3", type: "Open · central",      area: "4,200 sq ft", theatre: 350, floating: 200, dining: 250, order: 0 },
      { name: "The Mirror Hall", ph: "v2", type: "Indoor · heritage",    area: "2,800 sq ft", theatre: 250, floating: 150, dining: 180, order: 1 },
    ],
  },
  {
    slug: "suraj-palace-resort", name: "Suraj Palace Resort", citySlug: "nagpur",
    locality: "Koradi Road, Nagpur", address: "Suraj Palace, Koradi Road, Nagpur — 441111",
    type: "Resort", typeSlug: "resort", capacityMin: 250, capacityMax: 900,
    vegPlate: 1100, nvPlate: 1400, hallRent: 60000, minGuarantee: 320000,
    rating: "4.6", reviews: 156, bookingsMonth: 22, tag: "New",
    description: "Opened late 2024 — six acres off Koradi Road, purpose-built for multi-day weddings. Pool deck cocktail space, two enclosed banquet halls, and a mandap lawn facing the koi pond. Good pick if you want the family to stay over — 46 rooms, all newly furnished.",
    ph: "dusk", scene: "resort pool deck · twilight",
    amenities: ["Parking · 200 cars","Central AC","46 rooms + 4 suites","Pool deck","Bridal & groom suite","Multi-cuisine catering","Bar + late-night DJ","Generator + water backup","Wi-Fi","Airport pickup"],
    isSignature: false, parking: 200, rooms: 46,
    halls: [
      { name: "Pool Deck Lounge", ph: "dusk",   type: "Open · poolside",    area: "5,400 sq ft", theatre: 450, floating: 300, dining: 350, order: 0 },
      { name: "Suraj Banquet",    ph: "v2",     type: "Indoor · AC",         area: "6,200 sq ft", theatre: 550, floating: 280, dining: 400, order: 1 },
      { name: "Koi Mandap Lawn",  ph: "garden", type: "Open · landscaped",  area: "4,000 sq ft", theatre: 350, floating: 180, dining: 240, order: 2 },
    ],
  },
  {
    slug: "chitnavis-centre", name: "Chitnavis Centre", citySlug: "nagpur",
    locality: "Civil Lines, Nagpur", address: "Chitnavis Centre, Civil Lines, Nagpur — 440001",
    type: "Banquet Hall", typeSlug: "banquet", capacityMin: 100, capacityMax: 450,
    vegPlate: 900, nvPlate: 1150, hallRent: 38000, minGuarantee: 180000,
    rating: "4.5", reviews: 134, bookingsMonth: 28, tag: "Value pick",
    description: "One of Civil Lines' best-kept banquet halls — wood-floor ballroom, mezzanine-level bride's room, and a covered portico for the baraat. Our go-to for couples who want a classic ceremony without paying resort prices.",
    ph: "v2", scene: "wood-floor ballroom · classic",
    amenities: ["Parking · 90 cars","Central AC","Bridal suite","In-house + outside catering","Alcohol permitted","DJ till 11pm","Generator backup","Wi-Fi","CCTV"],
    isSignature: false, parking: 90, rooms: null,
    halls: [
      { name: "Chitnavis Ballroom", ph: "v2", type: "Indoor · AC",      area: "5,800 sq ft", theatre: 450, floating: 220, dining: 320, order: 0 },
      { name: "Portico Stage",      ph: "v3", type: "Covered · open",    area: "1,600 sq ft", theatre: 120, floating: 80,  dining: 90,  order: 1 },
    ],
  },
  {
    slug: "orange-county-farms", name: "Orange County Farms", citySlug: "nagpur",
    locality: "Katol Road, Nagpur", address: "Orange County, Katol Road, Nagpur — 441303",
    type: "Farmhouse", typeSlug: "farmhouse", capacityMin: 80, capacityMax: 350,
    vegPlate: 850, nvPlate: 1050, hallRent: 45000, minGuarantee: 160000,
    rating: "4.8", reviews: 98, bookingsMonth: 18, tag: "Intimate",
    description: "Four acres of orange groves with a central lawn and restored bungalow — the venue of choice for small, warm weddings. Winter season only (Oct–Feb) because the magic is in the orange-blossom air.",
    ph: "v5", scene: "farmhouse · orange grove lawn",
    amenities: ["Parking · 60 cars","Open-air kitchen","Catering flexible","Alcohol permitted","Acoustic/DJ (light)","Generator backup","Bonfire pit","Glamping tents optional"],
    isSignature: false, parking: 60, rooms: null,
    halls: [
      { name: "The Grove Lawn",      ph: "garden", type: "Open · orange grove", area: "8,000 sq ft", theatre: 350, floating: 220, dining: 250, order: 0 },
      { name: "Bungalow Veranda",    ph: "v5",     type: "Covered · open",       area: "1,800 sq ft", theatre: 140, floating: 90,  dining: 100, order: 1 },
    ],
  },
  {
    slug: "radisson-blu-nagpur", name: "Radisson Blu Nagpur", citySlug: "nagpur",
    locality: "MIHAN, Nagpur", address: "Radisson Blu, MIHAN, Nagpur — 441108",
    type: "5-Star Hotel", typeSlug: "hotel", capacityMin: 120, capacityMax: 600,
    vegPlate: 1550, nvPlate: 1850, hallRent: 90000, minGuarantee: 520000,
    rating: "4.7", reviews: 289, bookingsMonth: 44, tag: "Assured",
    description: "Closest 5-star to the airport — ideal when your guest list spans multiple cities. Three banquet spaces, a pillarless ballroom for 600, and 180 guest rooms. We partner with them on a preferred-rate agreement for our couples.",
    ph: "v2", scene: "pillarless ballroom · premium",
    amenities: ["Parking · 220 cars","Central AC · premium","180 guest rooms","Airport shuttle","Multi-cuisine menus","Licensed bar","DJ till 12am","Spa on-site","Wi-Fi campus-wide","Concierge + valet"],
    isSignature: false, parking: 220, rooms: 180,
    halls: [
      { name: "Grand Ballroom",   ph: "v2",   type: "Pillarless · AC",  area: "9,200 sq ft", theatre: 600, floating: 340, dining: 480, order: 0 },
      { name: "Sapphire Hall",    ph: "v3",   type: "Indoor · AC",      area: "3,800 sq ft", theatre: 300, floating: 160, dining: 220, order: 1 },
      { name: "Pool Courtyard",   ph: "dusk", type: "Open · poolside",  area: "3,400 sq ft", theatre: 220, floating: 150, dining: 180, order: 2 },
    ],
  },
];

// ─── Vendors ─────────────────────────────────────────────────────────────────

const vendorRows = [
  { slug: "studio-ishara",        category: "Photography",  categorySlug: "photographers", name: "Studio Ishara",           city: "Nagpur", locality: "Dharampeth",   rating: "4.9", reviews: 142, priceFrom: 85000,  completed: 230, yearsExp: 9,  ph: "v3",      scene: "bridal portrait · candid",          tagline: "Weddings told in 800 frames." },
  { slug: "lenslight-films",      category: "Photography",  categorySlug: "photographers", name: "Lenslight Films",         city: "Nagpur", locality: "Civil Lines",   rating: "4.8", reviews: 96,  priceFrom: 115000, completed: 180, yearsExp: 7,  ph: "v4",      scene: "same-day cinematic edit",           tagline: "Cinema, not just photos." },
  { slug: "marigold-mandap-co",   category: "Decorators",   categorySlug: "decorators",    name: "Marigold Mandap Co.",     city: "Nagpur", locality: "Sitabuldi",     rating: "4.8", reviews: 118, priceFrom: 250000, completed: 310, yearsExp: 12, ph: "garden",  scene: "marigold strand · mandap detail",   tagline: "One lakh marigolds, one knot." },
  { slug: "studio-rang",          category: "Decorators",   categorySlug: "decorators",    name: "Studio Rang",             city: "Nagpur", locality: "Shankar Nagar", rating: "4.7", reviews: 84,  priceFrom: 180000, completed: 220, yearsExp: 8,  ph: "rose",    scene: "pastel florals · ceiling install",  tagline: "Colour that stays in the photos." },
  { slug: "rhea-bridal-makeup",   category: "Makeup",       categorySlug: "makeup",        name: "Rhea Bridal",             city: "Nagpur", locality: "Dharampeth",   rating: "4.9", reviews: 172, priceFrom: 45000,  completed: 340, yearsExp: 10, ph: "rose",    scene: "bridal glam · airbrush",            tagline: "Your face, your day, your glow." },
  { slug: "saanvi-makeup-artistry",category: "Makeup",      categorySlug: "makeup",        name: "Saanvi Makeup Artistry",  city: "Nagpur", locality: "Laxmi Nagar",  rating: "4.7", reviews: 108, priceFrom: 32000,  completed: 210, yearsExp: 6,  ph: "v5",      scene: "engagement makeup · soft glam",     tagline: "Soft glam, honest skin." },
  { slug: "spice-route-catering", category: "Caterers",     categorySlug: "caterers",      name: "Spice Route Catering",    city: "Nagpur", locality: "Pardi",         rating: "4.8", reviews: 224, priceFrom: 750,    completed: 560, yearsExp: 15, ph: "saffron", scene: "live station · chaat counter",      tagline: "Vidarbha flavours. Pan-India menu." },
  { slug: "sharma-mehendi-art",   category: "Mehendi",      categorySlug: "mehendi",       name: "Sharma Mehendi Art",      city: "Nagpur", locality: "Itwari",        rating: "4.9", reviews: 156, priceFrom: 12000,  completed: 380, yearsExp: 14, ph: "v5",      scene: "bridal mehendi · intricate",        tagline: "Arabic, Rajasthani, bridal — in one steady hand." },
  { slug: "dj-vihaan",            category: "Music & DJ",   categorySlug: "music",         name: "DJ Vihaan",               city: "Nagpur", locality: "Manish Nagar",  rating: "4.7", reviews: 88,  priceFrom: 55000,  completed: 140, yearsExp: 8,  ph: "plum",    scene: "sangeet night · led stage",         tagline: "Sangeet to sunrise." },
  { slug: "pandit-shastri-ji",    category: "Pandits",      categorySlug: "pandits",       name: "Pandit Shastri Ji",       city: "Nagpur", locality: "Mahal",         rating: "5.0", reviews: 264, priceFrom: 11000,  completed: 720, yearsExp: 30, ph: "v5",      scene: "havan · marriage ceremony",         tagline: "Sanskrit shlokas, explained in Marathi + Hindi." },
];

// ─── Getaways ─────────────────────────────────────────────────────────────────

const getawayRows = [
  { slug: "pench-silver-stream",    name: "Pench Silver Stream",    location: "Pench Tiger Reserve edge, Khawasa",  hoursFromNagpur: "2.5 hrs from Nagpur", beds: 4, guests: 10, weekday: 9800,  weekend: 14500, rating: "4.9", reviews: 87, ph: "garden", scene: "forest villa · infinity pool",    tagline: "Silence is the amenity." },
  { slug: "tadoba-tiger-lodge",     name: "Tadoba Tiger Lodge",     location: "Mohurli Gate, Tadoba",               hoursFromNagpur: "3 hrs from Nagpur",   beds: 5, guests: 12, weekday: 12500, weekend: 18000, rating: "4.8", reviews: 64, ph: "v4",     scene: "jungle lodge · bonfire pit",     tagline: "Safari mornings. Bonfire nights." },
  { slug: "ramtek-hillside-farm",   name: "Ramtek Hillside Farm",   location: "Ramtek · Nagpur district",           hoursFromNagpur: "1 hr from Nagpur",    beds: 3, guests: 8,  weekday: 7500,  weekend: 11000, rating: "4.7", reviews: 52, ph: "v5",     scene: "farmhouse · orange orchard",     tagline: "An hour from home, a world away." },
  { slug: "khindsi-lake-cottage",   name: "Khindsi Lake Cottage",   location: "Khindsi Lake, Ramtek",               hoursFromNagpur: "1.5 hrs from Nagpur", beds: 4, guests: 10, weekday: 8800,  weekend: 12500, rating: "4.8", reviews: 41, ph: "ocean",  scene: "lake-facing cottage · sunset deck", tagline: "Sunset over water. Every evening." },
  { slug: "seoni-teak-villa",       name: "Seoni Teak Villa",       location: "Seoni · MP border",                  hoursFromNagpur: "2 hrs from Nagpur",   beds: 3, guests: 8,  weekday: 8200,  weekend: 11800, rating: "4.6", reviews: 33, ph: "v3",     scene: "teak forest villa · private deck", tagline: "Inside Kipling's Jungle Book." },
  { slug: "chikhaldara-cloud-villa",name: "Chikhaldara Cloud Villa", location: "Chikhaldara hill station",           hoursFromNagpur: "4 hrs from Nagpur",   beds: 4, guests: 10, weekday: 9200,  weekend: 13800, rating: "4.7", reviews: 38, ph: "garden", scene: "hill-top villa · monsoon clouds", tagline: "Cooler by 8°, always." },
];

// ─── Destinations ─────────────────────────────────────────────────────────────

const destinationRows = [
  { slug: "udaipur",    city: "Udaipur",    tag: "City of Lakes",            ph: "plum",   venues: 6, priceFrom: "₹8L",   feat: true },
  { slug: "goa",        city: "Goa",        tag: "Beach & Portuguese charm", ph: "ocean",  venues: 8, priceFrom: "₹6L",   feat: false },
  { slug: "jaipur",     city: "Jaipur",     tag: "Royal Rajputana",          ph: "v3",     venues: 5, priceFrom: "₹9L",   feat: false },
  { slug: "coorg",      city: "Coorg",      tag: "Misty coffee hills",       ph: "garden", venues: 4, priceFrom: "₹5L",   feat: false },
  { slug: "jaisalmer",  city: "Jaisalmer",  tag: "Desert romance",           ph: "v5",     venues: 3, priceFrom: "₹7L",   feat: false },
  { slug: "rishikesh",  city: "Rishikesh",  tag: "Riverside · spiritual",    ph: "ocean",  venues: 3, priceFrom: "₹4.5L", feat: false },
];

// ─── Real Weddings ────────────────────────────────────────────────────────────

const realWeddingRows = [
  { slug: "priya-arjun",    couple: "Priya & Arjun",    venue: "The Centre Point Grand", date: "Dec 2025", guests: 420, ph: "v2",     scene: "mandap · ceremony",      quote: "The hall was exactly as the mockup. Our wedding cost ₹11,000 less than estimated." },
  { slug: "ananya-rohan",   couple: "Ananya & Rohan",   venue: "Mahalaxmi Lawns",        date: "Nov 2025", guests: 280, ph: "garden", scene: "lawn baraat",             quote: null },
  { slug: "meera-karan",    couple: "Meera & Karan",    venue: "Haveli Ashirwad",         date: "Feb 2026", guests: 180, ph: "dusk",   scene: "haldi courtyard",         quote: null },
  { slug: "riya-vikram",    couple: "Riya & Vikram",    venue: "Suraj Palace Resort",     date: "Jan 2026", guests: 360, ph: "v3",     scene: "sangeet stage",           quote: null },
  { slug: "ishita-dev",     couple: "Ishita & Dev",     venue: "Pench Silver Stream",     date: "Oct 2025", guests: 52,  ph: "v4",     scene: "forest pheras",           quote: null },
  { slug: "kavya-nishant",  couple: "Kavya & Nishant",  venue: "Signature Resorts",       date: "Dec 2025", guests: 480, ph: "garden", scene: "mandap lawn · sunset",    quote: null },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database…");

  // Venues + halls
  for (const { halls, ...venue } of venueRows) {
    const [inserted] = await db
      .insert(venuesTable)
      .values(venue)
      .onConflictDoNothing({ target: venuesTable.slug })
      .returning({ id: venuesTable.id });

    if (inserted && halls.length) {
      await db
        .insert(venueHallsTable)
        .values(halls.map((h) => ({ ...h, venueId: inserted.id })))
        .onConflictDoNothing();
    }
  }
  console.log(`  ✓ ${venueRows.length} venues`);

  // Vendors
  await db.insert(vendorsTable).values(vendorRows).onConflictDoNothing({ target: vendorsTable.slug });
  console.log(`  ✓ ${vendorRows.length} vendors`);

  // Getaways
  await db.insert(getawaysTable).values(getawayRows).onConflictDoNothing({ target: getawaysTable.slug });
  console.log(`  ✓ ${getawayRows.length} getaways`);

  // Destinations
  await db.insert(destinationsTable).values(destinationRows).onConflictDoNothing({ target: destinationsTable.slug });
  console.log(`  ✓ ${destinationRows.length} destinations`);

  // Real weddings
  await db.insert(realWeddingsTable).values(realWeddingRows).onConflictDoNothing({ target: realWeddingsTable.slug });
  console.log(`  ✓ ${realWeddingRows.length} real weddings`);

  console.log("Done.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  pool.end();
  process.exit(1);
});
