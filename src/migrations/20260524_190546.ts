import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_volunteers_music_genres" AS ENUM('classical', 'country', 'electronic', 'experimental', 'folk_americana', 'hip_hop', 'international', 'rb_soul', 'jazz', 'metal_hardcore', 'pop', 'post_punk', 'rock_alt_punk', 'indie_rock_pop', 'goth_darkwave');
  CREATE TYPE "public"."enum_volunteers_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_listening_committee_genre_first" AS ENUM('classical', 'country', 'electronic', 'experimental', 'folk_americana', 'hip_hop', 'international', 'rb_soul', 'jazz', 'metal_hardcore', 'pop', 'post_punk', 'rock_alt_punk', 'indie_rock_pop', 'goth_darkwave');
  CREATE TYPE "public"."enum_listening_committee_genre_second" AS ENUM('classical', 'country', 'electronic', 'experimental', 'folk_americana', 'hip_hop', 'international', 'rb_soul', 'jazz', 'metal_hardcore', 'pop', 'post_punk', 'rock_alt_punk', 'indie_rock_pop', 'goth_darkwave');
  CREATE TYPE "public"."enum_listening_committee_is_returning" AS ENUM('yes', 'no');
  CREATE TYPE "public"."enum_listening_committee_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_compilation_submissions_genre" AS ENUM('classical', 'country', 'electronic', 'experimental', 'folk_americana', 'hip_hop', 'international', 'rb_soul', 'jazz', 'metal_hardcore', 'pop', 'post_punk', 'rock_alt_punk', 'indie_rock_pop', 'goth_darkwave');
  CREATE TYPE "public"."enum_compilation_submissions_release_status" AS ENUM('unreleased', 'self_released', 'on_label', 'soundcloud');
  CREATE TYPE "public"."enum_compilation_submissions_radio_appropriate" AS ENUM('radio_friendly', 'parental_advisory');
  CREATE TYPE "public"."enum_compilation_submissions_affiliation" AS ENUM('songwriter', 'band_member', 'manager', 'label_rep', 'other');
  CREATE TYPE "public"."enum_compilation_submissions_status" AS ENUM('pending', 'under_review', 'selected', 'not_selected');
  CREATE TABLE "volunteers_music_genres" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_volunteers_music_genres",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "listening_committee" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"better_auth_id" varchar,
  	"genre_first" "enum_listening_committee_genre_first" NOT NULL,
  	"genre_second" "enum_listening_committee_genre_second",
  	"is_returning" "enum_listening_committee_is_returning" NOT NULL,
  	"mailing_list" boolean DEFAULT false,
  	"status" "enum_listening_committee_status" DEFAULT 'active',
  	"assigned_batch" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "compilation_submissions_songwriting_credit_music" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"split" numeric
  );
  
  CREATE TABLE "compilation_submissions_songwriting_credit_lyrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"split" numeric
  );
  
  CREATE TABLE "compilation_submissions_publishers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"split" numeric
  );
  
  CREATE TABLE "compilation_submissions_sound_recording_owners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"split" numeric
  );
  
  CREATE TABLE "compilation_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"artist_name" varchar NOT NULL,
  	"song_title" varchar NOT NULL,
  	"genre" "enum_compilation_submissions_genre" NOT NULL,
  	"release_status" "enum_compilation_submissions_release_status" NOT NULL,
  	"label_name" varchar,
  	"radio_appropriate" "enum_compilation_submissions_radio_appropriate" NOT NULL,
  	"promo_link" varchar,
  	"bandcamp" varchar,
  	"instagram" varchar,
  	"website" varchar,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"affiliation" "enum_compilation_submissions_affiliation" NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"track_url" varchar,
  	"band_photo_url" varchar,
  	"track_filename" varchar,
  	"better_auth_id" varchar,
  	"agreement_accepted" boolean,
  	"agreement_timestamp" varchar,
  	"agreement_ip" varchar,
  	"agreement_version" varchar DEFAULT '2026-v1',
  	"status" "enum_compilation_submissions_status" DEFAULT 'pending',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "volunteers" ADD COLUMN "avatar_url" varchar;
  ALTER TABLE "volunteers" ADD COLUMN "status" "enum_volunteers_status" DEFAULT 'active';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "listening_committee_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "compilation_submissions_id" integer;
  ALTER TABLE "volunteers_music_genres" ADD CONSTRAINT "volunteers_music_genres_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."volunteers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "compilation_submissions_songwriting_credit_music" ADD CONSTRAINT "compilation_submissions_songwriting_credit_music_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."compilation_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "compilation_submissions_songwriting_credit_lyrics" ADD CONSTRAINT "compilation_submissions_songwriting_credit_lyrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."compilation_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "compilation_submissions_publishers" ADD CONSTRAINT "compilation_submissions_publishers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."compilation_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "compilation_submissions_sound_recording_owners" ADD CONSTRAINT "compilation_submissions_sound_recording_owners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."compilation_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "volunteers_music_genres_order_idx" ON "volunteers_music_genres" USING btree ("order");
  CREATE INDEX "volunteers_music_genres_parent_idx" ON "volunteers_music_genres" USING btree ("parent_id");
  CREATE INDEX "listening_committee_updated_at_idx" ON "listening_committee" USING btree ("updated_at");
  CREATE INDEX "listening_committee_created_at_idx" ON "listening_committee" USING btree ("created_at");
  CREATE INDEX "compilation_submissions_songwriting_credit_music_order_idx" ON "compilation_submissions_songwriting_credit_music" USING btree ("_order");
  CREATE INDEX "compilation_submissions_songwriting_credit_music_parent_id_idx" ON "compilation_submissions_songwriting_credit_music" USING btree ("_parent_id");
  CREATE INDEX "compilation_submissions_songwriting_credit_lyrics_order_idx" ON "compilation_submissions_songwriting_credit_lyrics" USING btree ("_order");
  CREATE INDEX "compilation_submissions_songwriting_credit_lyrics_parent_id_idx" ON "compilation_submissions_songwriting_credit_lyrics" USING btree ("_parent_id");
  CREATE INDEX "compilation_submissions_publishers_order_idx" ON "compilation_submissions_publishers" USING btree ("_order");
  CREATE INDEX "compilation_submissions_publishers_parent_id_idx" ON "compilation_submissions_publishers" USING btree ("_parent_id");
  CREATE INDEX "compilation_submissions_sound_recording_owners_order_idx" ON "compilation_submissions_sound_recording_owners" USING btree ("_order");
  CREATE INDEX "compilation_submissions_sound_recording_owners_parent_id_idx" ON "compilation_submissions_sound_recording_owners" USING btree ("_parent_id");
  CREATE INDEX "compilation_submissions_updated_at_idx" ON "compilation_submissions" USING btree ("updated_at");
  CREATE INDEX "compilation_submissions_created_at_idx" ON "compilation_submissions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_listening_committee_fk" FOREIGN KEY ("listening_committee_id") REFERENCES "public"."listening_committee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_compilation_submissions_fk" FOREIGN KEY ("compilation_submissions_id") REFERENCES "public"."compilation_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "volunteers_better_auth_id_idx" ON "volunteers" USING btree ("better_auth_id");
  CREATE INDEX "payload_locked_documents_rels_listening_committee_id_idx" ON "payload_locked_documents_rels" USING btree ("listening_committee_id");
  CREATE INDEX "payload_locked_documents_rels_compilation_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("compilation_submissions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "volunteers_music_genres" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "listening_committee" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "compilation_submissions_songwriting_credit_music" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "compilation_submissions_songwriting_credit_lyrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "compilation_submissions_publishers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "compilation_submissions_sound_recording_owners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "compilation_submissions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "volunteers_music_genres" CASCADE;
  DROP TABLE "listening_committee" CASCADE;
  DROP TABLE "compilation_submissions_songwriting_credit_music" CASCADE;
  DROP TABLE "compilation_submissions_songwriting_credit_lyrics" CASCADE;
  DROP TABLE "compilation_submissions_publishers" CASCADE;
  DROP TABLE "compilation_submissions_sound_recording_owners" CASCADE;
  DROP TABLE "compilation_submissions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_listening_committee_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_compilation_submissions_fk";
  
  DROP INDEX "volunteers_better_auth_id_idx";
  DROP INDEX "payload_locked_documents_rels_listening_committee_id_idx";
  DROP INDEX "payload_locked_documents_rels_compilation_submissions_id_idx";
  ALTER TABLE "volunteers" DROP COLUMN "avatar_url";
  ALTER TABLE "volunteers" DROP COLUMN "status";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "listening_committee_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "compilation_submissions_id";
  DROP TYPE "public"."enum_volunteers_music_genres";
  DROP TYPE "public"."enum_volunteers_status";
  DROP TYPE "public"."enum_listening_committee_genre_first";
  DROP TYPE "public"."enum_listening_committee_genre_second";
  DROP TYPE "public"."enum_listening_committee_is_returning";
  DROP TYPE "public"."enum_listening_committee_status";
  DROP TYPE "public"."enum_compilation_submissions_genre";
  DROP TYPE "public"."enum_compilation_submissions_release_status";
  DROP TYPE "public"."enum_compilation_submissions_radio_appropriate";
  DROP TYPE "public"."enum_compilation_submissions_affiliation";
  DROP TYPE "public"."enum_compilation_submissions_status";`)
}
