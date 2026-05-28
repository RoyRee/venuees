import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const siteConfigTable = pgTable("site_config", {
  key:       text("key").primaryKey(),
  value:     text("value").notNull().default("true"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedBy: text("updated_by"),
});
