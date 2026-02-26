CREATE TABLE "check_in" (
	"id" text PRIMARY KEY NOT NULL,
	"event_registration_id" text NOT NULL,
	"event_station_id" text NOT NULL,
	"checked_in_at" timestamp with time zone NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "event_station" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"station_type" text NOT NULL,
	"max_visits_per_hacker" integer,
	"is_active" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "event_station_unique" UNIQUE("event_id","name")
);
--> statement-breakpoint
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_event_registration_id_event_registration_id_fk" FOREIGN KEY ("event_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_event_station_id_event_station_id_fk" FOREIGN KEY ("event_station_id") REFERENCES "public"."event_station"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_station" ADD CONSTRAINT "event_station_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;