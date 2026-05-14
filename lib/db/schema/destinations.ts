import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const destinationsTable = pgTable("destinations", {
  id:        integer("id").primaryKey().generatedByDefaultAsIdentity(),
  slug:      text("slug").notNull().unique(),
  city:      text("city").notNull(),
  tag:       text("tag").notNull(),
  ph:        text("ph").notNull().default("v2"),
  venues:    integer("venues").notNull().default(0),
  priceFrom: text("price_from").notNull().default(""),
  feat:      boolean("feat").notNull().default(false),
  isActive:  boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Destination = typeof destinationsTable.$inferSelect;
export type InsertDestination = typeof destinationsTable.$inferInsert;
