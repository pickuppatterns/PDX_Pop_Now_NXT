import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'web_admin', 'editor', 'volunteer_director', 'compilation_director', 'booking_director', 'sponsorship_director', 'social_director', 'radio_director', 'listening_director', 'orders_director', 'support_director', 'volunteer', 'musician', 'vendor', 'venue', 'sponsor', 'customer');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'editor', 'volunteer', 'musician', 'vendor', 'venue', 'sponsor', 'customer', 'web_admin', 'volunteer_director', 'compilation_director', 'booking_director', 'sponsorship_director', 'social_director', 'radio_director', 'listening_director', 'orders_director', 'support_director');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'volunteer'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";`)
}
