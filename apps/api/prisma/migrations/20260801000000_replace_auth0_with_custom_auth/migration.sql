ALTER TABLE "users" DROP COLUMN "auth_provider_id", DROP COLUMN "email_verified";
ALTER TABLE "users" ADD COLUMN "email_normalized" VARCHAR(254), ADD COLUMN "password_hash" TEXT, ADD COLUMN "email_verified_at" TIMESTAMP(3);
DELETE FROM "users";
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL, ALTER COLUMN "email_normalized" SET NOT NULL, ALTER COLUMN "password_hash" SET NOT NULL;
CREATE UNIQUE INDEX "users_email_normalized_key" ON "users"("email_normalized");

CREATE TABLE "refresh_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL, "family_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL, "expires_at" TIMESTAMP(3) NOT NULL, "revoked_at" TIMESTAMP(3), "replaced_by_id" UUID,
  "user_agent" TEXT, "ip_address" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id"), CONSTRAINT "refresh_sessions_token_hash_key" UNIQUE ("token_hash"), CONSTRAINT "refresh_sessions_replaced_by_id_key" UNIQUE ("replaced_by_id"),
  CONSTRAINT "refresh_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "refresh_sessions_user_id_idx" ON "refresh_sessions"("user_id"); CREATE INDEX "refresh_sessions_family_id_idx" ON "refresh_sessions"("family_id");
CREATE TABLE "email_verification_tokens" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL, "token_hash" TEXT NOT NULL, "expires_at" TIMESTAMP(3) NOT NULL, "used_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id"), CONSTRAINT "email_verification_tokens_token_hash_key" UNIQUE ("token_hash"), CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE);
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");
CREATE TABLE "password_reset_tokens" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL, "token_hash" TEXT NOT NULL, "expires_at" TIMESTAMP(3) NOT NULL, "used_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id"), CONSTRAINT "password_reset_tokens_token_hash_key" UNIQUE ("token_hash"), CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE);
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");
CREATE TABLE "external_identities" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL, "provider" VARCHAR(50) NOT NULL, "provider_subject" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "external_identities_pkey" PRIMARY KEY ("id"), CONSTRAINT "external_identities_provider_subject_key" UNIQUE ("provider", "provider_subject"), CONSTRAINT "external_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE);
CREATE INDEX "external_identities_user_id_idx" ON "external_identities"("user_id");
