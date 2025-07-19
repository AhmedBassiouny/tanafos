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
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tanafos_test'
        }
    }
});
exports.prisma = prisma;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Connect to test database
    yield prisma.$connect();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clean up and disconnect
    yield prisma.$disconnect();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clean database before each test - use TRUNCATE for complete cleanup
    yield prisma.$executeRaw `TRUNCATE TABLE progress_logs RESTART IDENTITY CASCADE`;
    yield prisma.$executeRaw `TRUNCATE TABLE user_scores RESTART IDENTITY CASCADE`;
    yield prisma.$executeRaw `TRUNCATE TABLE users RESTART IDENTITY CASCADE`;
    yield prisma.$executeRaw `TRUNCATE TABLE tasks RESTART IDENTITY CASCADE`;
}));
