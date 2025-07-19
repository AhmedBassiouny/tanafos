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
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    // Hash password before storing
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = 10;
            return bcrypt_1.default.hash(password, saltRounds);
        });
    }
    // Verify password during login
    static verifyPassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.compare(password, hash);
        });
    }
    // Generate JWT token
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, {
            expiresIn: '7d' // Token expires in 7 days
        });
    }
    // Verify JWT token
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
    }
    // Signup new user
    static signup(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if user already exists
            const existingUser = yield database_1.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: data.email },
                        { username: data.username }
                    ]
                }
            });
            if (existingUser) {
                if (existingUser.email === data.email) {
                    throw new errorHandler_1.AppError('Email already registered', 400);
                }
                throw new errorHandler_1.AppError('Username already taken', 400);
            }
            // Hash password
            const passwordHash = yield this.hashPassword(data.password);
            // Create user
            const user = yield database_1.prisma.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    passwordHash
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    createdAt: true
                }
            });
            // Generate token
            const token = this.generateToken({
                userId: user.id,
                email: user.email
            });
            return { user, token };
        });
    }
    // Login existing user
    static login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find user by email
            const user = yield database_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (!user) {
                throw new errorHandler_1.AppError('Invalid email or password', 401);
            }
            // Verify password
            const isValidPassword = yield this.verifyPassword(data.password, user.passwordHash);
            if (!isValidPassword) {
                throw new errorHandler_1.AppError('Invalid email or password', 401);
            }
            // Generate token
            const token = this.generateToken({
                userId: user.id,
                email: user.email
            });
            return {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token
            };
        });
    }
}
exports.AuthService = AuthService;
