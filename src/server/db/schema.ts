import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ==================== Better-Auth Tables ====================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ==================== PickHacks Registration Tables ====================

// Event table - tracks different PickHacks events (2025, 2026, etc.)
export const event = pgTable("event", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  year: integer("year").notNull().unique(),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }).notNull(),
  isActive: boolean("is_active")
    .$defaultFn(() => true)
    .notNull(),
  registrationOpensAt: timestamp("registration_opens_at", {
    withTimezone: true,
  }),
  registrationClosesAt: timestamp("registration_closes_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Hacker Profile - persistent user information across events
export const hackerProfile = pgTable("hacker_profile", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  linkedinUrl: text("linkedin_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Event Registration - links hacker to specific event with event-specific data
export const eventRegistration = pgTable(
  "event_registration",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    hackerProfileId: text("hacker_profile_id")
      .notNull()
      .references(() => hackerProfile.id, { onDelete: "cascade" }),
    ageAtEvent: integer("age_at_event").notNull(),
    qrCode: text("qr_code")
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),
    isComplete: boolean("is_complete")
      .$defaultFn(() => false)
      .notNull(),
    lockedAt: timestamp("locked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    // Unique constraint: can only register once per event
    unique("event_hacker_unique").on(t.eventId, t.hackerProfileId),
  ],
);

// ==================== Relations ====================

export const userRelations = relations(user, ({ many, one }) => ({
  account: many(account),
  session: many(session),
  hackerProfile: one(hackerProfile, {
    fields: [user.id],
    references: [hackerProfile.userId],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const eventRelations = relations(event, ({ many }) => ({
  registrations: many(eventRegistration),
}));

export const hackerProfileRelations = relations(
  hackerProfile,
  ({ one, many }) => ({
    user: one(user, {
      fields: [hackerProfile.userId],
      references: [user.id],
    }),
    registrations: many(eventRegistration),
  }),
);

export const eventRegistrationRelations = relations(
  eventRegistration,
  ({ one }) => ({
    event: one(event, {
      fields: [eventRegistration.eventId],
      references: [event.id],
    }),
    hackerProfile: one(hackerProfile, {
      fields: [eventRegistration.hackerProfileId],
      references: [hackerProfile.id],
    }),
  }),
);
