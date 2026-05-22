import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'web_admin';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'volunteer_director';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'compilation_director';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'booking_director';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'sponsorship_director';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'social_director';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'radio_director';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'listening_director';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'orders_director';
    ALTER TYPE "public"."enum_users_role" ADD VALUE IF NOT EXISTS 'support_director';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Postgres does not support removing enum values
}
