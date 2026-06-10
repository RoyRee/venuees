import { pgTable, serial, text, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const citiesTable = pgTable("cities", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull(),
  slug:      text("slug").notNull().unique(),
  lat:       doublePrecision("lat").notNull(),
  lng:       doublePrecision("lng").notNull(),
  isActive:  boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
