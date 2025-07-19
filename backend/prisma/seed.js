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
const client_1 = require("@prisma/client");
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
                    pointsPerUnit: 1,
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
                    pointsPerUnit: 1,
                    displayOrder: 4,
                },
            }),
            prisma.task.create({
                data: {
                    name: 'Sleep',
                    unit: 'hours',
                    pointsPerUnit: 1,
                    displayOrder: 5,
                },
            }),
        ]);
        console.log(`Created ${tasks.length} tasks`);
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
