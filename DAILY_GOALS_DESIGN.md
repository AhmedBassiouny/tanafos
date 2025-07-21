# Daily Goals Feature - Technical Design Document

**Document Version**: 1.0  
**Date**: 2025-07-20  
**Author**: Ahmed Bassiouny  
**Reviewers**: Ahmed Bassiouny  
**Status**: Approved  

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals and Success Metrics](#goals-and-success-metrics)
4. [Technical Requirements](#technical-requirements)
5. [System Design](#system-design)
6. [Database Schema Changes](#database-schema-changes)
7. [API Design](#api-design)
8. [Frontend Design](#frontend-design)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Plan](#implementation-plan)
11. [Risk Assessment](#risk-assessment)
12. [Monitoring and Observability](#monitoring-and-observability)

---

## Executive Summary

The Daily Goals feature introduces a structured goal-setting system to the Tanafos Islamic accountability platform. Each task will have a configurable daily target (e.g., 5 prayers, 2 azkar sessions), helping users maintain consistent spiritual practices while providing clear achievement milestones.

**Key Benefits:**
- Enhanced user engagement through clear daily targets
- Improved spiritual consistency tracking
- Gamified progress visualization
- Cultural alignment with Islamic daily practices

**Technical Scope:**
- Database schema extension with new `DailyGoal` model
- Dashboard UI enhancements with progress indicators
- New API endpoints for goal management
- Real-time goal progress tracking

---

## Problem Statement

### Current State
- Users track progress without clear daily targets
- No standardized expectations for Islamic practices
- Limited motivation for consistent daily engagement
- Progress tracking lacks context of recommended amounts

### User Pain Points
1. **Unclear Expectations**: Users don't know optimal daily targets for religious practices
2. **Inconsistent Motivation**: No clear achievement markers throughout the day
3. **Cultural Misalignment**: Targets don't reflect traditional Islamic practice recommendations
4. **Progress Context**: Raw numbers lack meaning without goal context

---

## Goals and Success Metrics

### Primary Goals
1. **Increase Daily Engagement**: Provide clear, achievable daily targets for each Islamic practice
2. **Cultural Authenticity**: Align goals with traditional Islamic recommendations (5 daily prayers, morning/evening azkar)
3. **Progressive Achievement**: Visual progress tracking toward daily goals
4. **Flexible Configuration**: Admin ability to adjust goals per task

### Leading Indicators
- Goal completion rate per task type
- Time-to-first-goal-completion
- Daily vs. weekly engagement patterns
- Feature adoption rate

---

## Technical Requirements

### Functional Requirements

#### FR-1: Goal Definition
- **FR-1.1**: Each task must have a configurable daily goal target
- **FR-1.2**: Goals must support different target types (exact count, minimum threshold)
- **FR-1.3**: Default goals must align with Islamic practice recommendations

#### FR-2: Progress Tracking
- **FR-2.1**: Real-time calculation of daily goal progress
- **FR-2.2**: Goal completion status (incomplete, in-progress, completed, exceeded)
- **FR-2.3**: Historical goal achievement tracking
- **FR-2.4**: Daily goal reset at Islamic day boundary (Maghrib time)

#### FR-3: Dashboard Integration
- **FR-3.1**: Visual progress indicators for each task goal
- **FR-3.2**: Daily goals summary widget
- **FR-3.3**: Goal completion celebration/feedback
- **FR-3.4**: Responsive design for mobile/desktop

#### FR-4: Analytics
- **FR-4.1**: Goal completion analytics per user
- **FR-4.2**: Task-specific goal achievement rates
- **FR-4.3**: Daily/weekly goal patterns
- **FR-4.4**: Community goal achievement insights

### Non-Functional Requirements

#### NFR-1: Performance
- **NFR-1.1**: Goal progress calculation < 100ms
- **NFR-1.2**: Dashboard load time < 2 seconds with goals
- **NFR-1.3**: Real-time updates without full page refresh
- **NFR-1.4**: Database queries optimized for goal calculations

#### NFR-2: Scalability
- **NFR-2.1**: Support 10,000+ concurrent users tracking goals
- **NFR-2.2**: Efficient bulk goal progress calculations
- **NFR-2.3**: Horizontal scaling of goal calculation services
- **NFR-2.4**: Caching strategy for frequently accessed goal data

#### NFR-3: Reliability
- **NFR-3.1**: 99.9% uptime for goal tracking features
- **NFR-3.2**: Data consistency across goal calculations
- **NFR-3.3**: Graceful degradation if goal service is unavailable
- **NFR-3.4**: Backup and recovery for goal configuration data

#### NFR-4: Security
- **NFR-4.1**: Goal data access limited to authenticated users
- **NFR-4.2**: Admin-only access to goal configuration
- **NFR-4.3**: Input validation for all goal-related data
- **NFR-4.4**: Audit logging for goal configuration changes

---

## System Design

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   Dashboard     │◄──►│   Goal Service  │◄──►│   PostgreSQL    │
│   Components    │    │   Progress API  │    │   + Prisma      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cache Layer   │
                       │   (Redis)       │
                       └─────────────────┘
```

### Core Components

#### 1. Goal Service (`backend/src/services/goal.service.ts`)
- **Responsibilities**: Goal CRUD operations, progress calculations, achievement detection
- **Key Methods**:
  - `calculateDailyProgress(userId: number, date: Date): DailyGoalProgress[]`
  - `checkGoalCompletion(userId: number, taskId: number, date: Date): boolean`
  - `getDailyGoalsForUser(userId: number): DailyGoalWithProgress[]`
  - `updateTaskGoal(taskId: number, goalData: UpdateGoalInput): DailyGoal`

#### 2. Progress Enhancement (`backend/src/services/progress.service.ts`)
- **New Methods**:
  - `logProgressWithGoalCheck()`: Extended to trigger goal completion checks
  - `getGoalAchievementStats()`: Historical goal completion analysis

#### 3. Dashboard Components (`frontend/src/components/goals/`)
- **GoalProgressBar**: Visual progress indicator for individual tasks
- **DailyGoalsSummary**: Overview widget showing today's goal status
- **GoalCompletionCelebration**: Achievement feedback component
- **GoalSettingsModal**: Admin interface for goal configuration

### Data Flow

#### Goal Progress Calculation Flow
```
1. User logs progress via LogProgressModal
2. ProgressService.logProgress() called
3. GoalService.calculateDailyProgress() triggered
4. Goal completion status updated in real-time
5. Frontend receives updated goal progress
6. UI updates with new progress indicators
7. Achievement celebration triggered if goal completed
```

#### Daily Goal Reset Flow
```
1. Scheduled job runs at Maghrib time (Islamic day boundary)
2. DailyGoalProgress records archived to DailyGoalHistory
3. New DailyGoalProgress records created for next day
4. Cache invalidated for goal progress data
5. Users see fresh goals on next login
```

---

## Database Schema Changes

### New Models

#### DailyGoal Model
```sql
model DailyGoal {
  id            Int      @id @default(autoincrement())
  taskId        Int      @unique @map("task_id")
  targetValue   Decimal  @db.Decimal(10, 2) @map("target_value")
  targetType    GoalType @default(MINIMUM) @map("target_type")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  // Relations
  task          Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@map("daily_goals")
}

enum GoalType {
  EXACT     // Must hit exact target (e.g., 5 prayers)
  MINIMUM   // Must reach at least target (e.g., 2+ azkar sessions)
  MAXIMUM   // Should not exceed target (e.g., screen time limits)
}
```

#### DailyGoalProgress Model
```sql
model DailyGoalProgress {
  id              Int          @id @default(autoincrement())
  userId          Int          @map("user_id")
  taskId          Int          @map("task_id")
  goalDate        DateTime     @db.Date @map("goal_date")
  currentValue    Decimal      @default(0) @db.Decimal(10, 2) @map("current_value")
  targetValue     Decimal      @db.Decimal(10, 2) @map("target_value")
  status          GoalStatus   @default(NOT_STARTED) @map("status")
  completedAt     DateTime?    @map("completed_at")
  lastUpdated     DateTime     @updatedAt @map("last_updated")
  
  // Relations
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  task            Task         @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@unique([userId, taskId, goalDate])
  @@index([userId, goalDate])
  @@index([goalDate, status])
  @@map("daily_goal_progress")
}

enum GoalStatus {
  NOT_STARTED   // 0% progress
  IN_PROGRESS   // 1-99% progress
  COMPLETED     // 100% progress (target reached)
  EXCEEDED      // >100% progress (exceeded target)
}
```

#### DailyGoalHistory Model
```sql
model DailyGoalHistory {
  id              Int        @id @default(autoincrement())
  userId          Int        @map("user_id")
  taskId          Int        @map("task_id")
  goalDate        DateTime   @db.Date @map("goal_date")
  targetValue     Decimal    @db.Decimal(10, 2) @map("target_value")
  finalValue      Decimal    @db.Decimal(10, 2) @map("final_value")
  completionRate  Decimal    @db.Decimal(5, 2) @map("completion_rate")  // 0.00-999.99%
  status          GoalStatus @map("status")
  completedAt     DateTime?  @map("completed_at")
  archivedAt      DateTime   @default(now()) @map("archived_at")
  
  // Relations
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  task            Task       @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@index([userId, goalDate])
  @@index([taskId, goalDate])
  @@index([goalDate, status])
  @@map("daily_goal_history")
}
```

### Modified Models

#### Task Model Extension
```sql
model Task {
  // ... existing fields ...
  
  // New relations
  dailyGoal           DailyGoal?
  dailyGoalProgress   DailyGoalProgress[]
  dailyGoalHistory    DailyGoalHistory[]
}
```

#### User Model Extension
```sql
model User {
  // ... existing fields ...
  
  // New relations
  dailyGoalProgress   DailyGoalProgress[]
  dailyGoalHistory    DailyGoalHistory[]
}
```

### Migration Strategy

#### Migration 001: Create Daily Goals Tables
```sql
-- Create enums
CREATE TYPE "GoalType" AS ENUM ('EXACT', 'MINIMUM', 'MAXIMUM');
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXCEEDED');

-- Create daily_goals table
CREATE TABLE "daily_goals" (
  "id" SERIAL PRIMARY KEY,
  "task_id" INTEGER UNIQUE NOT NULL,
  "target_value" DECIMAL(10,2) NOT NULL,
  "target_type" "GoalType" DEFAULT 'MINIMUM',
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "daily_goals_task_id_fkey" 
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE
);

-- Create daily_goal_progress table
CREATE TABLE "daily_goal_progress" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "task_id" INTEGER NOT NULL,
  "goal_date" DATE NOT NULL,
  "current_value" DECIMAL(10,2) DEFAULT 0,
  "target_value" DECIMAL(10,2) NOT NULL,
  "status" "GoalStatus" DEFAULT 'NOT_STARTED',
  "completed_at" TIMESTAMP(3),
  "last_updated" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "daily_goal_progress_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "daily_goal_progress_task_id_fkey"
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
  
  UNIQUE("user_id", "task_id", "goal_date")
);

-- Create indexes
CREATE INDEX "daily_goal_progress_user_id_goal_date_idx" 
  ON "daily_goal_progress"("user_id", "goal_date");
CREATE INDEX "daily_goal_progress_goal_date_status_idx" 
  ON "daily_goal_progress"("goal_date", "status");

-- Create daily_goal_history table
CREATE TABLE "daily_goal_history" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "task_id" INTEGER NOT NULL,
  "goal_date" DATE NOT NULL,
  "target_value" DECIMAL(10,2) NOT NULL,
  "final_value" DECIMAL(10,2) NOT NULL,
  "completion_rate" DECIMAL(5,2) NOT NULL,
  "status" "GoalStatus" NOT NULL,
  "completed_at" TIMESTAMP(3),
  "archived_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "daily_goal_history_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "daily_goal_history_task_id_fkey"
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE
);

-- Create history indexes
CREATE INDEX "daily_goal_history_user_id_goal_date_idx" 
  ON "daily_goal_history"("user_id", "goal_date");
CREATE INDEX "daily_goal_history_task_id_goal_date_idx" 
  ON "daily_goal_history"("task_id", "goal_date");
CREATE INDEX "daily_goal_history_goal_date_status_idx" 
  ON "daily_goal_history"("goal_date", "status");
```

#### Migration 002: Seed Default Goals
```sql
-- Insert default daily goals based on Islamic practices
INSERT INTO "daily_goals" ("task_id", "target_value", "target_type") VALUES
  (1, 2.0, 'MINIMUM'),   -- Quran Reading: 2+ pages daily
  (2, 5.0, 'EXACT'),     -- Prayer on Time: exactly 5 prayers
  (3, 2.0, 'MINIMUM'),   -- Azkar & Dhikr: 2+ sessions (morning + evening)
  (4, 1.0, 'MINIMUM'),   -- Helping Others: 1+ act of kindness
  (5, 1.0, 'MINIMUM'),   -- Charity: 1+ act of giving
  (6, 30.0, 'MINIMUM');  -- Seeking Knowledge: 30+ minutes

-- Create initial daily goal progress for all existing users
INSERT INTO "daily_goal_progress" ("user_id", "task_id", "goal_date", "target_value", "current_value", "status")
SELECT 
  u.id as user_id,
  dg.task_id,
  CURRENT_DATE as goal_date,
  dg.target_value,
  COALESCE(pl.value, 0) as current_value,
  CASE 
    WHEN COALESCE(pl.value, 0) = 0 THEN 'NOT_STARTED'::GoalStatus
    WHEN COALESCE(pl.value, 0) < dg.target_value THEN 'IN_PROGRESS'::GoalStatus
    WHEN COALESCE(pl.value, 0) >= dg.target_value THEN 'COMPLETED'::GoalStatus
  END as status
FROM users u
CROSS JOIN daily_goals dg
LEFT JOIN progress_logs pl ON pl.user_id = u.id 
  AND pl.task_id = dg.task_id 
  AND pl.logged_date = CURRENT_DATE
WHERE dg.is_active = true;
```

---

## API Design

### New Endpoints

#### Goals Management

##### GET /api/goals/daily
**Purpose**: Retrieve current daily goals with progress for authenticated user

**Request**:
```http
GET /api/goals/daily
Authorization: Bearer <jwt_token>
Query Parameters:
  ?date=2025-07-20  // Optional, defaults to today
```

**Response**:
```json
{
  "success": true,
  "data": {
    "goalDate": "2025-07-20",
    "overallProgress": {
      "completed": 4,
      "total": 6,
      "completionRate": 66.67
    },
    "goals": [
      {
        "id": 1,
        "taskId": 2,
        "taskName": "Prayer on Time",
        "targetValue": 5.0,
        "currentValue": 5.0,
        "targetType": "EXACT",
        "status": "COMPLETED",
        "completionRate": 100.0,
        "completedAt": "2025-07-20T17:30:00Z",
        "unit": "prayers"
      },
      {
        "id": 2,
        "taskId": 1,
        "taskName": "Quran Reading",
        "targetValue": 2.0,
        "currentValue": 1.5,
        "targetType": "MINIMUM",
        "status": "IN_PROGRESS",
        "completionRate": 75.0,
        "completedAt": null,
        "unit": "pages"
      }
    ]
  }
}
```

##### GET /api/goals/history
**Purpose**: Retrieve historical goal achievement data

**Request**:
```http
GET /api/goals/history
Authorization: Bearer <jwt_token>
Query Parameters:
  ?startDate=2025-07-01
  &endDate=2025-07-20
  &taskId=2  // Optional, filter by specific task
  &limit=30
  &offset=0
```

**Response**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "goalDate": "2025-07-19",
        "taskId": 2,
        "taskName": "Prayer on Time",
        "targetValue": 5.0,
        "finalValue": 4.0,
        "completionRate": 80.0,
        "status": "IN_PROGRESS",
        "completedAt": null
      }
    ],
    "summary": {
      "totalDays": 20,
      "completedDays": 15,
      "averageCompletionRate": 87.5,
      "streak": {
        "current": 5,
        "longest": 12
      }
    }
  }
}
```

##### POST /api/goals/admin/configure
**Purpose**: Configure daily goals for tasks (Admin only)

**Request**:
```http
POST /api/goals/admin/configure
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "taskId": 2,
  "targetValue": 5.0,
  "targetType": "EXACT",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "taskId": 2,
    "targetValue": 5.0,
    "targetType": "EXACT",
    "isActive": true,
    "updatedAt": "2025-07-20T12:00:00Z"
  }
}
```

##### GET /api/goals/analytics
**Purpose**: Goal completion analytics for community insights

**Request**:
```http
GET /api/goals/analytics
Authorization: Bearer <jwt_token>
Query Parameters:
  ?period=7d  // 1d, 7d, 30d, 90d
  &taskId=2   // Optional
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "globalStats": {
      "totalActiveUsers": 1250,
      "averageGoalsCompleted": 3.2,
      "topPerformingTask": {
        "taskId": 2,
        "taskName": "Prayer on Time",
        "completionRate": 89.5
      }
    },
    "taskBreakdown": [
      {
        "taskId": 2,
        "taskName": "Prayer on Time",
        "targetValue": 5.0,
        "averageCompletion": 4.7,
        "completionRate": 89.5,
        "totalCompletions": 1119
      }
    ],
    "trends": {
      "dailyCompletionRates": [85.2, 87.1, 89.5, 91.2, 88.8, 90.1, 89.5]
    }
  }
}
```

### Modified Endpoints

##### POST /api/progress (Enhanced)
**Enhancement**: Automatically update goal progress when logging activity

**New Response Fields**:
```json
{
  "success": true,
  "data": {
    // ... existing progress data ...
    "goalProgress": {
      "goalId": 1,
      "previousStatus": "IN_PROGRESS",
      "newStatus": "COMPLETED",
      "completionRate": 100.0,
      "goalCompleted": true,
      "targetReached": true
    }
  }
}
```

---

## Frontend Design

### New Components

#### 1. GoalProgressBar Component
**File**: `frontend/src/components/goals/GoalProgressBar.tsx`

**Purpose**: Visual progress indicator for individual task goals

**Props**:
```typescript
interface GoalProgressBarProps {
  goal: DailyGoalWithProgress
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}
```

**Design**:
```tsx
<div className="goal-progress-container">
  <div className="goal-header">
    <span className="task-name">{goal.taskName}</span>
    <span className="progress-text">
      {goal.currentValue} / {goal.targetValue} {goal.unit}
    </span>
  </div>
  
  <div className="progress-bar-container">
    <div 
      className={`progress-bar ${goal.status.toLowerCase()}`}
      style={{ width: `${Math.min(goal.completionRate, 100)}%` }}
    >
      {goal.status === 'COMPLETED' && (
        <CheckCircleIcon className="completion-icon" />
      )}
    </div>
  </div>
  
  <div className="goal-status">
    <StatusBadge status={goal.status} />
    {goal.completionRate > 100 && (
      <span className="exceeded-badge">+{goal.completionRate - 100}%</span>
    )}
  </div>
</div>
```

#### 2. DailyGoalsSummary Component
**File**: `frontend/src/components/goals/DailyGoalsSummary.tsx`

**Purpose**: Overview widget showing today's goal status

**Design**:
```tsx
<Card className="daily-goals-summary">
  <div className="summary-header">
    <h3>Today's Goals</h3>
    <span className="date">{formatDate(new Date())}</span>
  </div>
  
  <div className="overall-progress">
    <CircularProgress
      completed={overallProgress.completed}
      total={overallProgress.total}
      size="lg"
    />
    <div className="progress-stats">
      <span className="completed-count">
        {overallProgress.completed} of {overallProgress.total}
      </span>
      <span className="completion-rate">
        {overallProgress.completionRate}% Complete
      </span>
    </div>
  </div>
  
  <div className="goal-list">
    {goals.map(goal => (
      <GoalProgressBar 
        key={goal.id}
        goal={goal}
        size="sm"
        showDetails={false}
      />
    ))}
  </div>
</Card>
```

#### 3. GoalCompletionCelebration Component
**File**: `frontend/src/components/goals/GoalCompletionCelebration.tsx`

**Purpose**: Achievement feedback when goals are completed

**Design**:
```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      className="celebration-overlay"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <div className="celebration-content">
        <div className="celebration-icon">
          <StarIcon className="w-16 h-16 text-yellow-400" />
        </div>
        
        <h2 className="celebration-title">
          Goal Completed! 🎉
        </h2>
        
        <p className="celebration-message">
          You've completed your {taskName} goal for today!
          May Allah accept your good deeds.
        </p>
        
        <div className="celebration-stats">
          <div className="stat">
            <span className="stat-value">{pointsEarned}</span>
            <span className="stat-label">Points Earned</span>
          </div>
          <div className="stat">
            <span className="stat-value">{completedGoals}</span>
            <span className="stat-label">Goals Today</span>
          </div>
        </div>
        
        <Button 
          onClick={onClose}
          className="celebration-continue"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### Modified Components

#### 1. Dashboard Component Enhancement
**File**: `frontend/src/pages/Dashboard.tsx`

**New State**:
```typescript
const [dailyGoals, setDailyGoals] = useState<DailyGoalWithProgress[]>([])
const [goalsSummary, setGoalsSummary] = useState<DailyGoalsSummary | null>(null)
const [showGoalCelebration, setShowGoalCelebration] = useState(false)
const [completedGoal, setCompletedGoal] = useState<DailyGoalWithProgress | null>(null)
```

**New Data Fetching**:
```typescript
const fetchDashboardData = async () => {
  const [tasksRes, statsRes, todayRes, leaderboardRes, goalsRes] = await Promise.all([
    tasksApi.getAll(),
    userApi.getStats(),
    progressApi.getToday(),
    leaderboardApi.getOverall(),
    goalsApi.getDailyGoals() // New API call
  ])
  
  setDailyGoals(goalsRes.data.goals)
  setGoalsSummary(goalsRes.data.overallProgress)
}
```

**New Dashboard Layout**:
```tsx
<div className="dashboard-container">
  {/* Existing welcome section */}
  
  {/* Enhanced stats with goals summary */}
  <div className="stats-and-goals-grid">
    <div className="stats-section">
      {/* Existing stats cards */}
    </div>
    
    <div className="goals-section">
      <DailyGoalsSummary 
        goals={dailyGoals}
        overallProgress={goalsSummary}
      />
    </div>
  </div>
  
  {/* Enhanced task cards with goal progress */}
  <div className="tasks-with-goals">
    <h2>Daily Tasks</h2>
    <div className="task-goal-grid">
      {tasks.map(task => {
        const goal = dailyGoals.find(g => g.taskId === task.id)
        return (
          <div key={task.id} className="task-with-goal">
            <TaskCard
              task={task}
              todayProgress={getTaskProgress(task.id)}
              onLogProgress={handleLogProgress}
            />
            {goal && (
              <GoalProgressBar 
                goal={goal}
                size="md"
                animated={true}
              />
            )}
          </div>
        )
      })}
    </div>
  </div>
  
  {/* Goal completion celebration */}
  <GoalCompletionCelebration
    isVisible={showGoalCelebration}
    goal={completedGoal}
    onClose={() => setShowGoalCelebration(false)}
  />
</div>
```

#### 2. TaskCard Component Enhancement
**File**: `frontend/src/components/TaskCard.tsx`

**New Props**:
```typescript
interface TaskCardProps {
  task: Task
  todayProgress?: number
  goal?: DailyGoalWithProgress  // New prop
  onLogProgress: (task: Task) => void
}
```

**Enhanced Design**:
```tsx
<Card hover className="task-card group">
  <div className="task-header">
    <div className="task-info">
      <h3 className="task-name">{task.name}</h3>
      <p className="task-points">
        {task.pointsPerUnit} {task.pointsPerUnit === 1 ? 'point' : 'points'} per {task.unit}
      </p>
    </div>
    
    {goal && (
      <div className="goal-indicator">
        <div className={`goal-status-dot ${goal.status.toLowerCase()}`} />
        <span className="goal-progress-text">
          {goal.currentValue}/{goal.targetValue}
        </span>
      </div>
    )}
  </div>
  
  {goal && (
    <div className="task-goal-progress">
      <GoalProgressBar 
        goal={goal} 
        size="sm" 
        showDetails={false}
      />
    </div>
  )}
  
  {/* Existing progress display and button */}
</Card>
```

### New Types

#### Frontend Types Extension
**File**: `frontend/src/types/index.ts`

```typescript
export interface DailyGoal {
  id: number
  taskId: number
  targetValue: number
  targetType: 'EXACT' | 'MINIMUM' | 'MAXIMUM'
  isActive: boolean
}

export interface DailyGoalProgress {
  id: number
  userId: number
  taskId: number
  goalDate: string
  currentValue: number
  targetValue: number
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXCEEDED'
  completionRate: number
  completedAt?: string
}

export interface DailyGoalWithProgress extends DailyGoalProgress {
  taskName: string
  unit: string
  targetType: 'EXACT' | 'MINIMUM' | 'MAXIMUM'
}

export interface DailyGoalsSummary {
  goalDate: string
  completed: number
  total: number
  completionRate: number
}

export interface GoalAnalytics {
  period: string
  globalStats: {
    totalActiveUsers: number
    averageGoalsCompleted: number
    topPerformingTask: {
      taskId: number
      taskName: string
      completionRate: number
    }
  }
  taskBreakdown: {
    taskId: number
    taskName: string
    targetValue: number
    averageCompletion: number
    completionRate: number
    totalCompletions: number
  }[]
}
```

---

## Testing Strategy

### Unit Tests

#### Backend Service Tests
**File**: `backend/tests/services/goal.service.test.ts`

```typescript
describe('GoalService', () => {
  describe('calculateDailyProgress', () => {
    it('should calculate correct progress for user goals', async () => {
      // Arrange
      const userId = 1
      const goalDate = new Date('2025-07-20')
      const mockGoals = [
        { taskId: 1, targetValue: 5, targetType: 'EXACT' },
        { taskId: 2, targetValue: 2, targetType: 'MINIMUM' }
      ]
      const mockProgress = [
        { taskId: 1, value: 3 },
        { taskId: 2, value: 2 }
      ]
      
      // Act
      const result = await GoalService.calculateDailyProgress(userId, goalDate)
      
      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        taskId: 1,
        currentValue: 3,
        targetValue: 5,
        status: 'IN_PROGRESS',
        completionRate: 60
      })
      expect(result[1]).toMatchObject({
        taskId: 2,
        currentValue: 2,
        targetValue: 2,
        status: 'COMPLETED',
        completionRate: 100
      })
    })
    
    it('should handle goal completion status correctly', async () => {
      // Test cases for NOT_STARTED, IN_PROGRESS, COMPLETED, EXCEEDED
    })
    
    it('should handle different goal types (EXACT, MINIMUM, MAXIMUM)', async () => {
      // Test specific logic for each goal type
    })
  })
  
  describe('checkGoalCompletion', () => {
    it('should detect when goal is newly completed', async () => {
      // Test goal completion detection logic
    })
    
    it('should not trigger completion for already completed goals', async () => {
      // Test duplicate completion prevention
    })
  })
})
```

#### Frontend Component Tests
**File**: `frontend/src/tests/components/GoalProgressBar.test.tsx`

```typescript
describe('GoalProgressBar', () => {
  const mockGoal: DailyGoalWithProgress = {
    id: 1,
    taskId: 2,
    taskName: 'Prayer on Time',
    currentValue: 3,
    targetValue: 5,
    status: 'IN_PROGRESS',
    completionRate: 60,
    unit: 'prayers',
    goalDate: '2025-07-20',
    userId: 1,
    targetType: 'EXACT'
  }
  
  it('should render progress bar with correct percentage', () => {
    render(<GoalProgressBar goal={mockGoal} />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveStyle({ width: '60%' })
    expect(screen.getByText('3 / 5 prayers')).toBeInTheDocument()
  })
  
  it('should show completion icon when goal is completed', () => {
    const completedGoal = { ...mockGoal, status: 'COMPLETED', completionRate: 100 }
    render(<GoalProgressBar goal={completedGoal} />)
    
    expect(screen.getByTestId('completion-icon')).toBeInTheDocument()
  })
  
  it('should handle exceeded goals correctly', () => {
    const exceededGoal = { ...mockGoal, status: 'EXCEEDED', completionRate: 120 }
    render(<GoalProgressBar goal={exceededGoal} />)
    
    expect(screen.getByText('+20%')).toBeInTheDocument()
  })
})
```

#### API Endpoint Tests
**File**: `backend/tests/routes/goals.test.ts`

```typescript
describe('Goals API', () => {
  describe('GET /api/goals/daily', () => {
    it('should return daily goals with progress for authenticated user', async () => {
      const response = await request(app)
        .get('/api/goals/daily')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
      
      expect(response.body.success).toBe(true)
      expect(response.body.data.goals).toBeInstanceOf(Array)
      expect(response.body.data.overallProgress).toHaveProperty('completed')
      expect(response.body.data.overallProgress).toHaveProperty('total')
    })
    
    it('should filter by date when provided', async () => {
      const testDate = '2025-07-19'
      const response = await request(app)
        .get(`/api/goals/daily?date=${testDate}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
      
      expect(response.body.data.goalDate).toBe(testDate)
    })
    
    it('should require authentication', async () => {
      await request(app)
        .get('/api/goals/daily')
        .expect(401)
    })
  })
  
  describe('POST /api/goals/admin/configure', () => {
    it('should allow admin to configure task goals', async () => {
      const goalData = {
        taskId: 1,
        targetValue: 3.0,
        targetType: 'MINIMUM',
        isActive: true
      }
      
      const response = await request(app)
        .post('/api/goals/admin/configure')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(goalData)
        .expect(200)
      
      expect(response.body.data).toMatchObject(goalData)
    })
    
    it('should reject non-admin users', async () => {
      await request(app)
        .post('/api/goals/admin/configure')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403)
    })
  })
})
```

### Integration Tests

#### Dashboard Goals Integration
**File**: `frontend/src/tests/integration/DashboardGoals.test.tsx`

```typescript
describe('Dashboard Goals Integration', () => {
  it('should display goals and update progress when logging activity', async () => {
    // Mock API responses
    const mockGoals = [/* goal data */]
    const mockTasks = [/* task data */]
    
    // Render dashboard
    render(<Dashboard />, { wrapper: AuthProvider })
    
    // Verify goals are displayed
    await waitFor(() => {
      expect(screen.getByText('Today\'s Goals')).toBeInTheDocument()
    })
    
    // Log progress for a task
    const logButton = screen.getByLabelText('Log progress for Prayer on Time')
    fireEvent.click(logButton)
    
    // Fill progress form
    const progressInput = screen.getByLabelText('Progress value')
    fireEvent.change(progressInput, { target: { value: '5' } })
    
    const submitButton = screen.getByText('Log Progress')
    fireEvent.click(submitButton)
    
    // Verify goal completion celebration appears
    await waitFor(() => {
      expect(screen.getByText('Goal Completed! 🎉')).toBeInTheDocument()
    })
    
    // Verify goal progress is updated
    expect(screen.getByText('5 / 5 prayers')).toBeInTheDocument()
  })
})
```

### Performance Tests

#### Goal Calculation Performance
**File**: `backend/tests/performance/goal.performance.test.ts`

```typescript
describe('Goal Service Performance', () => {
  it('should calculate daily progress for 1000 users under 100ms', async () => {
    // Create test data for 1000 users with multiple goals
    const userIds = Array.from({ length: 1000 }, (_, i) => i + 1)
    
    const startTime = Date.now()
    
    // Calculate goals for all users
    const calculations = userIds.map(userId => 
      GoalService.calculateDailyProgress(userId, new Date())
    )
    
    await Promise.all(calculations)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(100)
  })
  
  it('should handle bulk goal progress updates efficiently', async () => {
    // Test bulk update performance
  })
})
```

### End-to-End Tests

#### Goals Workflow E2E
**File**: `frontend/tests/e2e/goals.e2e.test.ts`

```typescript
describe('Daily Goals E2E', () => {
  it('should complete full goal achievement workflow', async () => {
    // Login
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'demo1@example.com')
    await page.fill('[data-testid=password]', 'demo123')
    await page.click('[data-testid=login-button]')
    
    // Navigate to dashboard
    await page.waitForURL('/dashboard')
    
    // Verify goals are displayed
    await expect(page.locator('[data-testid=daily-goals-summary]')).toBeVisible()
    
    // Complete a goal by logging progress
    await page.click('[data-testid=task-card-prayer]')
    await page.fill('[data-testid=progress-input]', '5')
    await page.click('[data-testid=log-progress-button]')
    
    // Verify goal completion celebration
    await expect(page.locator('[data-testid=goal-celebration]')).toBeVisible()
    await expect(page.locator('text=Goal Completed!')).toBeVisible()
    
    // Verify goal status updated
    await page.click('[data-testid=celebration-continue]')
    await expect(page.locator('[data-testid=goal-status-completed]')).toBeVisible()
    
    // Verify overall progress updated
    const progressText = await page.locator('[data-testid=overall-progress]').textContent()
    expect(progressText).toContain('1 of 6')
  })
})
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
**Duration**: 2 weeks  
**Priority**: P0 (Blocking)

#### Sprint 1.1: Database and Backend Core (Week 1)
- [ ] **Database Migration**: Create daily goals schema
- [ ] **Seed Data**: Default Islamic practice goals
- [ ] **Goal Service**: Core calculation logic
- [ ] **API Endpoints**: Basic CRUD for goals
- [ ] **Unit Tests**: Service and API tests

**Acceptance Criteria**:
- Daily goals can be created/read via API
- Goal progress calculation works correctly
- Database performance benchmarks met
- 90%+ test coverage for new code

#### Sprint 1.2: Frontend Foundation (Week 2)
- [ ] **Component Library**: GoalProgressBar, DailyGoalsSummary
- [ ] **API Integration**: Goals API client
- [ ] **Type Definitions**: TypeScript interfaces
- [ ] **Component Tests**: Unit tests for UI components

**Acceptance Criteria**:
- Goal components render correctly
- API integration works without errors
- Components handle loading/error states
- Responsive design works on mobile

### Phase 2: Dashboard Integration (Week 3-4)
**Duration**: 2 weeks  
**Priority**: P0 (Blocking)

#### Sprint 2.1: Dashboard Enhancement (Week 3)
- [ ] **Dashboard Updates**: Integrate goals into main dashboard
- [ ] **Progress Tracking**: Real-time goal updates
- [ ] **TaskCard Enhancement**: Add goal indicators
- [ ] **Data Flow**: Connect progress logging to goal updates

**Acceptance Criteria**:
- Dashboard shows daily goals clearly
- Goal progress updates in real-time
- Task cards show goal status
- Performance remains under 2s load time

#### Sprint 2.2: User Experience (Week 4)
- [ ] **Goal Completion**: Celebration component
- [ ] **Visual Polish**: Animations and micro-interactions
- [ ] **Error Handling**: Graceful degradation
- [ ] **Integration Testing**: Full workflow tests

**Acceptance Criteria**:
- Goal completion feels rewarding
- Smooth animations and transitions
- Errors handled gracefully
- E2E tests pass consistently

### Phase 3: Advanced Features (Week 5-6)
**Duration**: 2 weeks  
**Priority**: P1 (Important)

#### Sprint 3.1: Analytics and History (Week 5)
- [ ] **Goal History**: Historical tracking
- [ ] **Analytics API**: Community insights
- [ ] **Progress Charts**: Visual goal trends
- [ ] **Streak Tracking**: Goal completion streaks

**Acceptance Criteria**:
- Users can view goal history
- Analytics provide meaningful insights
- Charts load quickly and are accurate
- Streak calculation is correct

#### Sprint 3.2: Admin Features (Week 6)
- [ ] **Goal Configuration**: Admin interface
- [ ] **Goal Templates**: Pre-configured goal sets
- [ ] **Bulk Operations**: Mass goal updates
- [ ] **Monitoring**: Goal system observability

**Acceptance Criteria**:
- Admins can configure goals easily
- Goal templates work correctly
- Bulk operations are efficient
- System monitoring is comprehensive

### Phase 4: Optimization and Launch (Week 7-8)
**Duration**: 2 weeks  
**Priority**: P2 (Nice to Have)

#### Sprint 4.1: Performance and Scale (Week 7)
- [ ] **Caching Strategy**: Redis for goal data
- [ ] **Database Optimization**: Query performance
- [ ] **Load Testing**: High concurrency scenarios
- [ ] **Memory Optimization**: Frontend bundle size

**Acceptance Criteria**:
- Goal calculations cached effectively
- Database queries optimized
- System handles 10k concurrent users
- Frontend bundle size minimized

#### Sprint 4.2: Launch Preparation (Week 8)
- [ ] **Documentation**: User guides and API docs
- [ ] **Feature Flags**: Gradual rollout capability
- [ ] **Monitoring**: Production observability
- [ ] **Launch Strategy**: Beta testing and feedback

**Acceptance Criteria**:
- Documentation is complete and clear
- Feature flags enable safe rollout
- Monitoring covers all key metrics
- Beta feedback incorporated

---

## Risk Assessment

### Technical Risks

#### High Risk (Probability: High, Impact: High)

**R1: Database Performance Degradation**
- **Risk**: Goal calculations may slow down dashboard loading
- **Impact**: Poor user experience, potential system overload
- **Mitigation**: 
  - Implement Redis caching for goal progress
  - Optimize database queries with proper indexing
  - Use database query performance monitoring
  - Implement pagination for goal history
- **Contingency**: Fall back to cached data if calculations timeout

**R2: Real-time Update Complexity**
- **Risk**: Goal progress updates may not sync properly across UI
- **Impact**: Inconsistent goal status, user confusion
- **Mitigation**:
  - Use optimistic UI updates with rollback
  - Implement proper error handling and retry logic
  - Add comprehensive integration tests
  - Use WebSocket for real-time updates if needed
- **Contingency**: Manual refresh button as fallback

#### Medium Risk (Probability: Medium, Impact: High)

**R3: Islamic Calendar Integration**
- **Risk**: Daily goal reset timing may not align with Islamic day boundaries
- **Impact**: Goals reset at wrong time, cultural misalignment
- **Mitigation**:
  - Research Islamic prayer time APIs
  - Implement timezone-aware goal resets
  - Add configuration for different Islamic calendar interpretations
  - Consult with Islamic scholars for guidance
- **Contingency**: Default to midnight reset with future enhancement

**R4: Data Migration Complexity**
- **Risk**: Existing user data may not migrate cleanly to goal system
- **Impact**: Data loss, system downtime during migration
- **Mitigation**:
  - Create comprehensive migration scripts
  - Test migration on staging data multiple times
  - Implement rollback procedures
  - Perform migration during low-traffic hours
- **Contingency**: Staged rollout with manual data repair if needed

#### Low Risk (Probability: Low, Impact: Medium)

**R5: Mobile Performance Issues**
- **Risk**: Goal visualizations may be slow on mobile devices
- **Impact**: Poor mobile user experience
- **Mitigation**:
  - Use lightweight animation libraries
  - Implement virtual scrolling for long goal lists
  - Optimize image assets and bundle size
  - Test on low-end devices
- **Contingency**: Simplified mobile UI without animations

### Business Risks

#### Medium Risk (Probability: Medium, Impact: High)

**R6: User Engagement Mismatch**
- **Risk**: Users may find daily goals too demanding or too easy
- **Impact**: Reduced engagement, user churn
- **Mitigation**:
  - Start with research-backed Islamic practice recommendations
  - Implement user feedback collection
  - Allow goal customization in future iterations
  - Monitor engagement metrics closely
- **Contingency**: Quick goal adjustment mechanism

**R7: Cultural Sensitivity Issues**
- **Risk**: Goal system may not align with diverse Islamic practices
- **Impact**: Community backlash, reduced adoption
- **Mitigation**:
  - Consult with Islamic scholars from different traditions
  - Make goals configurable rather than prescriptive
  - Provide educational context for goal recommendations
  - Include disclaimer about goal flexibility
- **Contingency**: Remove controversial goals, focus on universally accepted practices

---

## Monitoring and Observability

### Key Metrics

#### User Engagement Metrics
```typescript
interface GoalEngagementMetrics {
  // Goal completion rates
  dailyGoalCompletionRate: number      // % users completing ≥1 goal daily
  averageGoalsCompletedPerDay: number  // Mean goals completed per active user
  goalCompletionByTask: Record<string, number>  // Completion rate per task type
  
  // User behavior
  timeToFirstGoalCompletion: number    // Minutes from login to first goal
  goalCompletionStreaks: {
    current: number
    average: number
    longest: number
  }
  
  // Feature adoption
  goalFeatureAdoptionRate: number      // % users who interact with goals
  goalCelebrationViewRate: number      // % goal completions that show celebration
  goalHistoryViewRate: number          // % users who view goal history
}
```

#### System Performance Metrics
```typescript
interface GoalPerformanceMetrics {
  // API performance
  goalCalculationLatency: number       // P95 latency for goal calculations (ms)
  goalAPIResponseTime: number          // P95 response time for goals API
  goalDatabaseQueryTime: number        // P95 database query time
  
  // Cache performance
  goalCacheHitRate: number            // % cache hits for goal data
  goalCacheEvictionRate: number       // Cache evictions per hour
  
  // System resources
  goalServiceCPUUsage: number         // CPU usage during goal calculations
  goalServiceMemoryUsage: number     // Memory usage for goal service
  databaseConnectionPool: number      // Active DB connections
}
```

#### Business Impact Metrics
```typescript
interface GoalBusinessMetrics {
  // User retention
  goalUserRetention7Day: number        // 7-day retention for goal users
  goalUserRetention30Day: number       // 30-day retention for goal users
  
  // Engagement quality
  sessionDurationWithGoals: number     // Avg session time for goal users
  goalUserDAU: number                  // Daily active users using goals
  goalUserMAU: number                  // Monthly active users using goals
  
  // Progress quality
  consistentGoalUsers: number          // Users with >70% goal completion
  improvedProgressUsers: number        // Users showing week-over-week improvement
}
```

### Monitoring Implementation

#### Application Monitoring
```typescript
// Goal Service Instrumentation
class GoalService {
  @Monitor('goal.calculation.duration')
  @ErrorTracking('goal.calculation.error')
  static async calculateDailyProgress(userId: number, date: Date) {
    const startTime = Date.now()
    
    try {
      const result = await this.performCalculation(userId, date)
      
      // Track success metrics
      Metrics.increment('goal.calculation.success')
      Metrics.histogram('goal.calculation.latency', Date.now() - startTime)
      
      return result
    } catch (error) {
      // Track error metrics
      Metrics.increment('goal.calculation.error', { 
        error_type: error.constructor.name 
      })
      
      throw error
    }
  }
}
```

#### Database Monitoring
```sql
-- Goal-specific database monitoring queries
-- Track goal calculation query performance
SELECT 
  query,
  mean_exec_time,
  max_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements 
WHERE query LIKE '%daily_goal_progress%' 
ORDER BY mean_exec_time DESC;

-- Monitor goal-related table sizes and growth
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  avg_width
FROM pg_stats 
WHERE tablename IN ('daily_goals', 'daily_goal_progress', 'daily_goal_history');
```

#### Alert Configuration
```yaml
# Production alert rules for goals feature
alerts:
  - name: GoalCalculationLatencyHigh
    condition: goal.calculation.latency.p95 > 100ms
    severity: warning
    message: "Goal calculation latency is high"
    
  - name: GoalCompletionRateLow
    condition: goal.completion.rate < 0.3
    severity: warning
    message: "Daily goal completion rate dropped below 30%"
    
  - name: GoalServiceErrors
    condition: goal.calculation.error.rate > 0.05
    severity: critical
    message: "Goal service error rate above 5%"
    
  - name: GoalDatabaseConnections
    condition: goal.database.connections > 80% of pool
    severity: warning
    message: "Goal service using too many database connections"
```

#### Dashboard Configuration
```typescript
// Grafana dashboard configuration for goals
const goalsDashboard = {
  title: "Daily Goals Feature Monitoring",
  panels: [
    {
      title: "Goal Completion Rates",
      type: "graph",
      targets: [
        "goal.completion.rate.overall",
        "goal.completion.rate.by_task"
      ]
    },
    {
      title: "Goal Service Performance",
      type: "graph", 
      targets: [
        "goal.calculation.latency.p95",
        "goal.api.response_time.p95",
        "goal.database.query_time.p95"
      ]
    },
    {
      title: "User Engagement",
      type: "stat",
      targets: [
        "goal.users.dau",
        "goal.feature.adoption_rate",
        "goal.retention.7day"
      ]
    }
  ]
}
```

---

## Conclusion

The Daily Goals feature represents a significant enhancement to the Tanafos platform, bringing structured Islamic practice guidance to users while maintaining the platform's core values of anonymity and pure intentions.

### Success Criteria Summary
- **Technical**: Sub-100ms goal calculations, 99.9% uptime, seamless dashboard integration
- **User Experience**: Intuitive goal visualization, rewarding completion feedback, mobile-optimized design  
- **Business Impact**: 15% increase in DAU, 60% goal completion rate, 10% retention improvement
- **Cultural Alignment**: Islamic practice-based defaults, flexible goal configuration, scholarly consultation

### Next Steps
1. **Stakeholder Review**: Present design to engineering team and Islamic advisory board
2. **Technical Validation**: Proof-of-concept implementation for database performance
3. **User Research**: Validate goal targets with community focus groups
4. **Implementation Kickoff**: Begin Phase 1 development with database migration

This feature will strengthen Tanafos's position as the leading Islamic accountability platform while providing users with clear, culturally-aligned spiritual development targets.

---

*May Allah accept our efforts in creating tools that bring Muslims closer to Him and help them in their spiritual journey. Ameen.*

**Document Status**: Ready for Review  
**Next Review Date**: 2025-07-22  
**Implementation Start**: 2025-07-25