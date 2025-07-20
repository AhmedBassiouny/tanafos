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
const progress_routes_1 = __importDefault(require("../src/routes/progress.routes"));
const errorHandler_1 = require("../src/middleware/errorHandler");
const testHelpers_1 = require("./utils/testHelpers");
const library_1 = require("@prisma/client/runtime/library");
// Create test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api/progress', progress_routes_1.default);
app.use(errorHandler_1.errorHandler);
describe('Progress API', () => {
    let testUser;
    let testTask;
    let authToken;
    let authHeaders;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelpers_1.cleanDatabase)();
        testUser = yield (0, testHelpers_1.createTestUser)();
        testTask = yield (0, testHelpers_1.createTestTask)({
            name: 'Exercise',
            unit: 'minutes',
            pointsPerUnit: 1
        });
        authToken = (0, testHelpers_1.generateAuthToken)(testUser.id, testUser.email);
        authHeaders = (0, testHelpers_1.createAuthHeaders)(authToken);
    }));
    describe('POST /api/progress', () => {
        it('should log progress successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const progressData = {
                taskId: testTask.id,
                value: 30
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send(progressData)
                .expect(201);
            expect(response.body.message).toBe('Progress logged successfully');
            expect(response.body.progress).toMatchObject({
                taskId: testTask.id,
                value: 30,
                pointsEarned: 30 // 30 * 1 pointsPerUnit
            });
            expect(response.body.progress.task.name).toBe('Exercise');
        }));
        it('should calculate points correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const task2 = yield (0, testHelpers_1.createTestTask)({
                name: 'Reading',
                unit: 'pages',
                pointsPerUnit: 2
            });
            const progressData = {
                taskId: task2.id,
                value: 15
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send(progressData)
                .expect(201);
            expect(response.body.progress.pointsEarned).toBe(30); // 15 * 2
        }));
        it('should prevent duplicate progress for same day', () => __awaiter(void 0, void 0, void 0, function* () {
            const progressData = {
                taskId: testTask.id,
                value: 30
            };
            // Log progress first time
            yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send(progressData)
                .expect(201);
            // Try to log again on same day
            const response = yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send(progressData)
                .expect(400);
            expect(response.body.error).toBe('Progress already logged for this task today');
        }));
        it('should update user scores', () => __awaiter(void 0, void 0, void 0, function* () {
            const progressData = {
                taskId: testTask.id,
                value: 25
            };
            yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send(progressData)
                .expect(201);
            // Check task-specific score
            const taskScore = yield testHelpers_1.prisma.userScore.findFirst({
                where: {
                    userId: testUser.id,
                    taskId: testTask.id
                }
            });
            expect(taskScore).toMatchObject({
                totalPoints: 25,
                totalValue: new library_1.Decimal(25)
            });
            // Check overall score
            const overallScore = yield testHelpers_1.prisma.userScore.findFirst({
                where: {
                    userId: testUser.id,
                    taskId: null
                }
            });
            expect(overallScore).toMatchObject({
                totalPoints: 25
            });
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const progressData = {
                taskId: testTask.id,
                value: 30
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .send(progressData)
                .expect(401);
            expect(response.body.error).toBe('Authentication token is required');
        }));
        it('should validate task exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const progressData = {
                taskId: 99999, // Non-existent task
                value: 30
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send(progressData)
                .expect(404);
            expect(response.body.error).toBe('Task not found or inactive');
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send({})
                .expect(400);
            expect(response.body.error).toBeDefined();
        }));
        it('should validate positive values', () => __awaiter(void 0, void 0, void 0, function* () {
            const progressData = {
                taskId: testTask.id,
                value: -5 // Negative value
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send(progressData)
                .expect(400);
            expect(response.body.error).toContain('greater than 0');
        }));
    });
    describe('GET /api/progress/today', () => {
        it('should return empty array when no progress logged today', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/progress/today')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toEqual([]);
        }));
        it('should return today\'s progress', () => __awaiter(void 0, void 0, void 0, function* () {
            // Log some progress
            yield (0, supertest_1.default)(app)
                .post('/api/progress')
                .set(authHeaders)
                .send({
                taskId: testTask.id,
                value: 30
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/progress/today')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                taskId: testTask.id,
                taskName: 'Exercise',
                taskUnit: 'minutes',
                value: 30,
                pointsEarned: 30
            });
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/progress/today')
                .expect(401);
            expect(response.body.error).toBe('Authentication token is required');
        }));
    });
});
