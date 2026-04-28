import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";

export const missionsTable = pgTable("missions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(),
  type: text("type").notNull(), // basic | advanced | social
  actionLabel: text("action_label"),
  actionUrl: text("action_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type MissionRow = typeof missionsTable.$inferSelect;
export type InsertMissionRow = typeof missionsTable.$inferInsert;
