import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_radio_submissions_portland_based" AS ENUM('YES', 'NO');
  CREATE TYPE "public"."enum_radio_submissions_radio_appropriate" AS ENUM('radio_friendly', 'parental_advisory');
  CREATE TYPE "public"."enum_radio_submissions_status" AS ENUM('pending', 'under_review', 'added', 'not_selected');
  CREATE TABLE "radio_songs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"year" numeric,
  	"prefix" varchar DEFAULT '2026',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "radio_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"artist_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"zip_code" varchar,
  	"portland_based" "enum_radio_submissions_portland_based",
  	"genre" varchar,
  	"radio_appropriate" "enum_radio_submissions_radio_appropriate",
  	"download_link" varchar,
  	"website" varchar,
  	"comments" varchar,
  	"track_url" varchar,
  	"track_filename" varchar,
  	"agree_library" boolean,
  	"agree_not_compilation" boolean,
  	"year" numeric,
  	"status" "enum_radio_submissions_status" DEFAULT 'pending',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "radio_songs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "radio_submissions_id" integer;
  CREATE INDEX "radio_songs_updated_at_idx" ON "radio_songs" USING btree ("updated_at");
  CREATE INDEX "radio_songs_created_at_idx" ON "radio_songs" USING btree ("created_at");
  CREATE UNIQUE INDEX "radio_songs_filename_idx" ON "radio_songs" USING btree ("filename");
  CREATE INDEX "radio_submissions_updated_at_idx" ON "radio_submissions" USING btree ("updated_at");
  CREATE INDEX "radio_submissions_created_at_idx" ON "radio_submissions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_radio_songs_fk" FOREIGN KEY ("radio_songs_id") REFERENCES "public"."radio_songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_radio_submissions_fk" FOREIGN KEY ("radio_submissions_id") REFERENCES "public"."radio_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_radio_songs_id_idx" ON "payload_locked_documents_rels" USING btree ("radio_songs_id");
  CREATE INDEX "payload_locked_documents_rels_radio_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("radio_submissions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "radio_songs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "radio_submissions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "radio_songs" CASCADE;
  DROP TABLE "radio_submissions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_radio_songs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_radio_submissions_fk";
  
  DROP INDEX "payload_locked_documents_rels_radio_songs_id_idx";
  DROP INDEX "payload_locked_documents_rels_radio_submissions_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "radio_songs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "radio_submissions_id";
  DROP TYPE "public"."enum_radio_submissions_portland_based";
  DROP TYPE "public"."enum_radio_submissions_radio_appropriate";
  DROP TYPE "public"."enum_radio_submissions_status";`)
}
