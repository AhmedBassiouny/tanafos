-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('EXACT', 'MINIMUM', 'MAXIMUM');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXCEEDED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC';

-- CreateTable
CREATE TABLE "daily_goals" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "target_value" DECIMAL(10,2) NOT NULL,
    "target_type" "GoalType" NOT NULL DEFAULT 'MINIMUM',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_goal_progress" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "goal_date" DATE NOT NULL,
    "current_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "target_value" DECIMAL(10,2) NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_at" TIMESTAMP(3),
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_goal_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_goal_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "goal_date" DATE NOT NULL,
    "target_value" DECIMAL(10,2) NOT NULL,
    "final_value" DECIMAL(10,2) NOT NULL,
    "completion_rate" DECIMAL(5,2) NOT NULL,
    "status" "GoalStatus" NOT NULL,
    "completed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_goal_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_goals_task_id_key" ON "daily_goals"("task_id");

-- CreateIndex
CREATE INDEX "daily_goal_progress_user_id_goal_date_idx" ON "daily_goal_progress"("user_id", "goal_date");

-- CreateIndex
CREATE INDEX "daily_goal_progress_goal_date_status_idx" ON "daily_goal_progress"("goal_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "daily_goal_progress_user_id_task_id_goal_date_key" ON "daily_goal_progress"("user_id", "task_id", "goal_date");

-- CreateIndex
CREATE INDEX "daily_goal_history_user_id_goal_date_idx" ON "daily_goal_history"("user_id", "goal_date");

-- CreateIndex
CREATE INDEX "daily_goal_history_task_id_goal_date_idx" ON "daily_goal_history"("task_id", "goal_date");

-- CreateIndex
CREATE INDEX "daily_goal_history_goal_date_status_idx" ON "daily_goal_history"("goal_date", "status");

-- AddForeignKey
ALTER TABLE "daily_goals" ADD CONSTRAINT "daily_goals_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_goal_progress" ADD CONSTRAINT "daily_goal_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_goal_progress" ADD CONSTRAINT "daily_goal_progress_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_goal_history" ADD CONSTRAINT "daily_goal_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_goal_history" ADD CONSTRAINT "daily_goal_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
