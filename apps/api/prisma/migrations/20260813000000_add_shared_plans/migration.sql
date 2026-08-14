CREATE TYPE "SharedPlanStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "SharedPlanParticipantRole" AS ENUM ('CREATOR', 'MEMBER');
CREATE TYPE "SharedPlanInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED');
CREATE TYPE "SharedPlanProgressStatus" AS ENUM ('NOT_STARTED', 'WATCHING', 'WATCHED');
CREATE TABLE "shared_plans" (
  "id" UUID NOT NULL, "creator_id" UUID NOT NULL, "provider" VARCHAR(50) NOT NULL DEFAULT 'tmdb', "external_id" INTEGER NOT NULL, "media_type" VARCHAR(16) NOT NULL, "title" VARCHAR(500) NOT NULL, "poster_url" TEXT, "release_year" INTEGER, "movie_runtime_minutes" INTEGER, "status" "SharedPlanStatus" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, "completed_at" TIMESTAMP(3), "cancelled_at" TIMESTAMP(3),
  CONSTRAINT "shared_plans_pkey" PRIMARY KEY ("id"), CONSTRAINT "shared_plans_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "shared_plan_participants" (
  "plan_id" UUID NOT NULL, "user_id" UUID NOT NULL, "role" "SharedPlanParticipantRole" NOT NULL DEFAULT 'MEMBER', "invitation_status" "SharedPlanInvitationStatus" NOT NULL DEFAULT 'PENDING', "progress_status" "SharedPlanProgressStatus" NOT NULL DEFAULT 'NOT_STARTED', "movie_minute" INTEGER, "current_season" INTEGER, "last_watched_episode" INTEGER, "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "accepted_at" TIMESTAMP(3), "progress_updated_at" TIMESTAMP(3), "completed_at" TIMESTAMP(3),
  CONSTRAINT "shared_plan_participants_pkey" PRIMARY KEY ("plan_id", "user_id"), CONSTRAINT "shared_plan_participants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "shared_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "shared_plan_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "shared_plans_creator_status_created_at_idx" ON "shared_plans"("creator_id", "status", "created_at");
CREATE INDEX "shared_plan_participants_user_invitation_invited_at_idx" ON "shared_plan_participants"("user_id", "invitation_status", "invited_at");
