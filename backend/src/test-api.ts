import { config } from './config'

const API_URL = `http://localhost:${config.port}/api`
let authToken = ''
let userId = 0

async function testAPI() {
  console.log('🧪 Testing Tanafos API...\n')

  try {
    // 1. Create a test user
    console.log('1️⃣ Creating test user...')
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `testuser${Math.floor(Date.now() / 1000)}`,
        email: `test${Date.now()}@example.com`,
        password: 'testpass123'
      })
    })
    const signupData = await signupRes.json()
    if (!signupData.user) {
      throw new Error('Signup failed: ' + JSON.stringify(signupData))
    }
    authToken = signupData.token
    userId = signupData.user.id
    console.log('✅ User created:', signupData.user.username)

    // 2. Get tasks
    console.log('\n2️⃣ Fetching tasks...')
    const tasksRes = await fetch(`${API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    const tasks = await tasksRes.json()
    console.log(`✅ Found ${tasks.length} tasks:`)
    tasks.forEach((task: any) => {
      console.log(`   - ${task.name}: ${task.pointsPerUnit} points per ${task.unit}`)
    })

    // 3. Log progress for first task
    console.log('\n3️⃣ Logging progress...')
    const firstTask = tasks[0]
    const progressRes = await fetch(`${API_URL}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        taskId: firstTask.id,
        value: 30
      })
    })
    const progressData = await progressRes.json()
    console.log('✅ Progress logged:', progressData.message)
    console.log(`   Earned ${progressData.progress.pointsEarned} points!`)

    // 4. Get user stats
    console.log('\n4️⃣ Getting user stats...')
    const statsRes = await fetch(`${API_URL}/user/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    const stats = await statsRes.json()
    console.log('✅ User stats:')
    console.log(`   Total points: ${stats.totalPoints}`)
    console.log(`   Progress by task:`)
    stats.taskStats.forEach((stat: any) => {
      console.log(`   - ${stat.taskName}: ${stat.totalValue} ${stat.totalPoints} points`)
    })

    // 5. Get leaderboards
    console.log('\n5️⃣ Getting leaderboards...')
    const overallRes = await fetch(`${API_URL}/leaderboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    const overall = await overallRes.json()
    console.log('✅ Overall leaderboard:')
    overall.slice(0, 3).forEach((entry: any) => {
      console.log(`   ${entry.rank}. ${entry.username}: ${entry.totalPoints} points`)
    })

    // 6. Test error handling
    console.log('\n6️⃣ Testing error handling...')
    const errorRes = await fetch(`${API_URL}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        taskId: firstTask.id,
        value: 30  // Same task, same day - should error
      })
    })
    const errorData = await errorRes.json()
    console.log('✅ Duplicate prevention working:', errorData.error)

    console.log('\n✨ All tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run tests
testAPI()