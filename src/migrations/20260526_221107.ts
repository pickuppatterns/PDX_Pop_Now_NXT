import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "compilation_photos" (
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
  
  ALTER TABLE "compilation_media" RENAME TO "compilation_songs";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "compilation_media_id" TO "compilation_songs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_compilation_media_fk";
  
  DROP INDEX "compilation_media_updated_at_idx";
  DROP INDEX "compilation_media_created_at_idx";
  DROP INDEX "compilation_media_filename_idx";
  DROP INDEX "payload_locked_documents_rels_compilation_media_id_idx";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "compilation_photos_id" integer;
  CREATE INDEX "compilation_photos_updated_at_idx" ON "compilation_photos" USING btree ("updated_at");
  CREATE INDEX "compilation_photos_created_at_idx" ON "compilation_photos" USING btree ("created_at");
  CREATE UNIQUE INDEX "compilation_photos_filename_idx" ON "compilation_photos" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_compilation_songs_fk" FOREIGN KEY ("compilation_songs_id") REFERENCES "public"."compilation_songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_compilation_photos_fk" FOREIGN KEY ("compilation_photos_id") REFERENCES "public"."compilation_photos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "compilation_songs_updated_at_idx" ON "compilation_songs" USING btree ("updated_at");
  CREATE INDEX "compilation_songs_created_at_idx" ON "compilation_songs" USING btree ("created_at");
  CREATE UNIQUE INDEX "compilation_songs_filename_idx" ON "compilation_songs" USING btree ("filename");
  CREATE INDEX "payload_locked_documents_rels_compilation_songs_id_idx" ON "payload_locked_documents_rels" USING btree ("compilation_songs_id");
  CREATE INDEX "payload_locked_documents_rels_compilation_photos_id_idx" ON "payload_locked_documents_rels" USING btree ("compilation_photos_id");
  ALTER TABLE "compilation_songs" DROP COLUMN "file_type";
  DROP TYPE "public"."enum_compilation_media_file_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_compilation_media_file_type" AS ENUM('track', 'band_photo');
  ALTER TABLE "compilation_photos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "compilation_photos" CASCADE;
  ALTER TABLE "compilation_songs" RENAME TO "compilation_media";
  ALTER TABLE "payload_locked_documents_rels" RENAME COLUMN "compilation_songs_id" TO "compilation_media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_compilation_songs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_compilation_photos_fk";
  
  DROP INDEX "compilation_songs_updated_at_idx";
  DROP INDEX "compilation_songs_created_at_idx";
  DROP INDEX "compilation_songs_filename_idx";
  DROP INDEX "payload_locked_documents_rels_compilation_songs_id_idx";
  DROP INDEX "payload_locked_documents_rels_compilation_photos_id_idx";
  ALTER TABLE "compilation_media" ADD COLUMN "file_type" "enum_compilation_media_file_type";
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_compilation_media_fk" FOREIGN KEY ("compilation_media_id") REFERENCES "public"."compilation_media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "compilation_media_updated_at_idx" ON "compilation_media" USING btree ("updated_at");
  CREATE INDEX "compilation_media_created_at_idx" ON "compilation_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "compilation_media_filename_idx" ON "compilation_media" USING btree ("filename");
  CREATE INDEX "payload_locked_documents_rels_compilation_media_id_idx" ON "payload_locked_documents_rels" USING btree ("compilation_media_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "compilation_photos_id";`)
}
