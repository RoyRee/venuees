# Venuees.in — Workspace

## Overview

pnpm workspace monorepo using TypeScript. Venuees.in is a Nagpur wedding platform by Bsquare Hospitality. Core philosophy: "No middlemen, no 'starting from' pricing — the quote is the quote."

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **ORM**: Drizzle ORM with drizzle-zod validation
- **Frontend**: React + Vite + wouter (routing) + @tanstack/react-query
- **Build**: esbuild (CJS bundle) for API; Vite for frontend

## Architecture

```
artifacts/
  api-server/   — Express 5 API on process.env.PORT (8080 in dev)
  venuees/      — React + Vite frontend, proxies /api → api-server
  mockup-sandbox/ — Component Preview Server (Canvas/design)
lib/
  db/           — Drizzle schema, migrations, shared DB client
```

### API Proxy (dev)
Vite dev server proxies `${basePath}api/*` → `http://localhost:8080/api/*`

### Frontend data fetching
All pages use `api.ts` + `useQuery` from @tanstack/react-query (no static data). `BASE_URL` from `import.meta.env.BASE_URL` is prepended to all API calls.

## DB Schema Tables
- `venues` — 8 Nagpur wedding venues with full details
- `venue_halls` — multiple halls per venue (capacity, pricing)
- `venue_images` — venue photo gallery
- `vendors` — 10 vetted Nagpur vendors (photographers, decorators, etc.)
- `vendor_images` — vendor portfolio images
- `getaways` — 6 weekend getaway properties near Nagpur
- `getaway_images` — getaway gallery images
- `destinations` — 6 destination wedding cities (Udaipur, Goa, Jaipur, etc.)
- `real_weddings` — 6 real wedding stories with images
- `real_wedding_images` — wedding gallery images
- `enquiries` — form submissions (venue enquiries, vendor enquiries, contact, etc.)
- `newsletter_signups` — email newsletter signups
- `listing_applications` — venue/vendor listing applications

## API Routes
- `GET /api/venues` — list venues (filters: city, type, search)
- `GET /api/venues/:slug` — venue detail with halls + images
- `GET /api/vendors` — list vendors (filter: category)
- `GET /api/vendors/:slug` — vendor detail with images
- `GET /api/getaways` — list getaways
- `GET /api/getaways/:slug` — getaway detail with images
- `GET /api/destinations` — list destinations
- `GET /api/real-weddings` — list real weddings with images
- `POST /api/enquiries` — submit venue/vendor/contact enquiry
- `POST /api/newsletter` — newsletter signup
- `POST /api/listings/apply` — listing application

## Frontend Pages (all DB-driven)
- `/` — Home (signature venues, featured vendors, real weddings)
- `/venues` — Venue list with filters + sorting
- `/venues/:city/:locality/:slug` — Venue detail with enquiry form
- `/vendors` — Vendors hub with category grid + featured vendors
- `/vendors/:category` — Vendor category page with modal enquiry
- `/vendors/:category/:slug` — (links ready; detail page wired)
- `/weekend-getaways` — Getaways list
- `/weekend-getaways/:slug` — Getaway detail with pricing sidebar
- `/destination-weddings` — Destination hub with package comparison
- `/destination-weddings/:slug` — (static fallback)
- `/real-weddings` — Real weddings gallery
- `/contact` — Contact form wired to API
- `/list-your-business` — Listing application form

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/venuees run dev` — run frontend locally

## Key Files
- `artifacts/venuees/src/lib/api.ts` — all typed API calls + TypeScript types
- `artifacts/venuees/src/main.tsx` — React Query provider
- `artifacts/venuees/src/App.tsx` — wouter routes
- `artifacts/api-server/src/routes/index.ts` — API router mount
- `artifacts/api-server/src/routes/venues.ts` — venues endpoints
- `artifacts/api-server/src/routes/enquiries.ts` — enquiry + newsletter endpoints
- `lib/db/src/schema/index.ts` — full Drizzle schema
- `artifacts/venuees/vite.config.ts` — Vite proxy config

## User Preferences
- No "starting from" pricing — show real quotes
- No static/mock data — everything from DB
- Nagpur-centric but handles destination weddings
- Bsquare Hospitality branding
