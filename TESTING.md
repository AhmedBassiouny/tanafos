# Tanafos Testing Guide

## Overview

This document describes the testing strategy and available test suites for the Tanafos progress tracking application.

## Test Structure

```
tanafos/
├── backend/
│   ├── tests/
│   │   ├── setup.ts                 # Test configuration
│   │   ├── utils/testHelpers.ts     # Test utilities
│   │   ├── auth.test.ts            # Authentication tests
│   │   ├── tasks.test.ts           # Tasks API tests
│   │   ├── progress.test.ts        # Progress logging tests
│   │   ├── leaderboard.test.ts     # Leaderboard tests
│   │   └── user.test.ts            # User management tests
│   └── jest.config.js              # Jest configuration
├── frontend/
│   ├── src/tests/
│   │   ├── utils/test-utils.tsx    # Test utilities & mocks
│   │   ├── components/             # Component tests
│   │   └── pages/                  # Page tests
│   ├── src/setupTests.ts           # Test setup
│   └── vite.config.ts              # Vitest configuration
└── run-tests.sh                    # Test runner script
```

## Running Tests

### Quick Start
```bash
# Run all tests
./run-tests.sh

# Run backend tests only
cd backend && npm test

# Run frontend tests only
cd frontend && npm test
```

### Backend Tests (Jest + Supertest)

#### Available Commands
```bash
cd backend

# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

#### Test Categories
1. **Authentication Tests** (`auth.test.ts`)
   - User registration validation
   - Login/logout functionality
   - JWT token handling
   - Error handling for invalid credentials

2. **Tasks API Tests** (`tasks.test.ts`)
   - Task retrieval and filtering
   - Authentication requirements
   - Task ordering and status

3. **Progress Tests** (`progress.test.ts`)
   - Progress logging validation
   - Duplicate prevention
   - Points calculation
   - Score updates

4. **Leaderboard Tests** (`leaderboard.test.ts`)
   - Overall and task-specific rankings
   - Proper ordering by points
   - Name anonymization
   - Cache functionality

5. **User Tests** (`user.test.ts`)
   - User statistics retrieval
   - Profile management
   - Authentication requirements

### Frontend Tests (Vitest + React Testing Library)

#### Available Commands
```bash
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Generate coverage report
npm run test:coverage
```

#### Test Categories
1. **Component Tests**
   - `Button.test.tsx` - Button component functionality
   - `Input.test.tsx` - Form input validation and behavior
   - `TaskCard.test.tsx` - Task display and interaction
   - `StatsCard.test.tsx` - Statistics display

2. **Page Tests**
   - `Login.test.tsx` - Login form validation and submission
   - Additional page tests for Dashboard, Leaderboard, etc.

3. **Integration Tests**
   - User flows and component interactions
   - API integration mocking
   - Routing and navigation

## Test Configuration

### Backend (Jest)
- **Framework**: Jest with ts-jest
- **HTTP Testing**: Supertest for API endpoints
- **Database**: In-memory SQLite for isolated tests
- **Coverage**: Collects from `src/**/*.ts` files
- **Timeout**: 30 seconds for database operations

### Frontend (Vitest)
- **Framework**: Vitest (Vite-native testing)
- **Component Testing**: React Testing Library
- **User Interactions**: @testing-library/user-event
- **Environment**: jsdom for DOM simulation
- **Mocking**: Built-in vi mocking utilities

## Test Data & Mocks

### Backend Test Helpers (`testHelpers.ts`)
```typescript
// Create test user
const user = await createTestUser({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
})

// Create test task
const task = await createTestTask({
  name: 'Exercise',
  unit: 'minutes',
  pointsPerUnit: 1
})

// Generate auth token
const token = generateAuthToken(user.id, user.email)
```

### Frontend Test Utilities (`test-utils.tsx`)
```typescript
// Render with providers
render(<Component />, {
  initialUser: mockUser,
  initialRoute: '/dashboard'
})

// Mock data available
mockUser, mockTasks, mockUserStats, mockLeaderboard
```

## Writing New Tests

### Backend API Test Example
```typescript
describe('New Feature API', () => {
  let testUser: any
  let authHeaders: any

  beforeEach(async () => {
    await cleanDatabase()
    testUser = await createTestUser()
    const token = generateAuthToken(testUser.id, testUser.email)
    authHeaders = createAuthHeaders(token)
  })

  it('should handle new feature request', async () => {
    const response = await request(app)
      .post('/api/new-feature')
      .set(authHeaders)
      .send({ data: 'test' })
      .expect(200)

    expect(response.body).toMatchObject({
      success: true
    })
  })
})
```

### Frontend Component Test Example
```typescript
describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent prop="value" />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const mockFn = vi.fn()
    render(<NewComponent onAction={mockFn} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: ./run-tests.sh
```

## Test Coverage Goals

- **Backend**: >90% line coverage
- **Frontend**: >80% line coverage
- **Critical Paths**: 100% coverage for auth, progress logging, and scoring

## Best Practices

### Backend
1. Always clean database before each test
2. Use test helpers for common operations
3. Test both success and error scenarios
4. Verify authentication requirements
5. Test edge cases and validation

### Frontend
1. Test component behavior, not implementation
2. Use semantic queries (`getByRole`, `getByLabelText`)
3. Mock external dependencies
4. Test user interactions and accessibility
5. Keep tests focused and isolated

### General
1. Write descriptive test names
2. Group related tests with `describe` blocks
3. Use `beforeEach` for common setup
4. Avoid testing third-party library code
5. Keep tests fast and reliable

## Debugging Tests

### Backend
```bash
# Run specific test file
npm test auth.test.ts

# Run tests in debug mode
npm test -- --detectOpenHandles

# Run with verbose output
npm test -- --verbose
```

### Frontend
```bash
# Run specific test file
npm test -- TaskCard.test.tsx

# Run in watch mode
npm test

# Debug in browser
npm run test:ui
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running for integration tests
   - Check DATABASE_URL environment variable

2. **Frontend Mock Issues**
   - Verify mocks are properly set up in setupTests.ts
   - Check that components are wrapped with providers

3. **Timeout Errors**
   - Increase timeout values for slow operations
   - Check for hanging promises or async operations

4. **Module Resolution**
   - Verify import paths are correct
   - Check tsconfig.json and vite.config.ts configurations

### Getting Help
- Check test output for specific error messages
- Review the test configuration files
- Ensure all dependencies are installed
- Verify environment setup matches requirements

## Deployment Testing

Before deploying to production:

1. Run full test suite: `./run-tests.sh`
2. Check test coverage reports
3. Perform manual testing of critical flows
4. Verify all environment variables are set
5. Run tests against production-like data

## Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Implement visual regression testing
- [ ] Add performance testing
- [ ] Enhance test data fixtures
- [ ] Add mutation testing
- [ ] Implement snapshot testing for UI components