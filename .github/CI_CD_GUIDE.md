# Tanafos CI/CD Pipeline Guide

## 🚀 Overview

This guide explains the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Tanafos Islamic social accountability platform.

## 🏗️ Pipeline Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │    │   GitHub        │    │   CI/CD         │
│   commits code  │───▶│   repository    │───▶│   pipeline      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Deployment    │◀───│   Tests &       │
                       │   (staging/prod)│    │   Quality       │
                       └─────────────────┘    └─────────────────┘
```

## 📋 Workflows

### 1. Main CI Pipeline (`ci.yml`)
**Triggers**: Push to main/develop, Pull Requests
**Purpose**: Comprehensive testing and validation

#### Jobs:
- **Backend Tests**: API tests, database tests, TypeScript compilation
- **Frontend Tests**: Component tests, build verification, linting
- **Integration Tests**: Full application testing using `run-tests.sh`
- **Security Checks**: Dependency auditing, vulnerability scanning
- **Build Verification**: Production build validation

### 2. Pull Request Checks (`pr-checks.yml`)
**Triggers**: Pull request events
**Purpose**: Fast feedback for PR validation

#### Jobs:
- **Quick Validation**: Change detection, title validation, sensitive info check
- **Conditional Testing**: Only runs tests for changed components
- **Islamic Guidelines Check**: Ensures code aligns with Islamic principles
- **PR Summary**: Automated status reporting

### 3. Deployment Pipeline (`deploy.yml`)
**Triggers**: Push to main, tags, manual dispatch
**Purpose**: Automated deployment to staging/production

#### Jobs:
- **Pre-deployment Checks**: Environment determination, Islamic intention check
- **Build & Test**: Comprehensive testing before deployment
- **Staging Deployment**: Automated staging environment updates
- **Production Deployment**: Controlled production releases
- **Post-deployment Monitoring**: Health checks and monitoring setup

## 🔧 Configuration Files

### Environment Setup
Each workflow uses PostgreSQL for testing:
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tanafos_test
```

### Environment Variables
Required for CI/CD:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tanafos_test"
NODE_ENV="test"
PORT=3001
JWT_SECRET="test-jwt-secret-for-ci"
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Service and utility function tests
- **Integration Tests**: API endpoint testing with real database
- **Database Tests**: Migration and seed testing
- **Security Tests**: Authentication and authorization testing

### Frontend Testing
- **Component Tests**: React component functionality
- **Integration Tests**: User flow testing
- **Build Tests**: Production build verification
- **Lint Tests**: Code quality and style checking

### Test Coverage Goals
- Backend: ≥80% line coverage
- Frontend: ≥70% line coverage
- Critical paths: 100% coverage

## 🔒 Security Measures

### Dependency Management
- **Automated auditing**: npm audit on every build
- **Dependabot**: Weekly dependency updates
- **Vulnerability scanning**: Critical/high severity blocking

### Sensitive Data Protection
- **Secret scanning**: Automated detection of potential secrets
- **Environment isolation**: Separate configs for test/staging/production
- **Access control**: Protected branches and environment approvals

## 🌙 Islamic Compliance Checks

### Code Review Guidelines
- **Purpose validation**: Ensures code serves halal purposes
- **Content scanning**: Checks for inappropriate terminology
- **Intention checks**: Reminds developers of Islamic purpose
- **Gratitude expressions**: Islamic prayers and gratitude in workflows

### Naming Conventions
PR titles should follow: `type(scope): description`
Examples:
- `feat(auth): add Islamic authentication flow`
- `fix(ui): improve Arabic text rendering`
- `docs(api): update halal compliance guidelines`

## 📊 Monitoring and Reporting

### Test Results
- **Coverage reports**: Uploaded to Codecov
- **PR comments**: Automated test result summaries
- **Build status**: Real-time feedback on all checks

### Deployment Monitoring
- **Health checks**: Post-deployment application monitoring
- **Performance tracking**: Response time and error rate monitoring
- **Islamic compliance**: Ongoing verification of platform purpose

## 🚀 Deployment Process

### Staging Deployment
1. **Trigger**: Push to main branch
2. **Process**: Automated after all tests pass
3. **Environment**: `staging`
4. **Purpose**: Testing before production release

### Production Deployment
1. **Trigger**: Git tags (`v*`) or manual dispatch
2. **Process**: Manual approval required
3. **Environment**: `production`
4. **Purpose**: Live platform for Muslim community

## 🛠️ Setup Instructions

### 1. Repository Secrets
Configure these secrets in GitHub repository settings:

```bash
# For production deployment (when ready)
PROD_DATABASE_URL       # Production database connection
PROD_JWT_SECRET         # Production JWT secret
STAGING_DATABASE_URL    # Staging database connection
STAGING_JWT_SECRET      # Staging JWT secret
```

### 2. Branch Protection
Enable branch protection for `main`:
- Require status checks to pass
- Require pull request reviews
- Restrict pushes to protected branches

### 3. Environment Configuration
Set up GitHub environments:
- **staging**: Auto-deployment from main
- **production**: Manual approval required

## 📝 Workflow Customization

### Adding New Tests
1. Add test files to appropriate directories
2. Update package.json scripts if needed
3. Modify workflow files to include new test categories

### Modifying Islamic Checks
Edit the `islamic-guidelines-check` job in `pr-checks.yml`:
```yaml
# Add new terms to check for
if grep -i -E "(new-haram-term|another-term)" "$file"; then
  echo "⚠️ Found potentially inappropriate terms in $file"
  ISSUES_FOUND=true
fi
```

### Deployment Customization
Update `deploy.yml` with your actual deployment steps:
- Replace placeholder deployment commands
- Add real health check endpoints
- Configure monitoring and alerting

## 🤝 Contributing to CI/CD

### Best Practices
1. **Test locally**: Run `./run-tests.sh` before pushing
2. **Islamic intentions**: Keep the platform's purpose in mind
3. **Security first**: Never commit secrets or sensitive data
4. **Documentation**: Update this guide when making changes

### Islamic Development Principles
- **Bismillah**: Begin work with Islamic intention
- **Quality**: Strive for excellence in code and tests
- **Purpose**: Ensure all features serve halal purposes
- **Community**: Build for the benefit of Muslim community
- **Gratitude**: Thank Allah for successful deployments

## 🆘 Troubleshooting

### Common Issues

#### Test Failures
```bash
# Local debugging
cd backend && npm test
cd frontend && npm run test:run
./run-tests.sh
```

#### Database Issues
```bash
# Reset test database
cd backend
npx prisma migrate reset --force
npx prisma db seed
```

#### Build Failures
```bash
# Check TypeScript compilation
cd backend && npm run build
cd frontend && npm run build
```

### Getting Help
1. Check workflow logs in GitHub Actions
2. Review test output for specific errors
3. Ensure all environment variables are set
4. Verify database connectivity

## 🤲 Islamic Closing

*Alhamdulillahi rabbil alameen* - All praise is due to Allah, the Lord of the worlds.

May Allah accept our efforts in building this platform to help Muslims track their good deeds and compete in righteousness. May it be a source of barakah and bring us closer to Allah.

*Barakallahu feekum* - May Allah bless you all.

---

**Remember**: This CI/CD pipeline serves a noble Islamic purpose. Every commit, test, and deployment should be done with the intention of serving Allah and helping the Muslim community. 🌟