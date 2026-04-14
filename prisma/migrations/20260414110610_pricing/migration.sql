-- CreateTable
CREATE TABLE "shared_users" (
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "cefr_level" TEXT NOT NULL DEFAULT 'A1',
    "fluency_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cefr_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cefr_updated_by" TEXT DEFAULT 'system',
    "englivo_plan" TEXT NOT NULL DEFAULT 'none',
    "engr_plan" TEXT NOT NULL DEFAULT 'free',
    "englivo_credits" INTEGER NOT NULL DEFAULT 0,
    "englivo_provisioned" BOOLEAN NOT NULL DEFAULT false,
    "engr_provisioned" BOOLEAN NOT NULL DEFAULT false,
    "total_practice_minutes" INTEGER NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "last_active_app" TEXT,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "preferred_mode" TEXT,
    "last_session_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_users_pkey" PRIMARY KEY ("clerk_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_users_email_key" ON "shared_users"("email");
