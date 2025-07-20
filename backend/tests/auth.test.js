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
const auth_routes_1 = __importDefault(require("../src/routes/auth.routes"));
const errorHandler_1 = require("../src/middleware/errorHandler");
const testHelpers_1 = require("./utils/testHelpers");
// Create test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/api/auth', auth_routes_1.default);
app.use(errorHandler_1.errorHandler);
describe('Authentication API', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, testHelpers_1.cleanDatabase)();
    }));
    describe('POST /api/auth/signup', () => {
        it('should create a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);
            expect(response.body.message).toBe('User created successfully');
            expect(response.body.user).toMatchObject({
                username: userData.username,
                email: userData.email
            });
            expect(response.body.user.id).toBeDefined();
            expect(response.body.token).toBeDefined();
            expect(response.body.user.passwordHash).toBeUndefined(); // Should not expose password
        }));
        it('should reject duplicate email', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                username: 'testuser1',
                email: 'test@example.com',
                password: 'password123'
            };
            // Create first user
            yield (0, supertest_1.default)(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);
            // Try to create second user with same email
            const duplicateData = {
                username: 'testuser2',
                email: 'test@example.com',
                password: 'password456'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/signup')
                .send(duplicateData)
                .expect(400);
            expect(response.body.error).toContain('Email already registered');
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/signup')
                .send({})
                .expect(400);
            expect(response.body.error).toBeDefined();
        }));
        it('should validate email format', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'password123'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);
            expect(response.body.error).toContain('valid email');
        }));
        it('should validate password length', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: '123' // Too short
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(400);
            expect(response.body.error).toContain('Password must be at least 6 characters long');
        }));
    });
    describe('POST /api/auth/login', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a test user for login tests
            yield (0, testHelpers_1.createTestUser)({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
        }));
        it('should login successfully with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.user).toMatchObject({
                username: 'testuser',
                email: 'test@example.com'
            });
            expect(response.body.token).toBeDefined();
            expect(response.body.user.passwordHash).toBeUndefined();
        }));
        it('should reject invalid email', () => __awaiter(void 0, void 0, void 0, function* () {
            const loginData = {
                email: 'wrong@example.com',
                password: 'password123'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            expect(response.body.error).toBe('Invalid email or password');
        }));
        it('should reject invalid password', () => __awaiter(void 0, void 0, void 0, function* () {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            expect(response.body.error).toBe('Invalid email or password');
        }));
        it('should validate required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({})
                .expect(400);
            expect(response.body.error).toBeDefined();
        }));
    });
});
