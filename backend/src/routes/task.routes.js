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
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/tasks - Get all active tasks
router.get('/', auth_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield database_1.prisma.task.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            select: {
                id: true,
                name: true,
                unit: true,
                pointsPerUnit: true,
                displayOrder: true
            }
        });
        res.json(tasks);
    }
    catch (error) {
        next(error);
    }
}));
// GET /api/tasks/:id - Get single task
router.get('/:id', auth_1.authenticate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = parseInt(req.params.id);
        if (isNaN(taskId)) {
            res.status(400).json({ error: 'Invalid task ID' });
            return;
        }
        const task = yield database_1.prisma.task.findUnique({
            where: { id: taskId }
        });
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json(task);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
