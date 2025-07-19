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
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_1.authenticate);
// GET /api/user/stats - Get current user's statistics
router.get('/stats', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield progress_service_1.ProgressService.getUserStats(req.user.userId);
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
}));
// GET /api/user/profile - Get current user's profile
router.get('/profile', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield database_1.prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
