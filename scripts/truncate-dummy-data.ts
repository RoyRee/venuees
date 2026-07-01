#!/usr/bin/env npx tsx
/**
 * truncate-dummy-data.ts
 * ─────────────────────
 * Safely removes all seeded dummy/demo data from the database so you can
 * enter real listings via the admin listing page.
 *
 * WHAT IS DELETED:
 *   • venues + venue_halls + venue_images  (all dummy listings)
 *   • vendors + vendor_images              (all dummy vendor profiles)
 *   • getaways + getaway_images            (all demo getaway properties)
 *   • destinations                         (demo destination cards)
 *   • real_weddings + real_wedding_images  (demo wedding stories)
 *   • saved_listings                       (orphaned saves will 404)
 *
 * WHAT IS PRESERVED:
 *   • profiles      — real user accounts
 *   • enquiries     — real enquiry submissions
 *   • listing_applications — real vendor / venue applications
 *   • site_config   — your feature flags and content settings
 *
 * USAGE:
 *   Dry run (safe preview):  npx tsx scripts/truncate-dummy-data.ts
 *   Actually delete:         npx tsx scripts/truncate-dummy-data.ts --confirm
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

// ── Colour helpers ────────────────────────────────────────────────────────────
const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  red:    "\x1b[31m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  dim:    "\x1b[2m",
};
const bold   = (s: string) => `${c.bold}${s}${c.reset}`;
const red    = (s: string) => `${c.red}${s}${c.reset}`;
const green  = (s: string) => `${c.green}${s}${c.reset}`;
const yellow = (s: string) => `${c.yellow}${s}${c.reset}`;
const cyan   = (s: string) => `${c.cyan}${s}${c.reset}`;
const dim    = (s: string) => `${c.dim}${s}${c.reset}`;

// ── Tables configuration ──────────────────────────────────────────────────────

// Deleted in order (children before parents, respecting FK constraints)
const DUMMY_TABLES = [
  // Images / child tables first
  "venue_images",
  "venue_halls",
  "vendor_images",
  "getaway_images",
  "real_wedding_images",
  // Parent tables
  "venues",
  "vendors",
  "getaways",
  "destinations",
  "real_weddings",
  // Dependent on venue slugs (will 404 anyway once venues are gone)
  "saved_listings",
];

// These are NEVER touched
const PRESERVED_TABLES = [
  "profiles",
  "enquiries",
  "listing_applications",
  "site_config",
];

// ── Main ──────────────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  console.error(red("❌  DATABASE_URL not set in .env.local"));
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool);

const isDryRun = !process.argv.includes("--confirm");

async function getRowCount(table: string): Promise<number | null> {
  try {
    const result = await db.execute(sql.raw(`SELECT COUNT(*) FROM "${table}"`));
    return Number((result.rows[0] as { count: string }).count);
  } catch {
    return null; // table doesn't exist
  }
}

async function main() {
  console.log("\n" + bold("════════════════════════════════════════════════════"));
  console.log(bold("  Venuees.in — Dummy Data Truncation Script"));
  console.log(bold("════════════════════════════════════════════════════"));

  if (isDryRun) {
    console.log("\n" + yellow("⚠️  DRY RUN MODE — nothing will be deleted."));
    console.log(dim("   Run with --confirm to actually delete rows.\n"));
  } else {
    console.log("\n" + red("🚨  LIVE MODE — rows WILL be permanently deleted!\n"));
  }

  // ── Step 1: Show what will be deleted ─────────────────────────────────────
  console.log(bold("📋  Tables to CLEAR (dummy / demo data):"));
  console.log(dim("    ─────────────────────────────────────────────────────"));

  let totalToDelete = 0;
  const counts: Record<string, number | null> = {};

  for (const table of DUMMY_TABLES) {
    const count = await getRowCount(table);
    counts[table] = count;
    if (count === null) {
      console.log(`    ${dim("❔ SKIP (not found)")}        ${table}`);
    } else {
      const badge = count === 0 ? dim("  ⚪ EMPTY") : yellow(`  🗑️  ${String(count).padEnd(4)} rows`);
      console.log(`    ${badge}        ${table}`);
      totalToDelete += count;
    }
  }

  console.log("\n" + bold("🔒  Tables to PRESERVE (real data — untouched):"));
  console.log(dim("    ─────────────────────────────────────────────────────"));

  for (const table of PRESERVED_TABLES) {
    const count = await getRowCount(table);
    const badge = count === null ? dim("❔ not found") : green(`✅  ${count} rows`);
    console.log(`    ${badge}        ${table}`);
  }

  console.log(`\n    Total rows to delete: ${bold(yellow(String(totalToDelete)))}`);

  // ── Step 2: Actually delete ────────────────────────────────────────────────
  if (isDryRun) {
    console.log("\n" + yellow("📌  To run the actual deletion, execute:"));
    console.log(cyan("    npx tsx scripts/truncate-dummy-data.ts --confirm\n"));
    await pool.end();
    return;
  }

  console.log("\n" + bold("🗑️  Deleting dummy data…\n"));

  let deletedTotal = 0;
  for (const table of DUMMY_TABLES) {
    if (counts[table] === null) {
      console.log(`    ${dim("SKIP")}  ${table} (table does not exist)`);
      continue;
    }
    try {
      await db.execute(sql.raw(`DELETE FROM "${table}"`));
      const after = await getRowCount(table);
      console.log(`    ${green("✓")}  ${table} — cleared (${counts[table]} → ${after} rows)`);
      deletedTotal += counts[table] ?? 0;
    } catch (err: any) {
      console.error(`    ${red("✗")}  ${table} — ${err.message}`);
    }
  }

  // ── Step 3: Verify preserved tables ───────────────────────────────────────
  console.log("\n" + bold("🔒  Verifying preserved tables…\n"));
  for (const table of PRESERVED_TABLES) {
    const count = await getRowCount(table);
    if (count === null) {
      console.log(`    ${dim("❔")}  ${table} (not found — OK if never created)`);
    } else {
      console.log(`    ${green("✓")}  ${table} — ${count} rows preserved`);
    }
  }

  // ── Step 4: Summary ────────────────────────────────────────────────────────
  console.log("\n" + bold("════════════════════════════════════════════════════"));
  console.log(green(`✅  Done! ${deletedTotal} dummy rows removed.`));
  console.log(bold("════════════════════════════════════════════════════"));
  console.log(`
${bold("Next steps:")}
  1. Restart the dev server:     ${cyan("npm run dev")}
  2. Open the listing page:      ${cyan("http://localhost:3000/list-your-business")}
  3. Add your first real venue.
  4. Verify the homepage at:     ${cyan("http://localhost:3000")}
     → Sections with 0 items will be hidden automatically.

${dim("Tip: saved_listings were also cleared since they referenced dummy slugs.")}
`);

  await pool.end();
}

main().catch((err) => {
  console.error(red("\n❌  Script failed:"), err.message);
  pool.end();
  process.exit(1);
});
