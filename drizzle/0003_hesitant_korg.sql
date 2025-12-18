CREATE TABLE "event_registration_dietary_restrictions" (
	"id" text PRIMARY KEY NOT NULL,
	"event_registration_id" text NOT NULL,
	"dietary_restriction_id" text NOT NULL,
	"allergy_details" text
);
--> statement-breakpoint
CREATE TABLE "event_registration_mlh_agreement" (
	"id" text PRIMARY KEY NOT NULL,
	"event_registration_id" text NOT NULL,
	"agreed_to_code_of_conduct" boolean NOT NULL,
	"agreed_to_mlh_sharing" boolean NOT NULL,
	"agreed_to_mlh_emails" boolean NOT NULL,
	"agreed_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "event_registration_mlh_agreement_event_registration_id_unique" UNIQUE("event_registration_id")
);
--> statement-breakpoint
CREATE TABLE "event_registration_shipping" (
	"id" text PRIMARY KEY NOT NULL,
	"event_registration_id" text NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"country" text NOT NULL,
	"postal_code" text NOT NULL,
	"tshirt_size" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "event_registration_shipping_event_registration_id_unique" UNIQUE("event_registration_id")
);
--> statement-breakpoint
ALTER TABLE "event_registration_dietary_restrictions" ADD CONSTRAINT "event_registration_dietary_restrictions_event_registration_id_event_registration_id_fk" FOREIGN KEY ("event_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_dietary_restrictions" ADD CONSTRAINT "event_registration_dietary_restrictions_dietary_restriction_id_dietary_restriction_id_fk" FOREIGN KEY ("dietary_restriction_id") REFERENCES "public"."dietary_restriction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_mlh_agreement" ADD CONSTRAINT "event_registration_mlh_agreement_event_registration_id_event_registration_id_fk" FOREIGN KEY ("event_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_shipping" ADD CONSTRAINT "event_registration_shipping_event_registration_id_event_registration_id_fk" FOREIGN KEY ("event_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration_shipping" ADD CONSTRAINT "event_registration_shipping_country_country_code_fk" FOREIGN KEY ("country") REFERENCES "public"."country"("code") ON DELETE no action ON UPDATE no action;