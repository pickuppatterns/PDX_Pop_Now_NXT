import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_compilation_submissions_result_message" AS ENUM('selected', 'not_selected');
  ALTER TABLE "compilation_submissions" ADD COLUMN "avatar_url" varchar;
  ALTER TABLE "compilation_submissions" ADD COLUMN "selected_for_compilation" boolean DEFAULT false;
  ALTER TABLE "compilation_submissions" ADD COLUMN "result_message" "enum_compilation_submissions_result_message";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "compilation_submissions" DROP COLUMN "avatar_url";
  ALTER TABLE "compilation_submissions" DROP COLUMN "selected_for_compilation";
  ALTER TABLE "compilation_submissions" DROP COLUMN "result_message";
  DROP TYPE "public"."enum_compilation_submissions_result_message";`)
}
