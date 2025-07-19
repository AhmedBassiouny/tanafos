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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.cleanDatabase = exports.createAuthHeaders = exports.generateAuthToken = exports.createTestTask = exports.createTestUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../src/config");
const setup_1 = require("../setup");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return setup_1.prisma; } });
const leaderboard_service_1 = require("../../src/services/leaderboard.service");
const createTestUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const defaultData = {
        username: `testuser_${timestamp}_${random}`,
        email: `test_${timestamp}_${random}@example.com`,
        password: 'password123'
    };
    const data = Object.assign(Object.assign({}, defaultData), userData);
    const passwordHash = yield bcrypt_1.default.hash(data.password, 10);
    return setup_1.prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            passwordHash
        }
    });
});
exports.createTestUser = createTestUser;
const createTestTask = (taskData) => __awaiter(void 0, void 0, void 0, function* () {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const defaultData = {
        name: `Test Task ${timestamp}_${random}`,
        unit: 'units',
        pointsPerUnit: 1,
        displayOrder: 1,
        isActive: true
    };
    const data = Object.assign(Object.assign({}, defaultData), taskData);
    return setup_1.prisma.task.create({ data });
});
exports.createTestTask = createTestTask;
const generateAuthToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ userId, email }, config_1.config.jwtSecret, { expiresIn: '7d' });
};
exports.generateAuthToken = generateAuthToken;
const createAuthHeaders = (token) => ({
    Authorization: `Bearer ${token}`
});
exports.createAuthHeaders = createAuthHeaders;
const cleanDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    // Delete in order to respect foreign key constraints
    yield setup_1.prisma.progressLog.deleteMany();
    yield setup_1.prisma.userScore.deleteMany();
    yield setup_1.prisma.user.deleteMany();
    yield setup_1.prisma.task.deleteMany();
    // Reset auto-increment sequences to avoid ID conflicts
    yield setup_1.prisma.$executeRaw `TRUNCATE TABLE progress_logs RESTART IDENTITY CASCADE`;
    yield setup_1.prisma.$executeRaw `TRUNCATE TABLE user_scores RESTART IDENTITY CASCADE`;
    yield setup_1.prisma.$executeRaw `TRUNCATE TABLE users RESTART IDENTITY CASCADE`;
    yield setup_1.prisma.$executeRaw `TRUNCATE TABLE tasks RESTART IDENTITY CASCADE`;
    // Clear cache to ensure fresh data
    leaderboard_service_1.LeaderboardService.clearAllCache();
});
exports.cleanDatabase = cleanDatabase;
