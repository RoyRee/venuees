# Venue photos — drop-in folder

To use real owner-supplied photos instead of the Unsplash stock defaults, drop JPG files into a subfolder named after the venue slug:

```
public/images/
├── signature-resorts-nagpur/
│   ├── 1.jpg   ← hero
│   ├── 2.jpg
│   ├── 3.jpg
│   └── 4.jpg
├── the-centre-point-grand/
│   ├── 1.jpg
│   └── 2.jpg
└── ...
```

Then in `lib/images.ts`, add `ownerPhotos: N` to that venue's entry:

```ts
"signature-resorts-nagpur": {
  ...
  ownerPhotos: 4,   // ← use 1.jpg ... 4.jpg from this folder
}
```

The `venueHero()` and `venueGallery()` helpers automatically prefer local files when `ownerPhotos` is set — no other code changes needed.

## Image guidelines

- **Format**: `.jpg` (or `.webp`) — 1600 px wide, q=80. Next.js serves them as-is.
- **Naming**: `1.jpg`, `2.jpg`, `3.jpg` — sequential, no gaps. `1.jpg` is always the hero.
- **Licensing**: only upload photos you own or have written permission to use. Unsplash defaults are licensed for commercial use.
- **Size**: keep each file under 500 KB. If you have massive originals, run them through <https://squoosh.app> first.

## Venue slugs (for reference)

```
signature-resorts-nagpur
the-centre-point-grand
mahalaxmi-lawns
haveli-ashirwad
suraj-palace-resort
chitnavis-centre
orange-county-farms
radisson-blu-nagpur
```
