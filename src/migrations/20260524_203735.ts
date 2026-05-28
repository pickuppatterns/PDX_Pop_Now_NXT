import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Drop foreign key constraints first
    ALTER TABLE "compilation_submissions_songwriting_credit_music" DROP CONSTRAINT IF EXISTS "csm_parent_fk";
    ALTER TABLE "compilation_submissions_songwriting_credit_lyrics" DROP CONSTRAINT IF EXISTS "csl_parent_fk";
    ALTER TABLE "compilation_submissions_publishers" DROP CONSTRAINT IF EXISTS "csp_parent_fk";
    ALTER TABLE "compilation_submissions_sound_recording_owners" DROP CONSTRAINT IF EXISTS "csso_parent_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_compilation_submissions_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_compilation_submissions_id_fkey";
    -- Alter column types
    ALTER TABLE "compilation_submissions" ALTER COLUMN "id" SET DATA TYPE varchar;
    ALTER TABLE "compilation_submissions_songwriting_credit_music" ALTER COLUMN "_parent_id" SET DATA TYPE varchar;
    ALTER TABLE "compilation_submissions_songwriting_credit_lyrics" ALTER COLUMN "_parent_id" SET DATA TYPE varchar;
    ALTER TABLE "compilation_submissions_publishers" ALTER COLUMN "_parent_id" SET DATA TYPE varchar;
    ALTER TABLE "compilation_submissions_sound_recording_owners" ALTER COLUMN "_parent_id" SET DATA TYPE varchar;
    ALTER TABLE "payload_locked_documents_rels" ALTER COLUMN "compilation_submissions_id" SET DATA TYPE varchar;

    -- Recreate foreign key constraints
    ALTER TABLE "compilation_submissions_songwriting_credit_music" ADD CONSTRAINT "csm_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
    ALTER TABLE "compilation_submissions_songwriting_credit_lyrics" ADD CONSTRAINT "csl_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
    ALTER TABLE "compilation_submissions_publishers" ADD CONSTRAINT "csp_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
    ALTER TABLE "compilation_submissions_sound_recording_owners" ADD CONSTRAINT "csso_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_compilation_submissions_fk" FOREIGN KEY ("compilation_submissions_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "compilation_submissions_songwriting_credit_music" DROP CONSTRAINT IF EXISTS "csm_parent_fk";
    ALTER TABLE "compilation_submissions_songwriting_credit_lyrics" DROP CONSTRAINT IF EXISTS "csl_parent_fk";
    ALTER TABLE "compilation_submissions_publishers" DROP CONSTRAINT IF EXISTS "csp_parent_fk";
    ALTER TABLE "compilation_submissions_sound_recording_owners" DROP CONSTRAINT IF EXISTS "csso_parent_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_compilation_submissions_fk";

    ALTER TABLE "compilation_submissions" ALTER COLUMN "id" SET DATA TYPE integer USING id::integer;
    ALTER TABLE "compilation_submissions_songwriting_credit_music" ALTER COLUMN "_parent_id" SET DATA TYPE integer USING _parent_id::integer;
    ALTER TABLE "compilation_submissions_songwriting_credit_lyrics" ALTER COLUMN "_parent_id" SET DATA TYPE integer USING _parent_id::integer;
    ALTER TABLE "compilation_submissions_publishers" ALTER COLUMN "_parent_id" SET DATA TYPE integer USING _parent_id::integer;
    ALTER TABLE "compilation_submissions_sound_recording_owners" ALTER COLUMN "_parent_id" SET DATA TYPE integer USING _parent_id::integer;
    ALTER TABLE "payload_locked_documents_rels" ALTER COLUMN "compilation_submissions_id" SET DATA TYPE integer USING compilation_submissions_id::integer;

    ALTER TABLE "compilation_submissions_songwriting_credit_music" ADD CONSTRAINT "csm_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
    ALTER TABLE "compilation_submissions_songwriting_credit_lyrics" ADD CONSTRAINT "csl_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
    ALTER TABLE "compilation_submissions_publishers" ADD CONSTRAINT "csp_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
    ALTER TABLE "compilation_submissions_sound_recording_owners" ADD CONSTRAINT "csso_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_compilation_submissions_fk" FOREIGN KEY ("compilation_submissions_id") REFERENCES "compilation_submissions"("id") ON DELETE cascade;
  `)
}
