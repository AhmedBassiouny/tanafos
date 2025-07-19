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
const progress_service_1 = require("../services/progress.service");
const validation_1 = require("../utils/validation");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// All progress routes require authentication
router.use(auth_1.authenticate);
// POST /api/progress - Log progress
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const validatedData = validation_1.Validator.validateProgress(req.body);
        // Log progress
        const result = yield progress_service_1.ProgressService.logProgress(req.user.userId, validatedData);
        res.status(201).json({
            message: 'Progress logged successfully',
            progress: result
        });
    }
    catch (error) {
        next(error);
    }
}));
// GET /api/progress/today - Get today's progress for current user
router.get('/today', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayProgress = yield database_1.prisma.progressLog.findMany({
            where: {
                userId: req.user.userId,
                loggedDate: today
            },
            include: {
                task: {
                    select: {
                        id: true,
                        name: true,
                        unit: true
                    }
                }
            },
            orderBy: {
                task: {
                    displayOrder: 'asc'
                }
            }
        });
        const formatted = todayProgress.map(log => ({
            id: log.id,
            taskId: log.taskId,
            taskName: log.task.name,
            taskUnit: log.task.unit,
            value: log.value.toNumber(),
            pointsEarned: log.pointsEarned,
            loggedDate: log.loggedDate
        }));
        res.json(formatted);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
