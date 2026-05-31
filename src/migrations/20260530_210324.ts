import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_newsletter_signup_theme" AS ENUM('dark', 'light');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_signup_theme" AS ENUM('dark', 'light');
  CREATE TABLE "pages_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Stay in the loop',
  	"subheading" varchar DEFAULT 'Get PDX Pop Now! news, festival updates, and announcements delivered to your inbox.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"theme" "enum_pages_blocks_newsletter_signup_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Stay in the loop',
  	"subheading" varchar DEFAULT 'Get PDX Pop Now! news, festival updates, and announcements delivered to your inbox.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"theme" "enum__pages_v_blocks_newsletter_signup_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "radio_submissions" ADD COLUMN "song_title" varchar;
  ALTER TABLE "radio_submissions" ADD COLUMN "reviewed" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_newsletter_signup" ADD CONSTRAINT "pages_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter_signup" ADD CONSTRAINT "_pages_v_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_newsletter_signup_order_idx" ON "pages_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_signup_parent_id_idx" ON "pages_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_signup_path_idx" ON "pages_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_order_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_parent_id_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_path_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_newsletter_signup" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter_signup" CASCADE;
  ALTER TABLE "radio_submissions" DROP COLUMN "song_title";
  ALTER TABLE "radio_submissions" DROP COLUMN "reviewed";
  DROP TYPE "public"."enum_pages_blocks_newsletter_signup_theme";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_signup_theme";`)
}
