CREATE TYPE "UserMediaStatus" AS ENUM ('WATCHLIST', 'WATCHED');

CREATE TABLE "user_media" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "provider" VARCHAR(50) NOT NULL,
  "external_id" INTEGER NOT NULL,
  "media_type" VARCHAR(16) NOT NULL,
  "status" "UserMediaStatus" NOT NULL DEFAULT 'WATCHLIST',
  "title" VARCHAR(500) NOT NULL,
  "poster_url" TEXT,
  "release_year" INTEGER,
  "genre_ids" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_media_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "user_media_user_provider_external_type_key" ON "user_media"("user_id", "provider", "external_id", "media_type");
CREATE INDEX "user_media_user_status_created_at_idx" ON "user_media"("user_id", "status", "created_at");
CREATE INDEX "user_media_user_media_type_idx" ON "user_media"("user_id", "media_type");
