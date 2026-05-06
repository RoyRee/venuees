import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";

export const getawaysTable = pgTable("getaways", {
  id:               serial("id").primaryKey(),
  slug:             text("slug").notNull().unique(),
  name:             text("name").notNull(),
  location:         text("location").notNull(),
  hoursFromNagpur:  text("hours_from_nagpur").notNull(),
  beds:             integer("beds").notNull().default(0),
  guests:           integer("guests").notNull().default(0),
  weekday:          integer("weekday").notNull().default(0),
  weekend:          integer("weekend").notNull().default(0),
  rating:           numeric("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviews:          integer("reviews").notNull().default(0),
  ph:               text("ph").notNull().default("v2"),
  scene:            text("scene").notNull().default(""),
  tagline:          text("tagline").notNull().default(""),
  description:      text("description"),
  isActive:         boolean("is_active").notNull().default(true),
  createdAt:        timestamp("created_at").notNull().defaultNow(),
  updatedAt:        timestamp("updated_at").notNull().defaultNow(),
});

export const getawayImagesTable = pgTable("getaway_images", {
  id:        serial("id").primaryKey(),
  getawayId: integer("getaway_id").notNull().references(() => getawaysTable.id, { onDelete: "cascade" }),
  url:       text("url").notNull(),
  alt:       text("alt").notNull().default(""),
  isPrimary: boolean("is_primary").notNull().default(false),
  order:     integer("order").notNull().default(0),
});

export type Getaway      = typeof getawaysTable.$inferSelect;
export type GetawayImage = typeof getawayImagesTable.$inferSelect;
export type InsertGetaway = typeof getawaysTable.$inferInsert;
