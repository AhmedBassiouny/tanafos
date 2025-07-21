"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const library_1 = require("@prisma/client/runtime/library");
const leaderboard_service_1 = require("./leaderboard.service");
const goal_service_1 = require("./goal.service");
class ProgressService {
    static logProgress(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verify task exists and is active
            const task = yield database_1.prisma.task.findFirst({
                where: {
                    id: data.taskId,
                    isActive: true
                }
            });
            if (!task) {
                throw new errorHandler_1.AppError('Task not found or inactive', 404);
            }
            // Calculate points
            const pointsEarned = Math.round(data.value * task.pointsPerUnit);
            // Use date at start of day for consistency
            const logDate = new Date(data.date || new Date());
            logDate.setHours(0, 0, 0, 0);
            // Check if user already logged progress for this task today
            const existingLog = yield database_1.prisma.progressLog.findFirst({
                where: {
                    userId,
                    taskId: data.taskId,
                    loggedDate: logDate
                }
            });
            if (existingLog) {
                throw new errorHandler_1.AppError('Progress already logged for this task today', 400);
            }
            // Start a transaction to ensure data consistency
            const result = yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Create progress log
                const progressLog = yield tx.progressLog.create({
                    data: {
                        userId,
                        taskId: data.taskId,
                        value: new library_1.Decimal(data.value),
                        pointsEarned,
                        loggedDate: logDate
                    }
                });
                // Update or create task-specific score
                yield tx.userScore.upsert({
                    where: {
                        userId_taskId: {
                            userId,
                            taskId: data.taskId
                        }
                    },
                    create: {
                        userId,
                        taskId: data.taskId,
                        totalPoints: pointsEarned,
                        totalValue: new library_1.Decimal(data.value)
                    },
                    update: {
                        totalPoints: {
                            increment: pointsEarned
                        },
                        totalValue: {
                            increment: data.value
                        }
                    }
                });
                // Update or create overall score (taskId = null)
                const existingOverallScore = yield tx.userScore.findFirst({
                    where: {
                        userId,
                        taskId: null
                    }
                });
                if (existingOverallScore) {
                    yield tx.userScore.update({
                        where: { id: existingOverallScore.id },
                        data: {
                            totalPoints: {
                                increment: pointsEarned
                            }
                        }
                    });
                }
                else {
                    yield tx.userScore.create({
                        data: {
                            userId,
                            taskId: null,
                            totalPoints: pointsEarned,
                            totalValue: new library_1.Decimal(0)
                        }
                    });
                }
                return progressLog;
            }));
            // Invalidate leaderboard cache since scores were updated
            leaderboard_service_1.LeaderboardService.invalidateCache(data.taskId);
            // Check for goal completion and get updated goal progress
            const goalCompletion = yield goal_service_1.GoalService.checkGoalCompletion(userId, data.taskId, logDate);
            return {
                id: result.id,
                taskId: result.taskId,
                value: result.value.toNumber(),
                pointsEarned: result.pointsEarned,
                loggedDate: result.loggedDate,
                task,
                goalProgress: goalCompletion
            };
        });
    }
    static getUserStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userScores: {
                        include: {
                            task: true
                        }
                    }
                }
            });
            if (!user) {
                throw new errorHandler_1.AppError('User not found', 404);
            }
            // Get overall score
            const overallScore = user.userScores.find(score => score.taskId === null);
            const totalPoints = (overallScore === null || overallScore === void 0 ? void 0 : overallScore.totalPoints) || 0;
            // Get task-specific stats
            const taskStats = user.userScores
                .filter(score => score.taskId !== null && score.task)
                .map(score => ({
                taskId: score.taskId,
                taskName: score.task.name,
                totalValue: score.totalValue.toNumber(),
                totalPoints: score.totalPoints
            }));
            return {
                userId: user.id,
                username: user.username,
                totalPoints,
                taskStats
            };
        });
    }
}
exports.ProgressService = ProgressService;
