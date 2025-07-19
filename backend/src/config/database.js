"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const index_1 = require("./index");
// Prevent multiple instances during development hot-reload
exports.prisma = global.prisma || new client_1.PrismaClient({
    log: index_1.config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (index_1.config.nodeEnv !== 'production') {
    global.prisma = exports.prisma;
}
