import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Initialization is intentionally lazy — deferred until the first db method call.
// This prevents Next.js from throwing during build when DATABASE_URL is not set
// at build time (it's only available at runtime/request time on Vercel).
//
// Get DATABASE_URL from: Supabase → Project Settings → Database →
// Connection string → Transaction pooler URI (port 6543).

type DrizzleClient = ReturnType<typeof drizzle<typeof schema>>;

let _client: DrizzleClient | undefined;

function getClient(): DrizzleClient {
  if (_client) return _client;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Go to Supabase → Project Settings → Database → Connection string and add it to your .env.local file."
    );
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  // Prevent unhandled 'error' events from crashing the serverless function.
  // pg.Pool emits 'error' when a background connection dies; without a listener
  // Node throws an uncaught exception that bypasses all try/catch.
  pool.on("error", () => {});
  _client = drizzle(pool, { schema });
  return _client;
}

// Proxy so routes keep the same `db.select()` / `db.insert()` API.
// `getClient()` is only called when a handler actually runs — never at build time.
export const db: DrizzleClient = new Proxy({} as DrizzleClient, {
  get(_, prop: string | symbol) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export * from "./schema";
