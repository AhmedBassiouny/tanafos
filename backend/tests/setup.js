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
const prisma = new client_1.PrismaClient();
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
    // Clean database before each test - use deleteMany to avoid deadlocks
    try {
        yield prisma.progressLog.deleteMany();
        yield prisma.userScore.deleteMany();
        yield prisma.user.deleteMany();
        yield prisma.task.deleteMany();
    }
    catch (error) {
        console.warn('Warning: Could not clean all tables. Some may not exist yet:', error);
        // Try to clean tables that do exist
        try {
            yield prisma.user.deleteMany();
        }
        catch (_a) { }
        try {
            yield prisma.task.deleteMany();
        }
        catch (_b) { }
    }
}));
