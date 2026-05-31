import { pgTable, text, integer, numeric, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export const venuesTable = pgTable("venues", {
  id:             integer("id").primaryKey().generatedByDefaultAsIdentity(),
  slug:           text("slug").notNull().unique(),
  name:           text("name").notNull(),
  citySlug:       text("city_slug").notNull().default("nagpur"),
  locality:       text("locality").notNull(),
  address:        text("address").notNull(),
  type:           text("type").notNull(),
  typeSlug:       text("type_slug").notNull(),
  capacityMin:    integer("capacity_min").notNull().default(0),
  capacityMax:    integer("capacity_max").notNull().default(0),
  vegPlate:       integer("veg_plate").notNull().default(0),
  nvPlate:        integer("nv_plate").notNull().default(0),
  hallRent:       integer("hall_rent").notNull().default(0),
  minGuarantee:   integer("min_guarantee").notNull().default(0),
  rating:         numeric("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  reviews:        integer("reviews").notNull().default(0),
  bookingsMonth:  integer("bookings_month").notNull().default(0),
  tag:            text("tag").notNull().default(""),
  description:    text("description").notNull().default(""),
  ph:             text("ph").notNull().default("v2"),
  scene:          text("scene").notNull().default(""),
  amenities:      jsonb("amenities").$type<string[]>().notNull().default([]),
  isSignature:    boolean("is_signature").notNull().default(false),
  parking:        integer("parking").notNull().default(0),
  rooms:          integer("rooms"),
  ownerUserId:    text("owner_user_id"),
  contactName:    text("contact_name"),
  contactPhone:   text("contact_phone"),
  contactEmail:   text("contact_email"),
  whatsapp:       text("whatsapp"),
  isActive:       boolean("is_active").notNull().default(true),
  meta:           jsonb("meta").$type<Record<string, unknown>>(),
  createdAt:      timestamp("created_at").notNull().defaultNow(),
  updatedAt:      timestamp("updated_at").notNull().defaultNow(),
});

export const venueHallsTable = pgTable("venue_halls", {
  id:       integer("id").primaryKey().generatedByDefaultAsIdentity(),
  venueId:  integer("venue_id").notNull().references(() => venuesTable.id, { onDelete: "cascade" }),
  name:     text("name").notNull(),
  ph:       text("ph").notNull().default("v2"),
  type:     text("type").notNull(),
  area:     text("area").notNull(),
  theatre:  integer("theatre").notNull().default(0),
  floating: integer("floating").notNull().default(0),
  dining:   integer("dining").notNull().default(0),
  order:    integer("order").notNull().default(0),
});

export const venueImagesTable = pgTable("venue_images", {
  id:        integer("id").primaryKey().generatedByDefaultAsIdentity(),
  venueId:   integer("venue_id").notNull().references(() => venuesTable.id, { onDelete: "cascade" }),
  url:       text("url").notNull(),
  alt:       text("alt").notNull().default(""),
  isPrimary: boolean("is_primary").notNull().default(false),
  order:     integer("order").notNull().default(0),
});

export type Venue     = typeof venuesTable.$inferSelect;
export type VenueHall = typeof venueHallsTable.$inferSelect;
export type VenueImage = typeof venueImagesTable.$inferSelect;
export type InsertVenue = typeof venuesTable.$inferInsert;
