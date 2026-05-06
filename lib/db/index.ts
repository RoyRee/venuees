import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Supabase exposes a direct PostgreSQL connection string in the dashboard:
// Project Settings → Database → Connection string → URI (Transaction pooler for serverless)
// Set this as DATABASE_URL in your environment.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Go to Supabase → Project Settings → Database → Connection string and add it to your .env.local file."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL in production
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

export * from "./schema";
