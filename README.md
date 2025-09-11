# NIL Moneyball College Football Analytics Platform

A comprehensive analytics platform implementing the Baron Hopson valuation methodology for athlete recruiting, NIL, and revenue share optimization in the college football revenue share era.

## Architecture

The platform consists of:
- **Backend**: Python 3.11+ Flask API with PostgreSQL, Redis, Celery
- **Frontend**: React 18.3.1 with TypeScript, Vite, Tailwind CSS
- **Analytics Engine**: Baron Hopson valuation methodology
- **Monitoring**: Prometheus & Grafana
- **Containerization**: Docker & docker-compose

## Features

### Core Analytics
- Baron Hopson athlete valuation scoring
- NIL market value calculations
- Transfer portal analytics
- Roster optimization
- Performance analytics dashboard

### Revenue Share Era Features
- Revenue share cap tracking
- Compliance dashboards
- Automated NIL/revenue share disclosure
- Athlete tax tools
- Back-pay eligibility tracking
- Donor portal integration
- Title IX compliance monitoring

## Quick Start

1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access the application at `http://localhost:3000`
4. API documentation available at `http://localhost:8000/docs`

## Development

### Backend Setup
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend tests
cd backend && poetry run pytest

# Frontend tests
cd frontend && npm test
```

## Documentation

- [API Documentation](./docs/API.md)
- [Testing Guide](./docs/TESTING.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Baron Hopson Methodology](./docs/BARON_HOPSON.md)

## License

MIT License
