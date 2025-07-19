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
const task_routes_1 = __importDefault(require("../src/routes/task.routes"));
const errorHandler_1 = require("../src/middleware/errorHandler");
const testHelpers_1 = require("./utils/testHelpers");
// Create test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api/tasks', task_routes_1.default);
app.use(errorHandler_1.errorHandler);
describe('Tasks API', () => {
    let testUser;
    let authToken;
    let authHeaders;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelpers_1.cleanDatabase)();
        testUser = yield (0, testHelpers_1.createTestUser)();
        authToken = (0, testHelpers_1.generateAuthToken)(testUser.id, testUser.email);
        authHeaders = (0, testHelpers_1.createAuthHeaders)(authToken);
    }));
    describe('GET /api/tasks', () => {
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/tasks')
                .expect(401);
            expect(response.body.error).toBe('Authentication token is required');
        }));
        it('should return empty array when no tasks exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/tasks')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toEqual([]);
        }));
        it('should return tasks ordered by displayOrder', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create test tasks
            const task1 = yield (0, testHelpers_1.createTestTask)({
                name: 'Task B',
                displayOrder: 2
            });
            const task2 = yield (0, testHelpers_1.createTestTask)({
                name: 'Task A',
                displayOrder: 1
            });
            const task3 = yield (0, testHelpers_1.createTestTask)({
                name: 'Task C',
                displayOrder: 3
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/tasks')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toHaveLength(3);
            expect(response.body[0].name).toBe('Task A');
            expect(response.body[1].name).toBe('Task B');
            expect(response.body[2].name).toBe('Task C');
        }));
        it('should only return active tasks', () => __awaiter(void 0, void 0, void 0, function* () {
            const activeTask = yield (0, testHelpers_1.createTestTask)({
                name: 'Active Task',
                isActive: true
            });
            const inactiveTask = yield (0, testHelpers_1.createTestTask)({
                name: 'Inactive Task',
                isActive: false
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/tasks')
                .set(authHeaders)
                .expect(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].name).toBe('Active Task');
        }));
    });
    describe('GET /api/tasks/:id', () => {
        it('should return specific task by id', () => __awaiter(void 0, void 0, void 0, function* () {
            const task = yield (0, testHelpers_1.createTestTask)({
                name: 'Specific Task',
                unit: 'minutes',
                pointsPerUnit: 2
            });
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/tasks/${task.id}`)
                .set(authHeaders)
                .expect(200);
            expect(response.body).toMatchObject({
                id: task.id,
                name: 'Specific Task',
                unit: 'minutes',
                pointsPerUnit: 2
            });
        }));
        it('should return 404 for non-existent task', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/tasks/99999')
                .set(authHeaders)
                .expect(404);
            expect(response.body.error).toBe('Task not found');
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const task = yield (0, testHelpers_1.createTestTask)();
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/tasks/${task.id}`)
                .expect(401);
            expect(response.body.error).toBe('Authentication token is required');
        }));
    });
});
