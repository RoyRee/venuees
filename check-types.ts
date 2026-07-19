import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "./lib/db";
import { venuesTable } from "./lib/db/schema";

async function main() {
  const venues = await db.select().from(venuesTable).limit(5);
  console.log("Venues typeSlugs:", venues.map(v => ({ name: v.name, type: v.type, typeSlug: v.typeSlug })));
}

main().catch(console.error);
