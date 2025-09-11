# NIL Moneyball API Documentation

## Overview
The NIL Moneyball API provides comprehensive college football analytics and NIL management capabilities using the Baron Hopson valuation methodology.

## Base URL
- Development: `http://localhost:8000`
- Production: `https://your-domain.com/api`

## Authentication
All protected endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Health Check
- **GET** `/healthz`
- **Description**: Check API health status
- **Response**: `{"status": "ok", "message": "NIL Moneyball API is running"}`

### Authentication

#### Register User
- **POST** `/auth/register`
- **Body**:
```json
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "full_name": "string",
  "role": "user|coach|admin"
}
```
- **Response**: User object with id, username, email, full_name, role, is_active

#### Login
- **POST** `/auth/login`
- **Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response**:
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user": {user_object}
}
```

#### Get Current User
- **GET** `/auth/me`
- **Headers**: Authorization: Bearer {token}
- **Response**: Current user object

### Teams

#### Get Teams
- **GET** `/teams`
- **Headers**: Authorization: Bearer {token}
- **Response**: Array of team objects

#### Create Team
- **POST** `/teams`
- **Headers**: Authorization: Bearer {token}
- **Body**:
```json
{
  "name": "string",
  "conference": "string",
  "division": "string",
  "revenue_share_cap": 0
}
```

### Athletes

#### Get Athletes
- **GET** `/athletes`
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `team_id`: Filter by team ID
  - `position`: Filter by position
- **Response**: Array of athlete objects

#### Create Athlete
- **POST** `/athletes`
- **Headers**: Authorization: Bearer {token}
- **Body**:
```json
{
  "name": "string",
  "position": "string",
  "year": "string",
  "team_id": 0,
  "height": 0,
  "weight": 0,
  "stats": {},
  "nil_value": 0
}
```

#### Get Athlete
- **GET** `/athletes/{athlete_id}`
- **Headers**: Authorization: Bearer {token}
- **Response**: Athlete object with full details

### Analytics

#### Evaluate Athlete (Baron Hopson)
- **POST** `/analytics/evaluate-athlete/{athlete_id}`
- **Headers**: Authorization: Bearer {token}
- **Response**:
```json
{
  "athlete_id": 0,
  "baron_hopson_score": 0,
  "market_value": 0,
  "performance_metrics": {},
  "recommendations": []
}
```

#### Optimize Roster
- **POST** `/analytics/optimize-roster`
- **Headers**: Authorization: Bearer {token}
- **Body**:
```json
{
  "team_id": 0,
  "budget": 0,
  "constraints": {}
}
```

### Revenue Share

#### Get Revenue Share Data
- **GET** `/revenue-share/{team_id}`
- **Headers**: Authorization: Bearer {token}
- **Response**: Revenue share allocation data

#### Update Revenue Share
- **PUT** `/revenue-share/{team_id}`
- **Headers**: Authorization: Bearer {token}
- **Body**: Revenue share allocation object

### NIL Deals

#### Get NIL Deals
- **GET** `/nil-deals`
- **Headers**: Authorization: Bearer {token}
- **Response**: Array of NIL deal objects

#### Create NIL Deal
- **POST** `/nil-deals`
- **Headers**: Authorization: Bearer {token}
- **Body**: NIL deal object

### Transfer Portal

#### Get Transfer Portal Data
- **GET** `/transfer-portal`
- **Headers**: Authorization: Bearer {token}
- **Response**: Array of transfer portal entries

### Compliance

#### Get Compliance Reports
- **GET** `/compliance/reports`
- **Headers**: Authorization: Bearer {token}
- **Response**: Array of compliance report objects

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["field_name"],
      "msg": "Error message",
      "type": "error_type"
    }
  ]
}
```

## Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Performance
- Target response time: <200ms for key endpoints
- Database queries optimized with proper indexing
- Caching implemented for frequently accessed data

## Baron Hopson Methodology
The API implements the Baron Hopson valuation methodology for athlete assessment:
- Performance metrics analysis
- Market value calculation
- ROI projections
- Risk assessment
- Comparative analysis

For detailed methodology documentation, see the Baron Hopson implementation guide.
