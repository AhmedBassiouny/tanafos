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
exports.LeaderboardService = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const name_anonymizer_service_1 = require("./name-anonymizer.service");
class LeaderboardService {
    static getOverallLeaderboard(sessionId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const scores = yield database_1.prisma.userScore.findMany({
                where: {
                    taskId: null // Overall scores only
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                },
                orderBy: {
                    totalPoints: 'desc'
                }
            });
            const leaderboardEntries = scores.map((score, index) => ({
                rank: index + 1,
                userId: score.user.id,
                username: score.user.username,
                totalPoints: score.totalPoints
            }));
            // Apply name anonymization if session info provided
            if (sessionId && currentUserId !== undefined) {
                return name_anonymizer_service_1.NameAnonymizerService.anonymizeUserList(sessionId, currentUserId, leaderboardEntries);
            }
            return leaderboardEntries;
        });
    }
    static getTaskLeaderboard(taskId, sessionId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verify task exists
            const task = yield database_1.prisma.task.findUnique({
                where: { id: taskId }
            });
            if (!task) {
                throw new errorHandler_1.AppError('Task not found', 404);
            }
            const scores = yield database_1.prisma.userScore.findMany({
                where: {
                    taskId: taskId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                },
                orderBy: {
                    totalPoints: 'desc'
                }
            });
            const leaderboardEntries = scores.map((score, index) => ({
                rank: index + 1,
                userId: score.user.id,
                username: score.user.username,
                totalPoints: score.totalPoints,
                totalValue: score.totalValue.toNumber()
            }));
            // Apply name anonymization if session info provided
            if (sessionId && currentUserId !== undefined) {
                return name_anonymizer_service_1.NameAnonymizerService.anonymizeUserList(sessionId, currentUserId, leaderboardEntries);
            }
            return leaderboardEntries;
        });
    }
}
exports.LeaderboardService = LeaderboardService;
