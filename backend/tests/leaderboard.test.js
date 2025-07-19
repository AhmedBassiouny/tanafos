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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const leaderboard_routes_1 = __importDefault(require("../src/routes/leaderboard.routes"));
const errorHandler_1 = require("../src/middleware/errorHandler");
const leaderboard_service_1 = require("../src/services/leaderboard.service");
const testHelpers_1 = require("./utils/testHelpers");
// Create test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api/leaderboard', leaderboard_routes_1.default);
app.use(errorHandler_1.errorHandler);
describe('Leaderboard API', () => {
    let user1, user2, user3;
    let testTask;
    let authToken;
    let authHeaders;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelpers_1.cleanDatabase)();
        // Create test users
        user1 = yield (0, testHelpers_1.createTestUser)({ username: 'user1', email: 'user1@test.com' });
        user2 = yield (0, testHelpers_1.createTestUser)({ username: 'user2', email: 'user2@test.com' });
        user3 = yield (0, testHelpers_1.createTestUser)({ username: 'user3', email: 'user3@test.com' });
        testTask = yield (0, testHelpers_1.createTestTask)({
            name: 'Exercise',
            unit: 'minutes',
            pointsPerUnit: 1
        });
        authToken = (0, testHelpers_1.generateAuthToken)(user1.id, user1.email);
        authHeaders = (0, testHelpers_1.createAuthHeaders)(authToken);
        // Create some user scores for testing
        yield testHelpers_1.prisma.userScore.createMany({
            data: [
                // Overall scores
                { userId: user1.id, taskId: null, totalPoints: 100, totalValue: 0 },
                { userId: user2.id, taskId: null, totalPoints: 200, totalValue: 0 },
                { userId: user3.id, taskId: null, totalPoints: 150, totalValue: 0 },
                // Task-specific scores
                { userId: user1.id, taskId: testTask.id, totalPoints: 50, totalValue: 50 },
                { userId: user2.id, taskId: testTask.id, totalPoints: 75, totalValue: 75 },
                { userId: user3.id, taskId: testTask.id, totalPoints: 60, totalValue: 60 },
            ]
        });
    }));
    describe('GET /api/leaderboard', () => {
        it('should return overall leaderboard ordered by points', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/leaderboard')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toHaveLength(3);
            // Should be ordered by totalPoints descending
            expect(response.body[0]).toMatchObject({
                rank: 1,
                userId: user2.id,
                totalPoints: 200
            });
            expect(response.body[1]).toMatchObject({
                rank: 2,
                userId: user3.id,
                totalPoints: 150
            });
            expect(response.body[2]).toMatchObject({
                rank: 3,
                userId: user1.id,
                totalPoints: 100
            });
        }));
        it('should include usernames in leaderboard', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/leaderboard')
                .set(authHeaders)
                .expect(200);
            expect(response.body[0].username).toBeDefined();
            expect(typeof response.body[0].username).toBe('string');
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/leaderboard')
                .expect(401);
            expect(response.body.error).toBe('Authentication token is required');
        }));
        it('should handle empty leaderboard', () => __awaiter(void 0, void 0, void 0, function* () {
            // Clean all scores and cache
            yield testHelpers_1.prisma.userScore.deleteMany();
            leaderboard_service_1.LeaderboardService.clearAllCache();
            const response = yield (0, supertest_1.default)(app)
                .get('/api/leaderboard')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toEqual([]);
        }));
    });
    describe('GET /api/leaderboard/:taskId', () => {
        it('should return task-specific leaderboard', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/leaderboard/${testTask.id}`)
                .set(authHeaders)
                .expect(200);
            expect(response.body).toHaveLength(3);
            // Should be ordered by totalPoints descending
            expect(response.body[0]).toMatchObject({
                rank: 1,
                userId: user2.id,
                totalPoints: 75,
                totalValue: 75
            });
            expect(response.body[1]).toMatchObject({
                rank: 2,
                userId: user3.id,
                totalPoints: 60,
                totalValue: 60
            });
            expect(response.body[2]).toMatchObject({
                rank: 3,
                userId: user1.id,
                totalPoints: 50,
                totalValue: 50
            });
        }));
        it('should return 404 for non-existent task', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/leaderboard/99999')
                .set(authHeaders)
                .expect(404);
            expect(response.body.error).toBe('Task not found');
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/leaderboard/${testTask.id}`)
                .expect(401);
            expect(response.body.error).toBe('Authentication token is required');
        }));
        it('should handle invalid task id', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/leaderboard/invalid')
                .set(authHeaders)
                .expect(400);
            expect(response.body.error).toBe('Invalid task ID');
        }));
        it('should handle empty task leaderboard', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create task with no scores
            const emptyTask = yield (0, testHelpers_1.createTestTask)({ name: 'Empty Task' });
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/leaderboard/${emptyTask.id}`)
                .set(authHeaders)
                .expect(200);
            expect(response.body).toEqual([]);
        }));
    });
});
