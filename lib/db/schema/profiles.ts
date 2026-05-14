import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const profilesTable = pgTable("profiles", {
  userId:    text("user_id").primaryKey(),
  role:      text("role").notNull().default("customer"),
  phone:     text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const savedListingsTable = pgTable("saved_listings", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull(),
  type:      text("type").notNull(),
  slug:      text("slug").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Profile       = typeof profilesTable.$inferSelect;
export type InsertProfile = typeof profilesTable.$inferInsert;
export type SavedListing  = typeof savedListingsTable.$inferSelect;
