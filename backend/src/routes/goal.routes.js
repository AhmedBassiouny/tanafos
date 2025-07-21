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
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const goal_service_1 = require("../services/goal.service");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// All goal routes require authentication
router.use(auth_1.authenticate);
// GET /api/goals/daily - Get current daily goals with progress for authenticated user
router.get('/daily', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, timezone } = req.query;
        // Validate optional parameters
        let parsedDate;
        if (date) {
            parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                throw new errorHandler_1.AppError('Invalid date format. Use YYYY-MM-DD format.', 400);
            }
        }
        if (timezone && !goal_service_1.GoalService.isValidTimezone(timezone)) {
            throw new errorHandler_1.AppError('Invalid timezone format. Must be a valid IANA timezone identifier.', 400);
        }
        const result = yield goal_service_1.GoalService.getDailyGoalsForUser(req.user.userId, parsedDate, timezone);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
}));
// GET /api/goals/history - Get historical goal achievement data
router.get('/history', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, taskId, limit = '30', offset = '0' } = req.query;
        // Validate parameters
        let parsedStartDate;
        let parsedEndDate;
        let parsedTaskId;
        let parsedLimit = parseInt(limit);
        let parsedOffset = parseInt(offset);
        if (startDate) {
            parsedStartDate = new Date(startDate);
            if (isNaN(parsedStartDate.getTime())) {
                throw new errorHandler_1.AppError('Invalid start date format. Use YYYY-MM-DD format.', 400);
            }
        }
        if (endDate) {
            parsedEndDate = new Date(endDate);
            if (isNaN(parsedEndDate.getTime())) {
                throw new errorHandler_1.AppError('Invalid end date format. Use YYYY-MM-DD format.', 400);
            }
        }
        if (taskId) {
            parsedTaskId = parseInt(taskId);
            if (isNaN(parsedTaskId)) {
                throw new errorHandler_1.AppError('Invalid task ID. Must be a number.', 400);
            }
        }
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            parsedLimit = 30;
        }
        if (isNaN(parsedOffset) || parsedOffset < 0) {
            parsedOffset = 0;
        }
        const result = yield goal_service_1.GoalService.getGoalHistory(req.user.userId, parsedStartDate, parsedEndDate, parsedTaskId, parsedLimit, parsedOffset);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
}));
// GET /api/goals/analytics - Get goal completion analytics for community insights
router.get('/analytics', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { period = '7d', taskId } = req.query;
        // Validate period parameter
        const validPeriods = ['1d', '7d', '30d', '90d'];
        if (!validPeriods.includes(period)) {
            throw new errorHandler_1.AppError('Invalid period. Must be one of: 1d, 7d, 30d, 90d', 400);
        }
        let parsedTaskId;
        if (taskId) {
            parsedTaskId = parseInt(taskId);
            if (isNaN(parsedTaskId)) {
                throw new errorHandler_1.AppError('Invalid task ID. Must be a number.', 400);
            }
        }
        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();
        switch (period) {
            case '1d':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
        }
        // For now, return mock analytics data as the design document indicates
        // this will be implemented in Phase 3
        const mockAnalytics = {
            period: period,
            globalStats: {
                totalActiveUsers: 1250,
                averageGoalsCompleted: 3.2,
                topPerformingTask: {
                    taskId: 2,
                    taskName: "Prayer on Time",
                    completionRate: 89.5
                }
            },
            taskBreakdown: [
                {
                    taskId: 2,
                    taskName: "Prayer on Time",
                    targetValue: 5.0,
                    averageCompletion: 4.7,
                    completionRate: 89.5,
                    totalCompletions: 1119
                },
                {
                    taskId: 1,
                    taskName: "Quran Reading",
                    targetValue: 2.0,
                    averageCompletion: 1.8,
                    completionRate: 78.2,
                    totalCompletions: 978
                }
            ],
            trends: {
                dailyCompletionRates: [85.2, 87.1, 89.5, 91.2, 88.8, 90.1, 89.5]
            }
        };
        res.json({
            success: true,
            data: mockAnalytics
        });
    }
    catch (error) {
        next(error);
    }
}));
// PUT /api/goals/timezone - Update user's timezone setting
router.put('/timezone', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const { timezone } = req.body;
        if (!timezone || typeof timezone !== 'string') {
            throw new errorHandler_1.AppError('Timezone is required and must be a string.', 400);
        }
        const result = yield goal_service_1.GoalService.updateUserTimezone(req.user.userId, timezone);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
