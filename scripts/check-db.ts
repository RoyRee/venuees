#!/usr/bin/env npx tsx
/**
 * Check row counts across all tables in the database.
 * Run: npx tsx scripts/check-db.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL not set in .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool);

const TABLES = [
  "venues",
  "venue_halls",
  "venue_images",
  "vendors",
  "vendor_images",
  "getaways",
  "getaway_images",
  "destinations",
  "real_weddings",
  "real_wedding_images",
  "profiles",
  "saved_listings",
  "enquiries",
  "newsletter",
  "listing_applications",
  "site_config",
];

async function main() {
  console.log("\n🔍  Checking database tables…\n");

  let totalRows = 0;
  let missingTables: string[] = [];

  for (const table of TABLES) {
    try {
      const result = await db.execute(sql.raw(`SELECT COUNT(*) FROM "${table}"`));
      const count = Number((result.rows[0] as { count: string }).count);
      totalRows += count;
      const status = count === 0 ? "⚠️  EMPTY" : `✅  ${count} rows`;
      console.log(`  ${status.padEnd(18)} ${table}`);
    } catch {
      missingTables.push(table);
      console.log(`  ❌  MISSING         ${table}`);
    }
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`  Total rows across all tables: ${totalRows}`);

  if (missingTables.length > 0) {
    console.log(`\n⚠️  Missing tables: ${missingTables.join(", ")}`);
    console.log("   Run: npm run db:push   to create them\n");
  }

  if (totalRows === 0) {
    console.log("\n💀  Database is EMPTY — this is why the site shows no data.");
    console.log("   Run: npm run db:seed   to populate all venues/vendors/getaways\n");
  } else if (totalRows < 20) {
    console.log("\n⚠️  Very few rows — data may be partially truncated.");
    console.log("   Run: npm run db:seed   to re-populate\n");
  } else {
    console.log("\n✅  Database looks healthy.\n");
  }

  await pool.end();
}

main().catch((err) => {
  console.error("\n❌  Connection failed:", err.message);
  console.error("   Check your DATABASE_URL in .env.local\n");
  process.exit(1);
});
