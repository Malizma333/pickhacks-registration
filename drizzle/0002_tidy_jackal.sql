CREATE TABLE "event_registration_demographics" (
	"id" text PRIMARY KEY NOT NULL,
	"event_registration_id" text NOT NULL,
	"country_of_residence" text,
	"is_underrepresented" text,
	"gender" text,
	"gender_self_describe" text,
	"pronouns" text,
	"pronouns_other" text,
	"sexual_orientation" text,
	"sexual_orientation_other" text,
	"highest_education" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "event_registration_demographics_event_registration_id_unique" UNIQUE("event_registration_id")
);
--> statement-breakpoint
CREATE TABLE "event_registration_education" (
	"id" text PRIMARY KEY NOT NULL,
	"event_registration_id" text NOT NULL,
	"school_id" text NOT NULL,
	"level_of_study" text NOT NULL,
	"major" text,
	"graduation_year" integer,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "event_registration_education_event_registration_id_unique" UNIQUE("event_registration_id")
);
--> statement-breakpoint
CREATE TABLE "event_registration_race_ethnicity" (
	"id" text PRIMARY KEY NOT NULL,
	"event_registration_id" text NOT NULL,
	"race_ethnicity_id" text NOT NULL,
	"other_description" text
);
--> statement-breakpoint
ALTER TABLE "event_registration_demographics" ADD CONSTRAINT "event_registration_demographics_event_registration_id_event_registration_id_fk" FOREIGN KEY ("event_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_demographics" ADD CONSTRAINT "event_registration_demographics_country_of_residence_country_code_fk" FOREIGN KEY ("country_of_residence") REFERENCES "public"."country"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_education" ADD CONSTRAINT "event_registration_education_event_registration_id_event_registration_id_fk" FOREIGN KEY ("event_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_education" ADD CONSTRAINT "event_registration_education_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_race_ethnicity" ADD CONSTRAINT "event_registration_race_ethnicity_event_registration_id_event_registration_id_fk" FOREIGN KEY ("event_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_race_ethnicity" ADD CONSTRAINT "event_registration_race_ethnicity_race_ethnicity_id_race_ethnicity_id_fk" FOREIGN KEY ("race_ethnicity_id") REFERENCES "public"."race_ethnicity"("id") ON DELETE no action ON UPDATE no action;