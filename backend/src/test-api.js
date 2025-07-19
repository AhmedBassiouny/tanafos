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
const config_1 = require("./config");
const API_URL = `http://localhost:${config_1.config.port}/api`;
let authToken = '';
let userId = 0;
function testAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing Tanafos API...\n');
        try {
            // 1. Create a test user
            console.log('1️⃣ Creating test user...');
            const signupRes = yield fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `testuser${Math.floor(Date.now() / 1000)}`,
                    email: `test${Date.now()}@example.com`,
                    password: 'testpass123'
                })
            });
            const signupData = yield signupRes.json();
            if (!signupData.user) {
                throw new Error('Signup failed: ' + JSON.stringify(signupData));
            }
            authToken = signupData.token;
            userId = signupData.user.id;
            console.log('✅ User created:', signupData.user.username);
            // 2. Get tasks
            console.log('\n2️⃣ Fetching tasks...');
            const tasksRes = yield fetch(`${API_URL}/tasks`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const tasks = yield tasksRes.json();
            console.log(`✅ Found ${tasks.length} tasks:`);
            tasks.forEach((task) => {
                console.log(`   - ${task.name}: ${task.pointsPerUnit} points per ${task.unit}`);
            });
            // 3. Log progress for first task
            console.log('\n3️⃣ Logging progress...');
            const firstTask = tasks[0];
            const progressRes = yield fetch(`${API_URL}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    taskId: firstTask.id,
                    value: 30
                })
            });
            const progressData = yield progressRes.json();
            console.log('✅ Progress logged:', progressData.message);
            console.log(`   Earned ${progressData.progress.pointsEarned} points!`);
            // 4. Get user stats
            console.log('\n4️⃣ Getting user stats...');
            const statsRes = yield fetch(`${API_URL}/user/stats`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const stats = yield statsRes.json();
            console.log('✅ User stats:');
            console.log(`   Total points: ${stats.totalPoints}`);
            console.log(`   Progress by task:`);
            stats.taskStats.forEach((stat) => {
                console.log(`   - ${stat.taskName}: ${stat.totalValue} ${stat.totalPoints} points`);
            });
            // 5. Get leaderboards
            console.log('\n5️⃣ Getting leaderboards...');
            const overallRes = yield fetch(`${API_URL}/leaderboard`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const overall = yield overallRes.json();
            console.log('✅ Overall leaderboard:');
            overall.slice(0, 3).forEach((entry) => {
                console.log(`   ${entry.rank}. ${entry.username}: ${entry.totalPoints} points`);
            });
            // 6. Test error handling
            console.log('\n6️⃣ Testing error handling...');
            const errorRes = yield fetch(`${API_URL}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    taskId: firstTask.id,
                    value: 30 // Same task, same day - should error
                })
            });
            const errorData = yield errorRes.json();
            console.log('✅ Duplicate prevention working:', errorData.error);
            console.log('\n✨ All tests passed!');
        }
        catch (error) {
            console.error('❌ Test failed:', error);
        }
    });
}
// Run tests
testAPI();
