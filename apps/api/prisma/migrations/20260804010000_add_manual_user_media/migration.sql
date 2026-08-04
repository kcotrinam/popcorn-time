ALTER TABLE "user_media"
  ALTER COLUMN "external_id" DROP NOT NULL,
  ADD COLUMN "original_title" VARCHAR(500),
  ADD COLUMN "original_language" VARCHAR(100),
  ADD COLUMN "nationality" VARCHAR(100),
  ADD COLUMN "synopsis" VARCHAR(5000),
  ADD COLUMN "manual_categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "user_media"
  ADD CONSTRAINT "user_media_provider_external_reference_check"
  CHECK (
    ("provider" = 'tmdb' AND "external_id" IS NOT NULL)
    OR ("provider" = 'manual' AND "external_id" IS NULL)
  ),
  ADD CONSTRAINT "user_media_manual_categories_check"
  CHECK ("manual_categories" <@ ARRAY['Anime', 'Documentary', 'Experimental', 'Indie', 'Family']::TEXT[]);

CREATE INDEX "user_media_user_manual_categories_idx"
ON "user_media" USING GIN ("manual_categories");
