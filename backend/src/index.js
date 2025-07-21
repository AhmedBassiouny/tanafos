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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const database_1 = require("./config/database");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const progress_routes_1 = __importDefault(require("./routes/progress.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const debug_routes_1 = __importDefault(require("./routes/debug.routes"));
const goal_routes_1 = __importDefault(require("./routes/goal.routes"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// CORS configuration
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
    exposedHeaders: ['x-session-id'],
    credentials: true,
    optionsSuccessStatus: 200
}));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.config.nodeEnv
    });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/progress', progress_routes_1.default);
app.use('/api/leaderboard', leaderboard_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/goals', goal_routes_1.default);
app.use('/api/debug', debug_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
const server = app.listen(config_1.config.port, () => {
    console.log(`Server running at http://localhost:${config_1.config.port}`);
    console.log(`Environment: ${config_1.config.nodeEnv}`);
    console.log('Available routes:');
    console.log('  - POST   /api/auth/signup');
    console.log('  - POST   /api/auth/login');
    console.log('  - GET    /api/tasks');
    console.log('  - POST   /api/progress');
    console.log('  - GET    /api/leaderboard');
    console.log('  - GET    /api/user/stats');
});
// Graceful shutdown
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close();
    yield database_1.prisma.$disconnect();
    process.exit(0);
}));
