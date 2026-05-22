import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_shifts_date" AS ENUM('friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_shifts_role" AS ENUM('setup', 'merch', 'green-room', 'wristband', 'videographer', 'donation', 'crowd-counter', 'floater', 'ice-cream', 'kids-craft');
  CREATE TYPE "public"."enum_volunteer_assignments_status" AS ENUM('assigned', 'confirmed', 'cancelled', 'no-show', 'completed');
  CREATE TYPE "public"."enum_volunteers_positions" AS ENUM('no_preference', 'setup', 'merch', 'green_room', 'wristband', 'videographer', 'donation', 'crowd_counter', 'floater', 'ice_cream', 'kids_craft');
  CREATE TYPE "public"."enum_volunteers_shirt_size" AS ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');
  CREATE TYPE "public"."enum_volunteers_assigned_shift" AS ENUM('fri_setup', 'fri_evening', 'sat_afternoon', 'sat_evening', 'sun_afternoon', 'sun_evening');
  CREATE TYPE "public"."enum_volunteers_assigned_position" AS ENUM('setup', 'merch', 'green_room', 'wristband', 'videographer', 'donation', 'crowd_counter', 'floater', 'ice_cream', 'kids_craft');
  ALTER TYPE "public"."enum_users_role" ADD VALUE 'customer';
  CREATE TABLE "shifts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"festival_year" numeric DEFAULT 2026 NOT NULL,
  	"date" "enum_shifts_date" NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"role" "enum_shifts_role" NOT NULL,
  	"location" varchar,
  	"max_volunteers" numeric DEFAULT 2,
  	"notes" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "volunteer_assignments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"volunteer_id" integer NOT NULL,
  	"shift_id" integer NOT NULL,
  	"status" "enum_volunteer_assignments_status" DEFAULT 'assigned' NOT NULL,
  	"confirmed_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"notification_sent" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "volunteers_positions" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_volunteers_positions",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "volunteers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"emergency_contact" varchar,
  	"experience" varchar,
  	"accommodations" varchar,
  	"shirt_size" "enum_volunteers_shirt_size",
  	"heard_from" varchar,
  	"additional_notes" varchar,
  	"assigned_shift" "enum_volunteers_assigned_shift",
  	"assigned_position" "enum_volunteers_assigned_position",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "shifts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "volunteer_assignments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "volunteers_id" integer;
  ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_volunteer_id_users_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "volunteer_assignments" ADD CONSTRAINT "volunteer_assignments_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "volunteers_positions" ADD CONSTRAINT "volunteers_positions_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "shifts_updated_at_idx" ON "shifts" USING btree ("updated_at");
  CREATE INDEX "shifts_created_at_idx" ON "shifts" USING btree ("created_at");
  CREATE INDEX "volunteer_assignments_volunteer_idx" ON "volunteer_assignments" USING btree ("volunteer_id");
  CREATE INDEX "volunteer_assignments_shift_idx" ON "volunteer_assignments" USING btree ("shift_id");
  CREATE INDEX "volunteer_assignments_updated_at_idx" ON "volunteer_assignments" USING btree ("updated_at");
  CREATE INDEX "volunteer_assignments_created_at_idx" ON "volunteer_assignments" USING btree ("created_at");
  CREATE INDEX "volunteers_positions_order_idx" ON "volunteers_positions" USING btree ("order");
  CREATE INDEX "volunteers_positions_parent_idx" ON "volunteers_positions" USING btree ("parent_id");
  CREATE INDEX "volunteers_updated_at_idx" ON "volunteers" USING btree ("updated_at");
  CREATE INDEX "volunteers_created_at_idx" ON "volunteers" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shifts_fk" FOREIGN KEY ("shifts_id") REFERENCES "public"."shifts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteer_assignments_fk" FOREIGN KEY ("volunteer_assignments_id") REFERENCES "public"."volunteer_assignments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_volunteers_fk" FOREIGN KEY ("volunteers_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_shifts_id_idx" ON "payload_locked_documents_rels" USING btree ("shifts_id");
  CREATE INDEX "payload_locked_documents_rels_volunteer_assignments_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteer_assignments_id");
  CREATE INDEX "payload_locked_documents_rels_volunteers_id_idx" ON "payload_locked_documents_rels" USING btree ("volunteers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shifts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "volunteer_assignments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "volunteers_positions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "volunteers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shifts" CASCADE;
  DROP TABLE "volunteer_assignments" CASCADE;
  DROP TABLE "volunteers_positions" CASCADE;
  DROP TABLE "volunteers" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_shifts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_volunteer_assignments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_volunteers_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'editor', 'volunteer', 'musician', 'vendor', 'venue', 'sponsor');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  DROP INDEX "payload_locked_documents_rels_shifts_id_idx";
  DROP INDEX "payload_locked_documents_rels_volunteer_assignments_id_idx";
  DROP INDEX "payload_locked_documents_rels_volunteers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "shifts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "volunteer_assignments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "volunteers_id";
  DROP TYPE "public"."enum_shifts_date";
  DROP TYPE "public"."enum_shifts_role";
  DROP TYPE "public"."enum_volunteer_assignments_status";
  DROP TYPE "public"."enum_volunteers_positions";
  DROP TYPE "public"."enum_volunteers_shirt_size";
  DROP TYPE "public"."enum_volunteers_assigned_shift";
  DROP TYPE "public"."enum_volunteers_assigned_position";`)
}
