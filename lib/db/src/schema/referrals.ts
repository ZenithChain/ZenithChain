import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  index,
} from "drizzle-orm/pg-core";

export const referralsTable = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    inviter: text("inviter").notNull(),
    invitee: text("invitee").notNull().unique(),
    inviteeIp: text("invitee_ip"),
    zpAwardedToInviter: integer("zp_awarded_to_inviter").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("referrals_inviter_idx").on(t.inviter)],
);

export type ReferralRow = typeof referralsTable.$inferSelect;
