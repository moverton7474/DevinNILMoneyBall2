# NIL Moneyball Testing Guide

## Overview
This document outlines the testing strategy and procedures for the NIL Moneyball application.

## Test Structure

### Backend Tests
Located in `backend/tests/`

#### Running Tests
```bash
cd backend
poetry run pytest tests/ -v
```

#### Test Coverage
- **Authentication**: User registration, login, JWT token validation
- **API Endpoints**: All CRUD operations for teams, athletes, NIL deals
- **Baron Hopson Engine**: Valuation calculations and analytics
- **Database Operations**: Model creation, relationships, queries
- **Security**: Authorization, input validation, error handling

#### Test Files
- `test_main.py`: Core API endpoint tests
- `test_auth.py`: Authentication and authorization tests
- `test_baron_hopson.py`: Valuation methodology tests
- `test_models.py`: Database model tests

### Frontend Tests
Located in `frontend/src/tests/`

#### Running Tests
```bash
cd frontend
npm test
```

#### Test Coverage
- **Components**: UI component rendering and behavior
- **Authentication**: Login/logout flows, protected routes
- **API Integration**: Service calls and error handling
- **User Flows**: Complete user journeys through the application

### Integration Tests

#### API Integration
```bash
# Test complete API workflows
cd backend
poetry run pytest tests/integration/ -v
```

#### End-to-End Tests
```bash
# Test complete user workflows
cd frontend
npm run test:e2e
```

## Manual Testing Procedures

### Backend API Testing

#### 1. Health Check
```bash
curl http://localhost:8000/healthz
```
Expected: `{"status": "ok", "message": "NIL Moneyball API is running"}`

#### 2. User Registration
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User",
    "role": "user"
  }'
```

#### 3. User Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

#### 4. Protected Endpoints
```bash
# Get JWT token from login response
TOKEN="your_jwt_token_here"

# Test protected endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/athletes
```

### Frontend Testing

#### 1. Start Development Server
```bash
cd frontend
npm run dev
```

#### 2. Manual UI Testing
- Navigate to `http://localhost:5173`
- Test login/registration forms
- Verify protected route redirects
- Test all navigation links
- Verify responsive design on different screen sizes

#### 3. User Flow Testing
1. **Registration Flow**
   - Fill out registration form
   - Verify validation errors
   - Complete successful registration
   - Verify automatic login after registration

2. **Login Flow**
   - Test with invalid credentials
   - Test with valid credentials
   - Verify redirect to dashboard
   - Test logout functionality

3. **Dashboard Navigation**
   - Test all navigation menu items
   - Verify data loading states
   - Test error handling for API failures

### Performance Testing

#### API Response Times
```bash
# Test key endpoint performance
time curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/athletes
```
Target: <200ms response time

#### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test concurrent requests
ab -n 1000 -c 10 http://localhost:8000/healthz
```

### Docker Testing

#### 1. Build and Start Services
```bash
docker-compose up --build
```

#### 2. Test Service Health
```bash
# Test database connection
docker-compose exec db pg_isready -U postgres

# Test Redis connection
docker-compose exec redis redis-cli ping

# Test backend API
curl http://localhost:8000/healthz

# Test frontend
curl http://localhost:3000
```

#### 3. Test Service Communication
```bash
# Test backend-database communication
docker-compose exec backend poetry run python -c "
from app.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT 1'))
    print('Database connection successful')
"
```

## Test Data

### Sample Users
```json
{
  "username": "coach1",
  "email": "coach@university.edu",
  "password": "securepass123",
  "full_name": "Head Coach",
  "role": "coach"
}
```

### Sample Athletes
```json
{
  "name": "John Smith",
  "position": "QB",
  "year": "Junior",
  "height": 74,
  "weight": 210,
  "stats": {
    "passing_yards": 3500,
    "touchdowns": 28,
    "interceptions": 8
  }
}
```

### Sample Teams
```json
{
  "name": "University Tigers",
  "conference": "SEC",
  "division": "FBS",
  "revenue_share_cap": 20000000
}
```

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull request creation
- Push to main branch
- Scheduled daily runs

### Test Requirements
- All tests must pass before merge
- Code coverage must be >80%
- No security vulnerabilities detected
- Performance benchmarks met

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check database status
docker-compose ps db

# View database logs
docker-compose logs db
```

#### Authentication Failures
- Verify JWT secret key configuration
- Check token expiration times
- Validate user credentials in database

#### API Response Errors
- Check backend logs for detailed error messages
- Verify request format and headers
- Test with curl for debugging

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true

# Run with verbose output
poetry run pytest tests/ -v -s
```

## Test Automation

### Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Automated Testing Pipeline
1. Lint and format checks
2. Unit tests
3. Integration tests
4. Security scans
5. Performance benchmarks
6. Docker build verification

## Reporting
- Test results logged to `test-results/`
- Coverage reports in `coverage/`
- Performance metrics in `performance/`
- Security scan results in `security/`
