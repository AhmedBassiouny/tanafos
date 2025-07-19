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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Start seeding...');
        // Create default tasks
        const tasks = yield Promise.all([
            prisma.task.create({
                data: {
                    name: 'Exercise',
                    unit: 'minutes',
                    pointsPerUnit: 1,
                    displayOrder: 1,
                },
            }),
            prisma.task.create({
                data: {
                    name: 'Reading',
                    unit: 'pages',
                    pointsPerUnit: 2,
                    displayOrder: 2,
                },
            }),
            prisma.task.create({
                data: {
                    name: 'Water',
                    unit: 'glasses',
                    pointsPerUnit: 1,
                    displayOrder: 3,
                },
            }),
            prisma.task.create({
                data: {
                    name: 'Meditation',
                    unit: 'minutes',
                    pointsPerUnit: 2,
                    displayOrder: 4,
                },
            }),
            prisma.task.create({
                data: {
                    name: 'Sleep',
                    unit: 'hours',
                    pointsPerUnit: 3,
                    displayOrder: 5,
                },
            }),
        ]);
        console.log(`Created ${tasks.length} tasks`);
        // Create demo users
        const passwordHash = yield bcrypt_1.default.hash('demo123', 10);
        const demoUsers = yield Promise.all([
            prisma.user.create({
                data: {
                    username: 'demo1',
                    email: 'demo1@example.com',
                    passwordHash,
                },
            }),
            prisma.user.create({
                data: {
                    username: 'demo2',
                    email: 'demo2@example.com',
                    passwordHash,
                },
            }),
            prisma.user.create({
                data: {
                    username: 'demo3',
                    email: 'demo3@example.com',
                    passwordHash,
                },
            }),
            prisma.user.create({
                data: {
                    username: 'sarah_jones',
                    email: 'sarah@example.com',
                    passwordHash,
                },
            }),
            prisma.user.create({
                data: {
                    username: 'mike_chen',
                    email: 'mike@example.com',
                    passwordHash,
                },
            }),
        ]);
        console.log(`Created ${demoUsers.length} demo users`);
        // Create sample progress data for the last 30 days
        const today = new Date();
        const progressData = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            for (const user of demoUsers) {
                for (const task of tasks) {
                    // Generate random but realistic data
                    const shouldLog = Math.random() > 0.3; // 70% chance of logging
                    if (!shouldLog)
                        continue;
                    let value = 0;
                    switch (task.name) {
                        case 'Exercise':
                            value = Math.floor(Math.random() * 90) + 15; // 15-105 minutes
                            break;
                        case 'Reading':
                            value = Math.floor(Math.random() * 30) + 5; // 5-35 pages
                            break;
                        case 'Water':
                            value = Math.floor(Math.random() * 6) + 6; // 6-12 glasses
                            break;
                        case 'Meditation':
                            value = Math.floor(Math.random() * 25) + 5; // 5-30 minutes
                            break;
                        case 'Sleep':
                            value = Math.floor(Math.random() * 3) + 6; // 6-9 hours
                            break;
                    }
                    progressData.push({
                        userId: user.id,
                        taskId: task.id,
                        value,
                        pointsEarned: value * task.pointsPerUnit,
                        loggedDate: date,
                    });
                }
            }
        }
        // Insert progress data in batches
        const batchSize = 100;
        for (let i = 0; i < progressData.length; i += batchSize) {
            const batch = progressData.slice(i, i + batchSize);
            yield prisma.progressLog.createMany({
                data: batch,
                skipDuplicates: true,
            });
        }
        console.log(`Created ${progressData.length} progress entries`);
        // Calculate and create user scores
        for (const user of demoUsers) {
            // Calculate overall score
            const overallStats = yield prisma.progressLog.aggregate({
                where: { userId: user.id },
                _sum: {
                    pointsEarned: true,
                    value: true,
                },
            });
            yield prisma.userScore.create({
                data: {
                    userId: user.id,
                    taskId: null, // null means overall score
                    totalPoints: overallStats._sum.pointsEarned || 0,
                    totalValue: overallStats._sum.value || 0,
                },
            });
            // Calculate task-specific scores
            for (const task of tasks) {
                const taskStats = yield prisma.progressLog.aggregate({
                    where: {
                        userId: user.id,
                        taskId: task.id,
                    },
                    _sum: {
                        pointsEarned: true,
                        value: true,
                    },
                });
                if (taskStats._sum.pointsEarned) {
                    yield prisma.userScore.create({
                        data: {
                            userId: user.id,
                            taskId: task.id,
                            totalPoints: taskStats._sum.pointsEarned || 0,
                            totalValue: taskStats._sum.value || 0,
                        },
                    });
                }
            }
        }
        console.log('Calculated user scores');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
