import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_compilation_media_file_type" AS ENUM('track', 'band_photo');
  CREATE TABLE "compilation_media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"year" numeric,
  	"file_type" "enum_compilation_media_file_type",
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "compilation_media_id" integer;
  CREATE INDEX "compilation_media_updated_at_idx" ON "compilation_media" USING btree ("updated_at");
  CREATE INDEX "compilation_media_created_at_idx" ON "compilation_media" USING btree ("created_at");
  CREATE UNIQUE INDEX "compilation_media_filename_idx" ON "compilation_media" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_compilation_media_fk" FOREIGN KEY ("compilation_media_id") REFERENCES "public"."compilation_media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_compilation_media_id_idx" ON "payload_locked_documents_rels" USING btree ("compilation_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "compilation_media" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "compilation_media" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_compilation_media_fk";
  
  DROP INDEX "payload_locked_documents_rels_compilation_media_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "compilation_media_id";
  DROP TYPE "public"."enum_compilation_media_file_type";`)
}
