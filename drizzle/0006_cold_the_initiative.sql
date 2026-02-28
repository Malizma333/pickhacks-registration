CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"name" text NOT NULL,
	"project_name" text,
	"captain_registration_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_invite" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"registration_id" text NOT NULL,
	"invited_by_registration_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "team_invite_unique" UNIQUE("team_id","registration_id")
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"registration_id" text NOT NULL,
	"joined_at" timestamp with time zone NOT NULL,
	CONSTRAINT "team_member_registration_unique" UNIQUE("registration_id")
);
--> statement-breakpoint
CREATE TABLE "team_track" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"track" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "team_track_unique" UNIQUE("team_id","track")
);
--> statement-breakpoint
ALTER TABLE "event_registration" ADD COLUMN "resume_url" text;--> statement-breakpoint
ALTER TABLE "event_registration" ADD COLUMN "resume_file_name" text;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_captain_registration_id_event_registration_id_fk" FOREIGN KEY ("captain_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invite" ADD CONSTRAINT "team_invite_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invite" ADD CONSTRAINT "team_invite_registration_id_event_registration_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invite" ADD CONSTRAINT "team_invite_invited_by_registration_id_event_registration_id_fk" FOREIGN KEY ("invited_by_registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_registration_id_event_registration_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."event_registration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_track" ADD CONSTRAINT "team_track_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school" DROP COLUMN "country";