-- CreateIndex
CREATE INDEX "progress_logs_user_id_logged_date_idx" ON "progress_logs"("user_id", "logged_date");

-- CreateIndex
CREATE INDEX "progress_logs_task_id_logged_date_idx" ON "progress_logs"("task_id", "logged_date");

-- CreateIndex
CREATE INDEX "progress_logs_logged_date_idx" ON "progress_logs"("logged_date");

-- CreateIndex
CREATE INDEX "user_scores_total_points_idx" ON "user_scores"("total_points");

-- CreateIndex
CREATE INDEX "user_scores_task_id_total_points_idx" ON "user_scores"("task_id", "total_points");
