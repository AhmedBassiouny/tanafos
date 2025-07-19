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
// Simple in-memory cache with TTL
class Cache {
    static set(key, value, ttlMs = 300000) {
        this.data.set(key, { value, expiry: Date.now() + ttlMs });
    }
    static get(key) {
        const cached = this.data.get(key);
        if (!cached || cached.expiry < Date.now()) {
            this.data.delete(key);
            return null;
        }
        return cached.value;
    }
    static delete(key) {
        this.data.delete(key);
    }
    static clear() {
        this.data.clear();
    }
}
Cache.data = new Map();
class LeaderboardService {
    static getOverallLeaderboard(sessionId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = 'overall_leaderboard';
            let leaderboardEntries = Cache.get(cacheKey);
            if (!leaderboardEntries) {
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
                    },
                    take: 100 // Limit to top 100 for performance
                });
                leaderboardEntries = scores.map((score, index) => ({
                    rank: index + 1,
                    userId: score.user.id,
                    username: score.user.username,
                    totalPoints: score.totalPoints
                }));
                Cache.set(cacheKey, leaderboardEntries, 180000); // 3 minutes cache
            }
            // Apply name anonymization if session info provided
            if (sessionId && currentUserId !== undefined) {
                return name_anonymizer_service_1.NameAnonymizerService.anonymizeUserList(sessionId, currentUserId, leaderboardEntries);
            }
            return leaderboardEntries;
        });
    }
    static getTaskLeaderboard(taskId, sessionId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `task_leaderboard_${taskId}`;
            let leaderboardEntries = Cache.get(cacheKey);
            if (!leaderboardEntries) {
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
                    },
                    take: 100 // Limit to top 100 for performance
                });
                leaderboardEntries = scores.map((score, index) => ({
                    rank: index + 1,
                    userId: score.user.id,
                    username: score.user.username,
                    totalPoints: score.totalPoints,
                    totalValue: score.totalValue.toNumber()
                }));
                Cache.set(cacheKey, leaderboardEntries, 180000); // 3 minutes cache
            }
            // Apply name anonymization if session info provided
            if (sessionId && currentUserId !== undefined) {
                return name_anonymizer_service_1.NameAnonymizerService.anonymizeUserList(sessionId, currentUserId, leaderboardEntries);
            }
            return leaderboardEntries;
        });
    }
    // Method to invalidate cache when scores are updated
    static invalidateCache(taskId) {
        Cache.delete('overall_leaderboard');
        if (taskId) {
            Cache.delete(`task_leaderboard_${taskId}`);
        }
    }
    // Method to clear all cache (useful for testing)
    static clearAllCache() {
        Cache.clear();
    }
}
exports.LeaderboardService = LeaderboardService;
