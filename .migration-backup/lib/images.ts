// Real photography layer.
//
// Two sources, checked in order:
//   1. A local file under /public/images/<slug>/<n>.jpg (owner-provided, preferred).
//   2. An Unsplash URL (curated stock, licensed free for commercial use).
//
// To use your own photo: drop a file at /public/images/<slug>/1.jpg (or .webp),
// then set `ownerPhotos: N` on that slug below. The component will prefer local
// files over Unsplash automatically.
//
// Unsplash URLs use the ?w=1600&q=80&fit=crop&auto=format syntax so they're
// delivered at the right size and compression from their CDN.

export type VenuePhotos = {
  hero: string;
  gallery: string[];
  halls?: string[];
  ownerPhotos?: number; // if > 0, the component loads /public/images/<slug>/1..N.jpg instead
};

const U = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// --- Signature Resorts (owner's flagship) — real owned photos ---
const SR = (file: string) => `/images/${file}`;

export const signatureResortsPhotos: VenuePhotos = {
  hero: SR("WhatsApp Image 2026-04-20 at 01.09.52.jpeg"),
  gallery: [
    SR("WhatsApp Image 2026-04-20 at 01.09.52.jpeg"),
    SR("WhatsApp Image 2026-04-20 at 01.10.39.jpeg"),
    SR("654618549_17982999968980061_3123502551600901536_n.jpg"),
    SR("654727022_17982999947980061_7316739727637371832_n.jpg"),
    SR("655214054_17982999977980061_8544243618630915425_n.jpg"),
    SR("656295067_17982999986980061_1419065043099391087_n.jpg"),
    SR("657268693_17890160028444368_651628256912471433_n.jpg"),
  ],
  halls: [
    SR("WhatsApp Image 2026-04-20 at 01.09.52.jpeg"),
    SR("654727022_17982999947980061_7316739727637371832_n.jpg"),
    SR("656250143_17890160019444368_2984950474495475675_n.jpg"),
    SR("657268693_17890160028444368_651628256912471433_n.jpg"),
  ],
};

export const signatureResortsVideos = [
  "/images/AQMYnwNHg6DSD3piUHeygGL13LXpTOW_y6Pd7THr4gLr1EEcfUeF7Dn9dIBaR6Oa5cMFzwc2zyPRFn-buSh0uxO8.mp4",
  "/images/AQNjDDji78sN2tgs3IgOeEruFlmyTCuuNC-c0C6Oic1vVIEpnoeUmzdN72hXv_nP-y8KGMjl7nk5uQ4Pd7ZyMcT1.mp4",
  "/images/AQPhm2MB8iiRR70eAbiOatNx_394cZoqOgulSTOJ0QpMKUvGCP5M631xqWxms87WR7OdWv0Dy3iCYPoU5kXRMZim.mp4",
];

// --- All other venues ---
// Keyed by venue slug. Same shape. Unsplash for now; swap for owned photos.
export const venuePhotos: Record<string, VenuePhotos> = {
  "signature-resorts-nagpur": signatureResortsPhotos, // real owner photos — no ownerPhotos flag needed

  "the-centre-point-grand": {
    hero: U("1551918120-9739cb430c6d"),
    gallery: [
      U("1551918120-9739cb430c6d"),        // heritage hotel · ornate
      U("1566073771259-6a8506099945"),     // facade · evening
      U("1578898887932-dce23a595ad4"),     // ballroom · chandelier
      U("1455587734955-081b22074882"),     // courtyard · arches
    ],
    halls: [
      U("1578898887932-dce23a595ad4"),
      U("1455587734955-081b22074882"),
      U("1540541338287-41700207dee6"),
    ],
  },
  "mahalaxmi-lawns": {
    hero: U("1464366400600-7168b8af9bc3"),
    gallery: [
      U("1464366400600-7168b8af9bc3"),    // marigold mandap lawn
      U("1519741497674-611481863552"),     // lawn entry
      U("1519225421980-715cb0215aed"),     // baraat setup
      U("1583527976767-dbe1e4b5b4e9"),     // banquet interior
    ],
    halls: [
      U("1519741497674-611481863552"),
      U("1583527976767-dbe1e4b5b4e9"),
      U("1578898887932-dce23a595ad4"),
    ],
  },
  "haveli-ashirwad": {
    hero: U("1582719508461-905c673771fd"),
    gallery: [
      U("1582719508461-905c673771fd"),    // heritage haveli courtyard
      U("1519452635265-7b1fbfd1e4e0"),     // carved wooden door
      U("1528127269322-539801943592"),     // heritage interior
      U("1566073771259-6a8506099945"),
    ],
    halls: [
      U("1582719508461-905c673771fd"),
      U("1519452635265-7b1fbfd1e4e0"),
    ],
  },
  "suraj-palace-resort": {
    hero: U("1540541338287-41700207dee6"),
    gallery: [
      U("1540541338287-41700207dee6"),    // pool · twilight
      U("1551882547-ff40c63fe5fa"),        // resort bedroom
      U("1566073771259-6a8506099945"),     // lit facade
      U("1571896349842-33c89424de2d"),     // landscaped garden
    ],
    halls: [
      U("1540541338287-41700207dee6"),
      U("1578898887932-dce23a595ad4"),
      U("1571896349842-33c89424de2d"),
    ],
  },
  "chitnavis-centre": {
    hero: U("1519741497674-611481863552"),
    gallery: [
      U("1464366400600-7168b8af9bc3"),
      U("1578898887932-dce23a595ad4"),
      U("1583527976767-dbe1e4b5b4e9"),
      U("1540541338287-41700207dee6"),
    ],
    halls: [
      U("1583527976767-dbe1e4b5b4e9"),
      U("1455587734955-081b22074882"),
    ],
  },
  "orange-county-farms": {
    hero: U("1571896349842-33c89424de2d"),
    gallery: [
      U("1571896349842-33c89424de2d"),    // farmhouse garden
      U("1587502537745-84b86da1204f"),     // orange grove
      U("1519741497674-611481863552"),     // bungalow
      U("1540541338287-41700207dee6"),
    ],
    halls: [
      U("1571896349842-33c89424de2d"),
      U("1587502537745-84b86da1204f"),
    ],
  },
  "radisson-blu-nagpur": {
    hero: U("1566073771259-6a8506099945"),
    gallery: [
      U("1566073771259-6a8506099945"),    // 5-star facade
      U("1578898887932-dce23a595ad4"),     // pillarless ballroom
      U("1551882547-ff40c63fe5fa"),
      U("1540541338287-41700207dee6"),
    ],
    halls: [
      U("1578898887932-dce23a595ad4"),
      U("1583527976767-dbe1e4b5b4e9"),
      U("1540541338287-41700207dee6"),
    ],
  },
};

// --- Weekend getaways ---
export const getawayPhotos: Record<string, VenuePhotos> = {
  "pench-silver-stream":     { hero: U("1587502537745-84b86da1204f"), gallery: [U("1587502537745-84b86da1204f"), U("1571896349842-33c89424de2d"), U("1540541338287-41700207dee6")] },
  "tadoba-tiger-lodge":      { hero: U("1511497584788-876760111969"), gallery: [U("1511497584788-876760111969"), U("1587502537745-84b86da1204f"), U("1571896349842-33c89424de2d")] },
  "ramtek-hillside-farm":    { hero: U("1571896349842-33c89424de2d"), gallery: [U("1571896349842-33c89424de2d"), U("1587502537745-84b86da1204f")] },
  "khindsi-lake-cottage":    { hero: U("1500382017468-9049fed747ef"), gallery: [U("1500382017468-9049fed747ef"), U("1540541338287-41700207dee6")] },
  "seoni-teak-villa":        { hero: U("1587502537745-84b86da1204f"), gallery: [U("1587502537745-84b86da1204f"), U("1571896349842-33c89424de2d")] },
  "chikhaldara-cloud-villa": { hero: U("1506905925346-21bda4d32df4"), gallery: [U("1506905925346-21bda4d32df4"), U("1587502537745-84b86da1204f")] },
};

// --- Destinations (for the hub band) ---
export const destinationPhotos: Record<string, string> = {
  udaipur:   U("1590080875515-8a3a8dc5735e"),  // palace on lake
  goa:       U("1512343879784-a960bf40e7f2"),  // beach huts
  jaipur:    U("1599661046289-e31897846e41"),  // Hawa Mahal-ish
  coorg:     U("1587502537745-84b86da1204f"),  // coffee hills
  jaisalmer: U("1524492412937-b28074a5d7da"),  // desert dunes
  rishikesh: U("1585155770447-2f66e2a397b5"),  // river valley
};

// --- Real weddings ---
export const realWeddingPhotos: Record<string, string> = {
  "priya-arjun":    U("1519741497674-611481863552"),
  "ananya-rohan":   U("1464366400600-7168b8af9bc3"),
  "meera-karan":    U("1582719508461-905c673771fd"),
  "riya-vikram":    U("1540541338287-41700207dee6"),
  "ishita-dev":     U("1511497584788-876760111969"),
  "kavya-nishant":  U("1519741497674-611481863552"),
};

// --- Vendors ---
export const vendorPhotos: Record<string, string> = {
  "studio-ishara":          U("1519741497674-611481863552"),
  "lenslight-films":        U("1519225421980-715cb0215aed"),
  "marigold-mandap-co":     U("1464366400600-7168b8af9bc3"),
  "studio-rang":            U("1519741497674-611481863552"),
  "rhea-bridal-makeup":     U("1560066984-138dadb4c035"),
  "saanvi-makeup-artistry": U("1522337360788-8b13dee7a37e"),
  "spice-route-catering":   U("1555244162-803834f70033"),
  "sharma-mehendi-art":     U("1535385031957-88b8fa7f7e72"),
  "dj-vihaan":              U("1501612780327-45045538702b"),
  "pandit-shastri-ji":      U("1519741497674-611481863552"),
};

// --- Helper: resolve a venue's hero photo, preferring owner-dropped files. ---
export function venueHero(slug: string): string {
  const p = venuePhotos[slug];
  if (!p) return U("1519741497674-611481863552");
  if (p.ownerPhotos && p.ownerPhotos > 0) return `/images/${slug}/1.jpg`;
  return p.hero;
}

export function venueGallery(slug: string): string[] {
  const p = venuePhotos[slug];
  if (!p) return [];
  if (p.ownerPhotos && p.ownerPhotos > 0) {
    return Array.from({ length: p.ownerPhotos }, (_, i) => `/images/${slug}/${i + 1}.jpg`);
  }
  return p.gallery;
}
