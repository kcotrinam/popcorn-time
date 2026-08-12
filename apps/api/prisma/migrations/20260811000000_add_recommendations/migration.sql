CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'ACCEPTED');
CREATE TABLE "recommendations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "sender_id" UUID NOT NULL, "recipient_id" UUID NOT NULL,
  "provider" VARCHAR(50) NOT NULL DEFAULT 'tmdb', "external_id" INTEGER NOT NULL, "media_type" VARCHAR(16) NOT NULL,
  "title" VARCHAR(500) NOT NULL, "poster_url" TEXT, "release_year" INTEGER, "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "accepted_at" TIMESTAMP(3),
  CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recommendations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "recommendations_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "recommendations_sender_recipient_content_key" ON "recommendations"("sender_id", "recipient_id", "provider", "external_id", "media_type");
CREATE INDEX "recommendations_recipient_status_created_at_idx" ON "recommendations"("recipient_id", "status", "created_at");
CREATE INDEX "recommendations_sender_status_created_at_idx" ON "recommendations"("sender_id", "status", "created_at");
