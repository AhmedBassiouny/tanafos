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
const leaderboard_service_1 = require("../services/leaderboard.service");
const router = (0, express_1.Router)();
// All leaderboard routes require authentication
router.use(auth_1.authenticate);
// GET /api/leaderboard - Overall leaderboard
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const leaderboard = yield leaderboard_service_1.LeaderboardService.getOverallLeaderboard(req.sessionId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        res.json(leaderboard);
    }
    catch (error) {
        next(error);
    }
}));
// GET /api/leaderboard/:taskId - Task-specific leaderboard
router.get('/:taskId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const taskId = parseInt(req.params.taskId);
        if (isNaN(taskId)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }
        const leaderboard = yield leaderboard_service_1.LeaderboardService.getTaskLeaderboard(taskId, req.sessionId, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        res.json(leaderboard);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
