# Deploying Venuees.in

Prototype stack:

- **Hosting**: Vercel (free Hobby tier, `*.vercel.app` URL)
- **Database + Auth + Storage**: Supabase (free tier, 500 MB Postgres)
- **Photos**: local `/public/images/` (owner drop-in)
- **Email**: not wired yet (add Resend later)

Follow the steps in order the first time. After that, every `git push` deploys automatically.

---

## 1. Push the code to GitHub

```bash
# from E:\Claude\venuees.in
git init
git add .
git commit -m "Initial prototype"
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/venuees-in.git
git branch -M main
git push -u origin main
```

---

## 2. Create the Supabase project

1. Go to <https://supabase.com> → **Sign in with GitHub** → **New project**.
2. Organization: your personal org. Name: `venuees-in`. Region: **South Asia (Mumbai / ap-south-1)** — closest to Nagpur.
3. Database password: generate + save to a password manager (you won't need it often, but don't lose it).
4. Wait ~2 minutes for provisioning.
5. **SQL Editor** (left sidebar) → **New query** → paste the entire contents of `supabase/schema.sql` → **Run**. You should see `Success. No rows returned`.
6. **Settings → API**. Copy these three values:
   - `Project URL`          → goes into `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key      → goes into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret`  → goes into `SUPABASE_SERVICE_ROLE_KEY`

(You can also skip this step for now — the site will deploy and forms will accept submissions that are only logged to Vercel's server logs. Wire Supabase when you're ready.)

---

## 3. Deploy to Vercel

1. Go to <https://vercel.com> → **Sign in with GitHub** → **Add New → Project**.
2. Import the `venuees-in` repo you just pushed.
3. Vercel auto-detects Next.js — keep all defaults.
4. Expand **Environment Variables** and paste the three Supabase values from step 2.6.
5. Click **Deploy**. ~2 minutes later you'll have a live URL like `https://venuees-in.vercel.app`.

From now on, every commit to `main` auto-deploys. Every branch / pull request gets its own preview URL.

---

## 4. Test it

```bash
curl -X POST https://<your-vercel-url>/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"kind":"contact","name":"Test User","phone":"+919999999999","message":"Hello"}'
```

Expected: `{"ok":true,"id":"<uuid>"}`. Then check **Supabase Dashboard → Table Editor → enquiries** — your row should be there.

---

## 5. Local dev

```bash
cp .env.example .env.local
# paste your Supabase values into .env.local
npm install
npm run dev
```

Open <http://localhost:3000>.

---

## Switching providers later

Everything is standard — nothing is locked to Vercel or Supabase.

- **Hosting**: `next build` + `next start` runs anywhere — Render, Fly, Railway, Docker, your own VPS.
- **Database**: Supabase is plain Postgres. `pg_dump` and restore to Neon / RDS / DigitalOcean / self-hosted.
- **Auth**: if you add Supabase Auth later, migrating to Auth.js (NextAuth) or Clerk is mostly a client-code swap — the user table moves with `pg_dump`.

---

## Cost ceiling

The free tiers comfortably cover:

- Vercel Hobby: 100 GB bandwidth/mo
- Supabase Free: 500 MB Postgres, 1 GB file storage, 50k monthly active users, auto-pause after 1 week of inactivity (auto-resumes on first request)

Once real traffic shows up, Vercel Pro ($20/mo) + Supabase Pro ($25/mo) covers a comfortable growth stage.
