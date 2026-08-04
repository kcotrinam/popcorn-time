ALTER TABLE "user_media" ADD COLUMN "watched_at" TIMESTAMP(3);

CREATE INDEX "user_media_user_status_watched_at_idx"
ON "user_media"("user_id", "status", "watched_at" DESC);
