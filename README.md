# Tanafos - Islamic Social Accountability Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791.svg)](https://www.postgresql.org/)

A social accountability application designed for Muslims to track their good deeds (hasanat) and compete with others while maintaining anonymity to ensure pure intentions and avoid showing off (riya).

## ✨ Features

- **📊 Progress Tracking**: Log daily good deeds like reading Quran, praying on time, azkar, helping others, giving charity, and seeking knowledge
- **🏆 Anonymous Leaderboards**: Compete with others using anonymized Islamic names to maintain pure intentions
- **🎯 Gamification**: Earn points for completing tasks and climb the rankings
- **🔐 Secure Authentication**: JWT-based authentication with encrypted passwords
- **📱 Responsive Design**: Beautiful, modern interface that works on all devices
- **⚡ Real-time Updates**: Live leaderboard updates and progress tracking
- **🎨 Islamic Design**: Thoughtfully designed with Islamic principles in mind

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 13 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tanafos
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

3. **Setup PostgreSQL database**
   ```bash
   # Create a PostgreSQL database named 'tanafos_dev'
   createdb tanafos_dev
   ```

4. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp backend/.env backend/.env.local
   
   # Edit the environment variables (especially DATABASE_URL)
   # backend/.env
   DATABASE_URL="postgresql://username:password@localhost:5432/tanafos_dev?schema=public"
   NODE_ENV="development"
   PORT=3001
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

5. **Setup the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   cd ..
   ```

6. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

### Demo Accounts

Use these accounts to test the application:
- **Email**: demo1@example.com **Password**: demo123
- **Email**: demo2@example.com **Password**: demo123
- **Email**: sarah@example.com **Password**: demo123

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── middleware/      # Auth and error handling middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic and data services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions and validation
├── prisma/              # Database schema and migrations
└── tests/               # API and integration tests
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # API client and utilities
│   ├── pages/           # Main application pages
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Frontend utility functions
└── tests/               # Component and integration tests
```

### Database (PostgreSQL + Prisma)
- **Users**: Authentication and profile data
- **Tasks**: Available activities (Exercise, Reading, etc.)
- **ProgressLogs**: Daily progress entries with points
- **UserScores**: Aggregated scores for leaderboards

## 🎯 Usage

### Dashboard
- View your stats: total points, current rank, and daily progress
- Track today's completed tasks
- Log new progress for available tasks

### Progress Logging
1. Click on any task card from the dashboard
2. Enter your progress value (minutes, pages, glasses, etc.)
3. Points are automatically calculated based on the task's point value
4. Progress is logged for the current day (one entry per task per day)

### Leaderboards
- **Overall**: Rankings based on total points across all tasks
- **Task-specific**: Individual leaderboards for each task type
- **Anonymous**: Other users appear with randomized Islamic names
- **Real-time**: Updates immediately when progress is logged

### Name Anonymization
- Uses a collection of beautiful Islamic names
- Each user session gets a consistent but random mapping
- Your own name always appears normally
- Maintains privacy while enabling healthy competition

## 🧪 Testing

### Run All Tests
```bash
# Run both backend and frontend tests
./run-tests.sh
```

### Backend Tests
```bash
cd backend

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend

# Run tests interactively
npm test

# Run tests once (CI mode)
npm run test:run

# Run with UI
npm run test:ui
```

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run test suite

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database Management
```bash
cd backend

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Code Style
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (configured in editors)
- **Strict mode** enabled for both frontend and backend

## 🚀 Deployment

> **Note**: This application has not been deployed to production yet. The following are recommendations for future deployment.

### Environment Variables (Production)
```bash
# Backend environment variables
DATABASE_URL="postgresql://user:password@host:5432/tanafos_prod"
NODE_ENV="production"
PORT=3001
JWT_SECRET="use-a-strong-random-secret-for-production"
```

### Recommended Stack
- **Frontend**: Vercel, Netlify, or AWS CloudFront
- **Backend**: Railway, Heroku, or AWS EC2
- **Database**: Railway PostgreSQL, AWS RDS, or DigitalOcean Managed Database

### Build Commands
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## ⚠️ Current Limitations

- **No task creation**: Users cannot create custom tasks (roadmap item)
- **No group functionality**: Individual tracking only (groups planned)
- **No time customization**: Fixed daily tracking periods
- **Development stage**: Not yet production-ready

## 🗺️ Roadmap

### 🚧 Planned Features
- [ ] **Custom Task Creation**: Allow users to create and customize their own tasks
- [ ] **Group Competition**: Create groups for families, friends, or communities
- [ ] **Time-based Customization**: Flexible tracking periods (weekly, monthly)
- [ ] **Enhanced Analytics**: Progress charts and detailed insights
- [ ] **Mobile Application**: Native iOS and Android apps
- [ ] **Notification System**: Reminders and achievement notifications
- [ ] **Import/Export**: Backup and restore functionality

### 🐛 Known Issues
- Mobile responsiveness needs refinement on smaller screens
- Error handling could be more user-friendly with better messaging

## 🤝 Contributing

We welcome contributions that align with Islamic principles and promote good deeds!

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `./run-tests.sh`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Guidelines
- **Halal purposes only**: Contributions must be for lawful and beneficial purposes
- **Code quality**: Follow TypeScript best practices and include tests
- **Islamic values**: Respect Islamic principles in feature design
- **Documentation**: Update README and add inline comments for complex logic

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Usage Restriction**: This software may only be used for lawful purposes that align with Islamic principles (Halal). Any use for unlawful activities (Haram) is strictly prohibited.

## 💖 Islamic Purpose

This application was created to help Muslims:
- Track and improve their daily acts of worship and self-improvement
- Compete in goodness while maintaining pure intentions (avoiding riya/showing off)
- Build consistent habits that bring them closer to Allah
- Support each other in their spiritual journey anonymously

*"And in that let them compete who compete."* - Quran 83:26

## 📞 Support

For questions, issues, or suggestions:
- **Issues**: Open a GitHub issue for bug reports or feature requests
- **Discussions**: Use GitHub Discussions for questions and community interaction
- **Email**: [Contact maintainer through GitHub profile]

## 🙏 Acknowledgments

- **Islamic Names**: Thank you to the community for contributing beautiful Islamic names for anonymization
- **Testing**: Comprehensive test coverage for reliability
- **Design**: Inspired by Islamic principles of modesty and beneficial competition

---

**May Allah accept our good deeds and grant us sincerity in our intentions. Ameen.**

*Built with ❤️ for the Muslim community*