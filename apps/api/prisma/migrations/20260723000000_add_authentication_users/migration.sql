DROP TABLE "app_metadata";

CREATE TYPE "PreferredLanguage" AS ENUM ('ES', 'EN');
CREATE TYPE "Theme" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_provider_id" TEXT NOT NULL,
    "email" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "username" VARCHAR(30),
    "username_normalized" VARCHAR(30),
    "display_name" VARCHAR(80) NOT NULL,
    "avatar_url" TEXT,
    "preferred_language" "PreferredLanguage" NOT NULL DEFAULT 'ES',
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "users"("auth_provider_id");
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- Prisma cannot express a unique index scoped to active (non-soft-deleted) users.
-- This keeps usernames case-insensitively unique while allowing reuse after soft delete.
CREATE UNIQUE INDEX "users_username_normalized_active_key"
ON "users"("username_normalized")
WHERE "deleted_at" IS NULL AND "username_normalized" IS NOT NULL;
