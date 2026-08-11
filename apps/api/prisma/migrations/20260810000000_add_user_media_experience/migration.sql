ALTER TABLE "user_media"
  ADD COLUMN "personal_rating" DECIMAL(3, 1),
  ADD COLUMN "private_comment" VARCHAR(2000),
  ADD CONSTRAINT "user_media_personal_rating_check"
  CHECK (
    "personal_rating" IS NULL
    OR (
      "personal_rating" >= 1
      AND "personal_rating" <= 10
      AND MOD("personal_rating" * 2, 1) = 0
    )
  );
