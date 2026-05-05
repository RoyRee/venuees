-- Venuees.in — Supabase schema (prototype)
--
-- Paste this entire file into the Supabase SQL editor (Dashboard → SQL Editor
-- → New query → paste → Run) after creating your project. Safe to re-run
-- thanks to IF NOT EXISTS / IF EXISTS guards.

-- ---------------------------------------------------------------------------
-- 1. enquiries  — every form submission on the site lands here.
--    Venue detail "Request availability", homepage enquiry, contact page,
--    list-your-business application. Single table, discriminated by `kind`.
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  kind            text not null check (kind in (
                    'venue_enquiry',    -- "request availability" on venue page
                    'homepage_lead',    -- generic homepage form
                    'contact',          -- /contact page
                    'partner_apply',    -- /list-your-business apply form
                    'getaway_enquiry',
                    'vendor_enquiry'
                  )),
  -- Routing hints (all optional — populated based on `kind`)
  venue_slug      text,
  vendor_slug     text,
  getaway_slug    text,
  category        text,
  -- Contact fields
  name            text,
  phone           text,
  email           text,
  -- Event details
  event_date      text,         -- free text ("Dec 2026", "flexible")
  guest_count     text,         -- free text ("300", "150-500")
  message         text,
  -- Metadata
  source_url      text,
  user_agent      text,
  status          text not null default 'new'
                    check (status in ('new', 'contacted', 'booked', 'lost', 'spam'))
);

create index if not exists enquiries_created_at_idx   on public.enquiries (created_at desc);
create index if not exists enquiries_kind_idx         on public.enquiries (kind);
create index if not exists enquiries_venue_slug_idx   on public.enquiries (venue_slug) where venue_slug is not null;
create index if not exists enquiries_status_idx       on public.enquiries (status);

-- Row-Level Security: the anon role (used by the public website via the
-- NEXT_PUBLIC_SUPABASE_ANON_KEY) can INSERT but never SELECT/UPDATE/DELETE.
-- Only the service role (server-side admin operations, or the Supabase
-- Dashboard) can read rows back. This means the public can submit forms
-- but can't scrape other people's submissions.
alter table public.enquiries enable row level security;

drop policy if exists "anon can insert enquiries" on public.enquiries;
create policy "anon can insert enquiries"
  on public.enquiries for insert to anon
  with check (true);

-- (Optional) authenticated users (e.g. venue owners logging into an admin
-- dashboard later) can read their own venue's enquiries. Placeholder —
-- enable when auth is wired.
-- drop policy if exists "owners read own enquiries" on public.enquiries;
-- create policy "owners read own enquiries"
--   on public.enquiries for select to authenticated
--   using (venue_slug in (select slug from public.venue_owners where user_id = auth.uid()));


-- ---------------------------------------------------------------------------
-- 2. newsletter_signups — footer + journal "stay in the loop"
-- ---------------------------------------------------------------------------
create table if not exists public.newsletter_signups (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null unique,
  source      text     -- 'footer' | 'journal' | etc.
);

alter table public.newsletter_signups enable row level security;

drop policy if exists "anon can subscribe" on public.newsletter_signups;
create policy "anon can subscribe"
  on public.newsletter_signups for insert to anon
  with check (true);


-- ---------------------------------------------------------------------------
-- Done. Verify in Dashboard → Table Editor that both tables exist with RLS
-- enabled (green shield icon). Test with:
--   insert into public.enquiries (kind, name, phone)
--   values ('contact', 'Test', '+919999999999');
-- ---------------------------------------------------------------------------
