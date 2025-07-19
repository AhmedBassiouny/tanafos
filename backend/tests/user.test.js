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
const user_routes_1 = __importDefault(require("../src/routes/user.routes"));
const errorHandler_1 = require("../src/middleware/errorHandler");
const testHelpers_1 = require("./utils/testHelpers");
// Create test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api/user', user_routes_1.default);
app.use(errorHandler_1.errorHandler);
describe('User API', () => {
    let testUser;
    let testTask1, testTask2;
    let authToken;
    let authHeaders;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelpers_1.cleanDatabase)();
        testUser = yield (0, testHelpers_1.createTestUser)({
            username: 'testuser',
            email: 'test@example.com'
        });
        testTask1 = yield (0, testHelpers_1.createTestTask)({
            name: 'Exercise',
            unit: 'minutes',
            pointsPerUnit: 1
        });
        testTask2 = yield (0, testHelpers_1.createTestTask)({
            name: 'Reading',
            unit: 'pages',
            pointsPerUnit: 2
        });
        authToken = (0, testHelpers_1.generateAuthToken)(testUser.id, testUser.email);
        authHeaders = (0, testHelpers_1.createAuthHeaders)(authToken);
        // Create some user scores
        yield testHelpers_1.prisma.userScore.createMany({
            data: [
                // Overall score
                { userId: testUser.id, taskId: null, totalPoints: 130, totalValue: 0 },
                // Task-specific scores
                { userId: testUser.id, taskId: testTask1.id, totalPoints: 90, totalValue: 90 },
                { userId: testUser.id, taskId: testTask2.id, totalPoints: 40, totalValue: 20 },
            ]
        });
    }));
    describe('GET /api/user/stats', () => {
        it('should return user statistics', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/user/stats')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toMatchObject({
                userId: testUser.id,
                username: 'testuser',
                totalPoints: 130
            });
            expect(response.body.taskStats).toHaveLength(2);
            // Check task stats contain correct data
            const exerciseStats = response.body.taskStats.find((stat) => stat.taskName === 'Exercise');
            expect(exerciseStats).toMatchObject({
                taskId: testTask1.id,
                taskName: 'Exercise',
                totalValue: 90,
                totalPoints: 90
            });
            const readingStats = response.body.taskStats.find((stat) => stat.taskName === 'Reading');
            expect(readingStats).toMatchObject({
                taskId: testTask2.id,
                taskName: 'Reading',
                totalValue: 20,
                totalPoints: 40
            });
        }));
        it('should return zero stats for new user', () => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = yield (0, testHelpers_1.createTestUser)({
                username: 'newuser',
                email: 'new@example.com'
            });
            const newAuthToken = (0, testHelpers_1.generateAuthToken)(newUser.id, newUser.email);
            const newAuthHeaders = (0, testHelpers_1.createAuthHeaders)(newAuthToken);
            const response = yield (0, supertest_1.default)(app)
                .get('/api/user/stats')
                .set(newAuthHeaders)
                .expect(200);
            expect(response.body).toMatchObject({
                userId: newUser.id,
                username: 'newuser',
                totalPoints: 0,
                taskStats: []
            });
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/user/stats')
                .expect(401);
            expect(response.body.error).toBe('Authentication token is required');
        }));
        it('should handle invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/user/stats')
                .set({ Authorization: 'Bearer invalid_token' })
                .expect(401);
            expect(response.body.error).toBe('Invalid token');
        }));
    });
    describe('GET /api/user/profile', () => {
        it('should return user profile', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/user/profile')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toMatchObject({
                id: testUser.id,
                username: 'testuser',
                email: 'test@example.com'
            });
            // Should not include sensitive data
            expect(response.body.passwordHash).toBeUndefined();
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/user/profile')
                .expect(401);
            expect(response.body.error).toBe('Authentication token is required');
        }));
        it('should handle deleted user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Delete the user
            yield testHelpers_1.prisma.user.delete({
                where: { id: testUser.id }
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/user/profile')
                .set(authHeaders)
                .expect(404);
            expect(response.body.error).toBe('User not found');
        }));
    });
});
