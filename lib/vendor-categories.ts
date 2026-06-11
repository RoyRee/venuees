// Canonical mapping between the business types offered on the application
// form and the category slugs the public /vendors pages are built around.
// Without this, an approved "Photography" application gets categorySlug
// "photography" while the public page queries "photographers" — and the
// vendor never appears anywhere.

export const VENDOR_CATEGORY_MAP: Record<string, { slug: string; name: string }> = {
  "Photography":             { slug: "photographers",    name: "Photographers" },
  "Videography":             { slug: "photographers",    name: "Photographers" },
  "Décor & Florals":         { slug: "decorators",       name: "Decorators & florists" },
  "Catering":                { slug: "caterers",         name: "Caterers" },
  "Makeup & Beauty":         { slug: "makeup",           name: "Makeup artists" },
  "Mehendi":                 { slug: "mehendi",          name: "Mehendi artists" },
  "Music / DJ":              { slug: "music",            name: "Music & DJs" },
  "Pandit":                  { slug: "pandits",          name: "Pandits" },
  "Event Management":        { slug: "event-management", name: "Event planners" },
  "Invitation & Stationery": { slug: "invitations",      name: "Invitations & stationery" },
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function vendorCategoryFor(businessType: string): { slug: string; name: string } {
  return VENDOR_CATEGORY_MAP[businessType] ?? { slug: slugify(businessType), name: businessType };
}

// Slugs that may exist in older rows (created before the mapping) for each
// canonical category — used when querying so legacy vendors still show up.
export const CATEGORY_SLUG_ALIASES: Record<string, string[]> = {
  photographers:      ["photographers", "photography", "videography"],
  decorators:         ["decorators", "d-cor-florals", "decor-florals"],
  caterers:           ["caterers", "catering"],
  makeup:             ["makeup", "makeup-beauty"],
  mehendi:            ["mehendi"],
  music:              ["music", "music-dj"],
  pandits:            ["pandits", "pandit"],
  "event-management": ["event-management"],
  invitations:        ["invitations", "invitation-stationery"],
};
