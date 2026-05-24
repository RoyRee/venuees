# Venuees.in — Master Roadmap
> Written: May 2026 · Stack: Next.js 15 · Drizzle + Postgres (Supabase) · Vercel

---

## 1. CODEBASE STATE — HONEST AUDIT

### ✅ Built & working
| Area | Detail |
|---|---|
| Frontend shell | All 15+ page routes rendered, responsive, 3-theme system |
| DB schema (Drizzle) | venues, venue_halls, venue_images, vendors, vendor_images, getaways, destinations, real_weddings, enquiries, newsletter_signups, listing_applications, listing_application_media, profiles, saved_listings |
| Auth (Supabase) | Login, session middleware, role-gated `/dashboard` |
| Role system | `admin` (env var email list) · `vendor` · `customer` |
| Admin dashboard | Enquiries view, Applications review (approve/reject), Listings toggle active/inactive |
| Vendor dashboard | Application status, own enquiries, own listings |
| API routes | `/api/venues`, `/api/vendors`, `/api/enquiries`, `/api/apply` (+ media), `/api/listings` (toggle/update), `/api/admin/migrate`, `/api/getaways`, `/api/destinations`, `/api/real-weddings`, `/api/saved`, `/api/newsletter` |
| Application flow | Vendors can apply with photos/media (base64 stored in DB) |
| Hero search | Interactive multi-tab: Venues / Getaways / Destinations / Vendors |
| Seed script | `scripts/seed.ts` — populates all tables from `lib/data.ts` |

### ⚠️ Static — needs to become dynamic
| Area | Problem | Fix |
|---|---|---|
| `lib/data.ts` | All venues, vendors, getaways, destinations, real weddings are hardcoded. DB schema exists but pages still read from the file. | Run seed + switch all page data fetches to DB queries |
| Blog / Journal | Posts hardcoded in `app/blog/page.tsx`. No DB table, no CMS. | Add `posts` table + admin write UI |
| Event management services | SERVICES object hardcoded in `app/event-management/[slug]/page.tsx` | Move to DB or CMS |
| Venue detail page | Uses `getVenueBySlug()` from `lib/data.ts`, not the DB | Switch to `db.select()` |
| Filter/sort on venues list | Checkboxes render but have no state, no server query | Wire to URL params + DB `where` clauses |
| Forms | All forms (contact, event-mgmt enquiry, list-your-business apply) are non-wired — no `onSubmit` handler | Wire every form to `/api/enquiries` or `/api/apply` |
| Calendar on venue detail | Shows mock `calDays` array | Replace with real `venue_availability` table |

### ❌ Missing entirely
| What | Why it matters |
|---|---|
| `sitemap.xml` + `robots.txt` | Google can't crawl efficiently without it — #1 SEO blocker |
| JSON-LD structured data | Rich results (star ratings, prices) in Google SERP — big CTR lift |
| Approve → auto-create listing | Admin approves application but no code creates the venue/vendor row | 
| Photo storage (Supabase Storage / R2) | Media is stored as base64 in DB — will break at scale, slow pages |
| Email notifications (Resend) | No one gets notified when an enquiry lands — leads go cold |
| WhatsApp enquiry routing | Nagpur buyers expect WhatsApp — biggest conversion gap |
| Vendor subscription + payment (Razorpay) | Zero revenue until this is live |
| Analytics (Posthog / GA4) | No data on what pages convert, where users drop |
| City / Locality SEO pages | `/venues/nagpur/wardha-road` has no index page — massive keyword gap |
| Blog CMS | No way to publish content — SEO content flywheel is stalled |
| `db:seed` actually run against prod DB | Prod DB is empty; site would 404 on every venue page |

---

## 2. BUSINESS MODEL — CLARITY

**Who pays:** Venues, vendors, and service providers.
**Who browses free:** Couples, families, anyone planning a celebration.
**Revenue mechanics:**

| Tier | Price | Who |
|---|---|---|
| Essential | ₹24,000 / year | Solo photographers, makeup artists, small vendors |
| Assured | ₹72,000 / year | Multi-listing operators (3 venues or services) |
| Signature | ₹2,40,000 / year | Flagship partners — homepage + editorial placement |

**Lead flow:**
1. Couple fills enquiry form on a venue or vendor page
2. Enquiry stored in DB, tagged to that `venue_slug` / `vendor_slug`
3. Vendor gets email + WhatsApp notification immediately
4. Vendor calls/WhatsApps couple directly — Venuees never inserts
5. Venuees collects nothing per booking — all revenue is the flat listing fee

**Upsells (later):**
- Featured placement in search results (₹5,000–₹15,000/month boost)
- Editorial / Real Weddings feature (₹8,000–₹20,000 per story)
- Sponsored blog post in Journal (₹5,000–₹12,000)

---

## 3. DEPLOYMENT — IMMEDIATE (this week)

### 3.1 Environment setup
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=                    # Supabase Postgres connection string (pooled)
ADMIN_EMAILS=rahulshrirame6@gmail.com
RESEND_API_KEY=                  # add when ready
```

### 3.2 Run migrations + seed
```bash
npm run db:push          # Drizzle pushes schema to Supabase Postgres
npx tsx scripts/seed.ts  # Populates all tables from lib/data.ts
```

### 3.3 Vercel deploy checklist
- [ ] Custom domain: `venuees.in` → add to Vercel + set DNS A/CNAME
- [ ] All 5 env vars set in Vercel → Settings → Environment Variables
- [ ] `ADMIN_EMAILS` set to owner email
- [ ] Build passes: `npm run build` locally first
- [ ] Test enquiry API: `curl -X POST /api/enquiries ...`
- [ ] Test application flow: apply as vendor, approve in admin
- [ ] Check Supabase table editor — rows present after seed

### 3.4 Domain + SSL
- Vercel auto-provisions Let's Encrypt SSL
- Set `metadataBase: new URL("https://venuees.in")` in `app/layout.tsx` (already set — confirm)
- Verify www → non-www or vice versa redirect is configured

---

## 4. PHASE 1 — "Live and crawlable" (Weeks 1–2)

**Goal: Google can find and index every venue, vendor, and key page.**

### 4.1 Seed the database and switch all page reads to DB

**Files to change:**
- `app/venues/page.tsx` — replace `venues` import from `lib/data` with `db.select().from(venuesTable)`
- `app/venues/[city]/[locality]/[slug]/page.tsx` — same
- `app/vendors/page.tsx`, `app/vendors/[category]/page.tsx`, `app/vendors/[category]/[slug]/page.tsx`
- `app/weekend-getaways/page.tsx` + `[slug]`
- `app/destination-weddings/page.tsx` + `[slug]`
- `app/real-weddings/page.tsx` + `[slug]`

Pattern for every page:
```ts
// Before
import { venues } from "@/lib/data";

// After
import { db } from "@/lib/db";
import { venuesTable } from "@/lib/db/schema";
const venues = await db.select().from(venuesTable).where(eq(venuesTable.isActive, true));
```

### 4.2 Sitemap

Create `app/sitemap.ts`:
```ts
// Generates /sitemap.xml automatically
// Includes: all venue pages, vendor pages, getaway pages, blog posts, static pages
// Update frequency: venues = weekly, blog = daily, static = monthly
```

Key URLs to include:
- `/` · `/venues` · `/vendors` · `/weekend-getaways` · `/destination-weddings`
- `/venues/nagpur/{locality}/{slug}` — one per venue
- `/vendors/{category}/{slug}` — one per vendor  
- `/blog/{slug}` — one per post
- All `event-management`, `real-weddings`, `contact`, `about`, `list-your-business`

### 4.3 robots.txt

Create `app/robots.ts`:
```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Sitemap: https://venuees.in/sitemap.xml
```

### 4.4 JSON-LD Structured Data

Add to every venue detail page:
```json
{
  "@context": "https://schema.org",
  "@type": "EventVenue",
  "name": "Signature Resorts",
  "address": { "@type": "PostalAddress", "streetAddress": "Wardha Road", "addressLocality": "Nagpur", "addressRegion": "MH" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "412" },
  "telephone": "+91 712 555 0180",
  "url": "https://venuees.in/venues/nagpur/wardha-road/signature-resorts-nagpur"
}
```

Add `LocalBusiness` schema to homepage, `ProfessionalService` to vendor pages.

### 4.5 Locality + City index pages

Create `app/venues/[city]/page.tsx` — "Wedding venues in Nagpur" city hub
Create `app/venues/[city]/[locality]/page.tsx` — "Wedding venues on Wardha Road, Nagpur"

These are high-intent SEO pages. Each locality page:
- H1: "Wedding venues on {Locality}, {City}"
- Lists all venues in that locality with price, capacity, rating
- Internal links to each venue detail page
- Breadcrumb schema
- Target keywords: "banquet halls in Civil Lines Nagpur", "resort wedding venues Wardha Road"

### 4.6 Wire all forms to APIs

Every form currently has a `<button>` with `type="button"` — no submit handler.

| Form location | API endpoint | Kind |
|---|---|---|
| Venue detail sidebar | `/api/enquiries` | `venue_enquiry` |
| Vendor detail | `/api/enquiries` | `vendor_enquiry` |
| Contact page | `/api/enquiries` | `contact` |
| Event management | `/api/enquiries` | `contact` |
| List-your-business | `/api/apply` | — |
| Homepage enquiry | `/api/enquiries` | `homepage_lead` |
| Getaway detail | `/api/enquiries` | `getaway_enquiry` |

All forms need:
1. `useState` for field values
2. `onSubmit` calling `fetch("/api/enquiries", { method:"POST", body: JSON.stringify(data) })`
3. Loading state on the button
4. Success message / redirect after submit

---

## 5. PHASE 2 — "Dynamic CMS + admin control" (Weeks 3–5)

**Goal: Venuees team can manage all content without touching code. Vendors can self-edit their listing.**

### 5.1 Admin: Approve application → Create listing

Currently the "Approve" button in `app/dashboard/applications/actions.tsx` marks status = `approved` but does NOT create the venue/vendor row in the DB.

Fix `actions.tsx` to:
1. Parse `application.details` (which contains the full listing data submitted)
2. `db.insert(venuesTable)` or `db.insert(vendorsTable)` with `ownerUserId = application.userId`
3. Move photos from `listing_application_media` → Supabase Storage → `venue_images` table
4. Send vendor a "you're live" email via Resend
5. Send WhatsApp message to vendor WhatsApp (via WhatsApp Business API or wa.link fallback)

### 5.2 Photo storage — move away from base64 in DB

Current: photos uploaded during application are stored as base64 text in `listing_application_media.data` column. This is fine for prototype but will:
- Slow down admin page (loading dozens of base64 images)
- Hit Postgres row size limits at scale

Fix:
1. Add Supabase Storage bucket `venue-photos` (public, CDN-backed)
2. Change `app/api/apply/media/route.ts` to upload to Storage, store URL in `data` column
3. On approval, copy URLs to `venue_images` table

### 5.3 Vendor self-edit listing

`app/dashboard/listings/edit/[type]/[id]/page.tsx` and `edit-form.tsx` already exist.

Needs completion:
- All venue fields editable: name, description, prices, amenities, contact, whatsapp
- Hall editor: add/remove halls, set capacity numbers
- Photo manager: upload new photos, reorder, delete
- Save → `PATCH /api/listings/update`

### 5.4 Blog / Journal CMS

Add `postsTable` to Drizzle schema:
```ts
export const postsTable = pgTable("posts", {
  slug:        text("slug").primaryKey(),
  title:       text("title").notNull(),
  category:    text("category").notNull(),
  body:        text("body").notNull(),       // markdown
  excerpt:     text("excerpt").notNull(),
  publishedAt: timestamp("published_at"),
  isPublished: boolean("is_published").default(false),
  authorName:  text("author_name"),
  readMins:    integer("read_mins"),
  ph:          text("ph").default("v2"),
});
```

Admin write UI at `app/dashboard/blog/new/page.tsx`:
- Title, slug (auto-generated), category, body (markdown textarea), excerpt
- Publish toggle
- `POST /api/admin/blog`

`app/blog/page.tsx` and `app/blog/[slug]/page.tsx` fetch from DB instead of hardcoded `POSTS` array.

### 5.5 Functional filters on venue list page

`app/venues/page.tsx` currently renders filter checkboxes as decoration.

Switch to URL-param driven server-side filtering:
```
/venues?type=hotel&locality=civil-lines&minCap=200&maxPlate=1200&amenities=rooms,bar
```

All params fed into Drizzle `where()` clauses. No client-side JS needed — pure server components.

### 5.6 Real availability calendar

Add `venue_availability` table:
```ts
export const venueAvailabilityTable = pgTable("venue_availability", {
  id:      integer("id").primaryKey().generatedByDefaultAsIdentity(),
  venueId: integer("venue_id").notNull(),
  date:    text("date").notNull(),           // "2026-12-15"
  status:  text("status").notNull(),         // "booked" | "blocked" | "available"
  hallId:  integer("hall_id"),               // optional — per-hall blocking
});
```

Vendor can mark dates booked in their dashboard. Calendar on venue detail page shows real availability.

---

## 6. PHASE 3 — "Monetisation + lead routing" (Weeks 6–9)

**Goal: Vendors pay to list. Enquiries route to the right vendor instantly. Revenue flows.**

### 6.1 Vendor subscription (Razorpay)

Add `subscriptionsTable`:
```ts
export const subscriptionsTable = pgTable("subscriptions", {
  id:         integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId:     text("user_id").notNull(),
  tier:       text("tier").notNull(),         // "essential" | "assured" | "signature"
  amount:     integer("amount").notNull(),    // in paise
  status:     text("status").notNull(),       // "active" | "expired" | "cancelled"
  startDate:  timestamp("start_date").notNull(),
  endDate:    timestamp("end_date").notNull(),
  razorpayId: text("razorpay_id"),
});
```

Flow:
1. Vendor's application is approved
2. Admin (or auto) sends payment link via Razorpay (or shows payment page in dashboard)
3. On payment webhook → mark subscription `active`, set `isActive = true` on their listing
4. 30 days before expiry → email reminder via Resend
5. On expiry → `isActive = false` (listing hidden but not deleted)

Razorpay integration:
- `POST /api/payments/create-order` — creates Razorpay order
- `POST /api/payments/webhook` — verifies signature, activates subscription

### 6.2 Instant lead notifications

When `POST /api/enquiries` succeeds:

**To Venuees admin (always):**
- Email via Resend: "New enquiry — {name} for {venue}, {guests} guests, {date}"

**To the vendor (when enquiry has venue_slug or vendor_slug):**
- Email: "You have a new lead from Venuees.in — {name}, {phone}, {message}"
- WhatsApp: Send via WhatsApp Business API (or Twilio) — template message with lead details
- Format: "Hi [Vendor Name], new enquiry on Venuees.in: [Couple Name], [Phone], [Guests] guests, [Date]. Reply to this message to connect."

**To the couple (confirmation):**
- Email: "We've shared your details with [Venue Name]. Expect a call within 2 hours."

### 6.3 WhatsApp CTA on every page

Replace the current `Call venue` button on venue detail pages with:
```html
<a href="https://wa.me/917125550180?text=Hi, I'm interested in {venueName} for {date}" 
   class="btn btn-whatsapp">
  WhatsApp us
</a>
```

For vendor-owned listings, use the vendor's WhatsApp number pulled from `vendorsTable.whatsapp`.

### 6.4 Lead analytics dashboard for vendors

`app/dashboard/analytics/page.tsx`:
- Total enquiries this month vs last month
- Enquiries by day (simple bar chart)
- Conversion tracking: new → contacted → booked
- Top source pages

Simple enough to build with plain SQL aggregates — no third-party analytics needed.

---

## 7. PHASE 4 — "SEO content flywheel" (Ongoing)

**Goal: Rank for every high-intent wedding keyword in Nagpur and Vidarbha within 12 months.**

### 7.1 Target keyword clusters

| Cluster | Example keywords | Page type |
|---|---|---|
| Venue intent | "wedding venues nagpur", "banquet halls civil lines nagpur", "resort wedding wardha road" | Venues list, Locality pages |
| Capacity intent | "wedding venues for 500 guests nagpur", "small wedding halls nagpur" | Filtered venue list |
| Budget intent | "budget wedding venues nagpur", "affordable banquet halls nagpur" | Filtered + editorial |
| Vendor intent | "wedding photographers nagpur", "bridal makeup artists nagpur" | Vendor category pages |
| Content intent | "how much does a wedding cost in nagpur", "best venues for outdoor weddings nagpur" | Blog posts |
| Long-tail | "wedding halls near wardha road", "venues with rooms on site nagpur" | Locality pages + venue detail |

### 7.2 Content calendar (first 6 months)

**Month 1–2: Foundation content**
- "Complete guide to wedding venues in Nagpur 2026"
- "Wedding photography prices in Nagpur — what to expect"
- "Wardha Road vs Civil Lines: which area for your Nagpur wedding?"
- "Outdoor vs indoor wedding venues in Nagpur — pros and cons"

**Month 3–4: Data-driven content**
- "The real cost breakdown of a Nagpur wedding (from 312 events)"
- "Best wedding venues under ₹10L in Nagpur"
- "Signature Resorts vs Radisson Blu Nagpur — detailed comparison"
- "5 underrated wedding venues in Nagpur most planners miss"

**Month 5–6: Topical authority**
- "Wedding planning timeline for Nagpur — 12 months to the mandap"
- "Vidarbha wedding traditions — a guide for out-of-city families"
- One Real Wedding story per month (Venuees-managed events)

### 7.3 Internal linking strategy

- Every venue page → links to 3 similar venues ("You might also like")
- Every vendor page → links to real weddings where they featured
- Blog posts → link to relevant venue/vendor pages
- Category pages → link to featured individual listings
- Breadcrumb on every nested page (already partially done in venue detail)

### 7.4 Review acquisition

- After a booking closes (status → "booked"), automatically email couple: "Would you share a few words about {Venue}?"
- Collect reviews in a new `reviews` table: venue_id, rating, body, couple_name, event_date, is_published
- Show on venue detail page with JSON-LD `AggregateRating`
- Google Business Profile: register each major venue and link from the venue detail page

---

## 8. PHASE 5 — "Scale" (Months 4–12)

### 8.1 Multi-city expansion

`lib/data.ts` already has Pune and Mumbai as `active: false`.

Steps to expand:
1. Recruit 1 local sales person per city to sign up venues
2. They use the admin portal to add listings
3. Duplicate the SEO page structure (already city-parameterised)
4. City-specific blog posts

### 8.2 Saved listings + wishlist

`saved_listings` table already exists. Complete the save flow:
- `components/save-button.tsx` exists but needs API wiring to `POST /api/saved`
- Dashboard saved page: `app/dashboard/saved/page.tsx` already scaffolded
- Email "your saved venues are still available" drip

### 8.3 Comparison tool

`/compare?v=signature-resorts-nagpur,the-centre-point-grand,mahalaxmi-lawns`

Side-by-side: price, capacity, amenities, rating, photos. High SEO value ("compare wedding venues nagpur").

### 8.4 WhatsApp Business automation

- WhatsApp Business API (via Twilio or Gupshup)
- Automated message templates: lead notification to vendor, booking confirmation to couple
- Opt-in newsletter via WhatsApp

### 8.5 Destination wedding expansion

Currently 6 destinations (Udaipur, Goa, etc.) are static placeholders.

- Partner with 2–3 local planners in each destination city
- They list venues through the same admin portal
- Destination pages become lead generation for planning packages

---

## 9. METRICS — HOW WE MEASURE SUCCESS

| Metric | 1 month | 3 months | 6 months | 12 months |
|---|---|---|---|---|
| Organic sessions/month | 500 | 3,000 | 12,000 | 40,000 |
| Enquiries/month | 20 | 100 | 400 | 1,200 |
| Active paid listings | 3 | 12 | 30 | 80 |
| MRR (₹) | 6,000 | 48,000 | 1,20,000 | 4,00,000 |
| Cities live | 1 | 1 | 2 | 4 |
| Blog posts indexed | 0 | 8 | 20 | 50 |
| Google ranking positions (top 10) | 0 | 5 | 25 | 80 |

---

## 10. IMMEDIATE NEXT ACTIONS (this sprint)

Priority order — do these before anything else:

1. **`db:push` + `db:seed`** — run the migration and seed scripts against Supabase prod. Without this, every venue page would 404 in production. *(1 hour)*

2. **Switch venue + vendor pages from `lib/data.ts` to DB reads** — 6 files, same pattern each. *(half day)*

3. **Approve → create listing flow** — fix `actions.tsx` so approving an application actually creates the DB row. This is the core vendor onboarding blocker. *(half day)*

4. **Wire all enquiry forms** — add `onSubmit` to every form. This is what turns traffic into revenue. *(half day)*

5. **`app/sitemap.ts` + `app/robots.ts`** — 30 lines of code, instant SEO impact. *(30 minutes)*

6. **JSON-LD on venue detail pages** — copy-paste schema.org template, fill from DB fields. *(1 hour)*

7. **`ADMIN_EMAILS` env var set on Vercel** — without this, no one has admin access to the dashboard in production. *(5 minutes)*

8. **Resend integration for lead notifications** — add `RESEND_API_KEY`, call `resend.emails.send()` in `POST /api/enquiries` after successful insert. *(2 hours)*

9. **Locality index pages** — create `app/venues/nagpur/page.tsx` and `app/venues/nagpur/[locality]/page.tsx` for SEO. *(2 hours)*

10. **Razorpay subscription page** — basic checkout page in vendor dashboard. Revenue starts here. *(1 day)*

---

## 11. TECH DEBT / KNOWN ISSUES

| Issue | Risk | Fix |
|---|---|---|
| Photos stored as base64 in DB | Medium — will get slow at scale | Move to Supabase Storage, store URLs |
| `lib/data.ts` still imported in many pages | Low now, confusing later | Migrate all reads to DB, delete the file |
| No input validation on API routes | Medium — could get junk data | Add Zod schema validation to all POST routes |
| `db:seed` duplicates if run twice | Low | Add `ON CONFLICT DO NOTHING` to all inserts |
| No rate limiting on `/api/enquiries` | Medium — spam risk | Add IP-based rate limit (Upstash or Vercel Edge) |
| Venue detail calendar is mock data | High — misleading to users | Add `venue_availability` table + real data |
| No error boundaries on pages | Low | Add `error.tsx` per route group |
| Blog `[slug]/page.tsx` route missing | High — 404 on click | Create the blog detail page |
| Vendor email/WhatsApp field empty | High — can't notify without it | Make required in apply form, show in admin |

---

*This document is the single source of truth for what to build, in what order, and why. Update it as phases complete.*
