CREATE TYPE "NotificationType" AS ENUM ('RECOMMENDATION_RECEIVED', 'RECOMMENDATION_ACCEPTED', 'SHARED_PLAN_INVITATION_RECEIVED', 'SHARED_PLAN_INVITATION_ACCEPTED', 'SHARED_PLAN_MEMBER_LEFT', 'SHARED_PLAN_MEMBER_REMOVED', 'SHARED_PLAN_PARTICIPANT_COMPLETED', 'SHARED_PLAN_COMPLETED', 'SHARED_PLAN_CANCELLED');
CREATE TABLE "notifications" (
  "id" UUID NOT NULL, "recipient_id" UUID NOT NULL, "actor_id" UUID, "type" "NotificationType" NOT NULL,
  "recommendation_id" UUID, "shared_plan_id" UUID, "content_title" VARCHAR(500) NOT NULL, "metadata" JSONB NOT NULL DEFAULT '{}',
  "deduplication_key" VARCHAR(255) NOT NULL, "read_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"), CONSTRAINT "notifications_deduplication_key_key" UNIQUE ("deduplication_key"),
  CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "notifications_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE SET NULL,
  CONSTRAINT "notifications_shared_plan_id_fkey" FOREIGN KEY ("shared_plan_id") REFERENCES "shared_plans"("id") ON DELETE SET NULL
);
CREATE INDEX "notifications_recipient_read_created_at_idx" ON "notifications"("recipient_id", "read_at", "created_at");
CREATE INDEX "notifications_recipient_created_at_idx" ON "notifications"("recipient_id", "created_at");
