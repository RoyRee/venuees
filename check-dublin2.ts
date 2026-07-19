import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./lib/db";
import { venuesTable } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const venues = await db.select().from(venuesTable).where(eq(venuesTable.id, 13));
  console.log("Dublin Venue:", JSON.stringify(venues[0], null, 2));
}

main().catch(console.error);
