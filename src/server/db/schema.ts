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

// ==================== Reference/Lookup Tables ====================

// School - MLH verified schools list
export const school = pgTable("school", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  country: text("country").notNull(),
  isVerified: boolean("is_verified")
    .$defaultFn(() => true)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Country - ISO 3166 standard country codes
export const country = pgTable("country", {
  code: text("code").primaryKey(), // ISO 3166 code (e.g., "US")
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Race/Ethnicity - Lookup table for demographic options
export const raceEthnicity = pgTable("race_ethnicity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

// Dietary Restriction - Lookup table for dietary options
export const dietaryRestriction = pgTable("dietary_restriction", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

// ==================== Event-Specific Registration Data ====================

// Event Registration Education - Educational information for a specific event
export const eventRegistrationEducation = pgTable("event_registration_education", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventRegistrationId: text("event_registration_id")
    .notNull()
    .unique()
    .references(() => eventRegistration.id, { onDelete: "cascade" }),
  schoolId: text("school_id")
    .notNull()
    .references(() => school.id),
  levelOfStudy: text("level_of_study").notNull(),
  major: text("major"),
  graduationYear: integer("graduation_year"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Event Registration Demographics - Optional demographic information for a specific event
export const eventRegistrationDemographics = pgTable("event_registration_demographics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventRegistrationId: text("event_registration_id")
    .notNull()
    .unique()
    .references(() => eventRegistration.id, { onDelete: "cascade" }),
  countryOfResidence: text("country_of_residence").references(() => country.code),
  isUnderrepresented: text("is_underrepresented"), // "yes", "no", "unsure", "prefer_not_to_answer"
  gender: text("gender"),
  genderSelfDescribe: text("gender_self_describe"),
  pronouns: text("pronouns"),
  pronounsOther: text("pronouns_other"),
  sexualOrientation: text("sexual_orientation"),
  sexualOrientationOther: text("sexual_orientation_other"),
  highestEducation: text("highest_education"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

// Event Registration Race/Ethnicity - Many-to-many junction table
export const eventRegistrationRaceEthnicity = pgTable("event_registration_race_ethnicity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventRegistrationId: text("event_registration_id")
    .notNull()
    .references(() => eventRegistration.id, { onDelete: "cascade" }),
  raceEthnicityId: text("race_ethnicity_id")
    .notNull()
    .references(() => raceEthnicity.id),
  otherDescription: text("other_description"), // For "other" selection
});

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
  ({ one, many }) => ({
    event: one(event, {
      fields: [eventRegistration.eventId],
      references: [event.id],
    }),
    hackerProfile: one(hackerProfile, {
      fields: [eventRegistration.hackerProfileId],
      references: [hackerProfile.id],
    }),
    education: one(eventRegistrationEducation, {
      fields: [eventRegistration.id],
      references: [eventRegistrationEducation.eventRegistrationId],
    }),
    demographics: one(eventRegistrationDemographics, {
      fields: [eventRegistration.id],
      references: [eventRegistrationDemographics.eventRegistrationId],
    }),
    raceEthnicities: many(eventRegistrationRaceEthnicity),
  }),
);

export const eventRegistrationEducationRelations = relations(
  eventRegistrationEducation,
  ({ one }) => ({
    eventRegistration: one(eventRegistration, {
      fields: [eventRegistrationEducation.eventRegistrationId],
      references: [eventRegistration.id],
    }),
    school: one(school, {
      fields: [eventRegistrationEducation.schoolId],
      references: [school.id],
    }),
  }),
);

export const eventRegistrationDemographicsRelations = relations(
  eventRegistrationDemographics,
  ({ one }) => ({
    eventRegistration: one(eventRegistration, {
      fields: [eventRegistrationDemographics.eventRegistrationId],
      references: [eventRegistration.id],
    }),
    country: one(country, {
      fields: [eventRegistrationDemographics.countryOfResidence],
      references: [country.code],
    }),
  }),
);

export const eventRegistrationRaceEthnicityRelations = relations(
  eventRegistrationRaceEthnicity,
  ({ one }) => ({
    eventRegistration: one(eventRegistration, {
      fields: [eventRegistrationRaceEthnicity.eventRegistrationId],
      references: [eventRegistration.id],
    }),
    raceEthnicity: one(raceEthnicity, {
      fields: [eventRegistrationRaceEthnicity.raceEthnicityId],
      references: [raceEthnicity.id],
    }),
  }),
);
