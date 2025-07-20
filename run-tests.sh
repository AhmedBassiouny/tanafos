#!/bin/bash

# Test runner script for Tanafos application
# This script runs both backend and frontend tests

set -e

# Suppress npm engine warnings
export NPM_CONFIG_ENGINE_STRICT=false

# Function to filter out npm engine warnings
filter_npm_warnings() {
    grep -v "npm warn EBADENGINE"
}

echo "🧪 Running Tanafos Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_status "❌ Backend directory not found!" $RED
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    print_status "❌ Frontend directory not found!" $RED
    exit 1
fi

print_status "🔧 Installing dependencies..." $YELLOW

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install 2>&1 | filter_npm_warnings
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install 2>&1 | filter_npm_warnings
cd ..

print_status "🔧 Setting up test database..." $YELLOW
echo "================================"

cd backend

# Run database migrations for tests
echo "Running database migrations..."
if npx prisma migrate deploy 2>&1 | filter_npm_warnings; then
    print_status "✅ Database migrations completed!" $GREEN
else
    print_status "❌ Database migrations failed!" $RED
    cd ..
    exit 1
fi

# Run database seed (optional, may fail if no seed file)
echo "Running database seed..."
if npx prisma db seed 2>&1 | filter_npm_warnings; then
    print_status "✅ Database seed completed!" $GREEN
else
    print_status "⚠️  Database seed failed or not available (this is optional)" $YELLOW
fi

print_status "🧪 Running Backend Tests..." $YELLOW
echo "================================"
if npm test 2>&1 | filter_npm_warnings; then
    print_status "✅ Backend tests passed!" $GREEN
    BACKEND_TESTS_PASSED=true
else
    print_status "❌ Backend tests failed!" $RED
    BACKEND_TESTS_PASSED=false
fi
cd ..

print_status "🧪 Running Frontend Tests..." $YELLOW
echo "================================"

cd frontend
if npm run test:run; then
    print_status "✅ Frontend tests passed!" $GREEN
    FRONTEND_TESTS_PASSED=true
else
    print_status "❌ Frontend tests failed!" $RED
    FRONTEND_TESTS_PASSED=false
fi
cd ..

print_status "📊 Test Summary" $YELLOW
echo "================================"

if [ "$BACKEND_TESTS_PASSED" = true ]; then
    print_status "✅ Backend: PASSED" $GREEN
else
    print_status "❌ Backend: FAILED" $RED
fi

if [ "$FRONTEND_TESTS_PASSED" = true ]; then
    print_status "✅ Frontend: PASSED" $GREEN
else
    print_status "❌ Frontend: FAILED" $RED
fi

if [ "$BACKEND_TESTS_PASSED" = true ] && [ "$FRONTEND_TESTS_PASSED" = true ]; then
    print_status "🎉 All tests passed! Application is ready for deployment." $GREEN
    exit 0
else
    print_status "💥 Some tests failed. Please check the output above." $RED
    exit 1
fi