# NIL Moneyball Deployment Guide

## Overview
This guide covers deployment procedures for the NIL Moneyball application in development, staging, and production environments.

## Prerequisites

### System Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Python 3.12+
- PostgreSQL 15+
- Redis 7+

### Environment Variables
Create `.env` files for each environment:

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_DB=nil_moneyball
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_URL=redis://redis:6379

# Security
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=15

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME="NIL Moneyball"
DEBUG=false

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME="NIL Moneyball"
VITE_ENVIRONMENT=production
```

## Local Development

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd nil-moneyball

# Start all services
docker-compose up --build

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend
```bash
cd backend
poetry install
poetry run alembic upgrade head
poetry run fastapi dev app/main.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

### Docker Compose Production

#### 1. Production docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - VITE_API_URL=${VITE_API_URL}
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 2. Production Dockerfiles

**Backend Dockerfile.prod**
```dockerfile
FROM python:3.12-slim as builder

WORKDIR /app
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false && poetry install --no-dev

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .
EXPOSE 8000
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile.prod**
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Cloud Deployment

#### AWS ECS Deployment
```bash
# Build and push images
docker build -t nil-moneyball-backend ./backend
docker build -t nil-moneyball-frontend ./frontend

# Tag for ECR
docker tag nil-moneyball-backend:latest 123456789.dkr.ecr.region.amazonaws.com/nil-moneyball-backend:latest
docker tag nil-moneyball-frontend:latest 123456789.dkr.ecr.region.amazonaws.com/nil-moneyball-frontend:latest

# Push to ECR
docker push 123456789.dkr.ecr.region.amazonaws.com/nil-moneyball-backend:latest
docker push 123456789.dkr.ecr.region.amazonaws.com/nil-moneyball-frontend:latest
```

#### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nil-moneyball-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nil-moneyball-backend
  template:
    metadata:
      labels:
        app: nil-moneyball-backend
    spec:
      containers:
      - name: backend
        image: nil-moneyball-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: nil-moneyball-secrets
              key: database-url
```

## Database Management

### Migrations
```bash
# Create migration
poetry run alembic revision --autogenerate -m "Description"

# Apply migrations
poetry run alembic upgrade head

# Rollback migration
poetry run alembic downgrade -1
```

### Backups
```bash
# Create backup
docker-compose exec db pg_dump -U postgres nil_moneyball > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T db psql -U postgres nil_moneyball < backup_file.sql
```

### Database Seeding
```bash
# Seed with sample data
poetry run python scripts/seed_database.py
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoring and Logging

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nil-moneyball-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: /metrics
```

### Grafana Dashboards
- API Response Times
- Database Performance
- User Activity
- Error Rates
- System Resources

### Logging Configuration
```python
# backend/app/logging_config.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s %(message)s',
        handlers=[
            RotatingFileHandler('logs/app.log', maxBytes=10485760, backupCount=5),
            logging.StreamHandler()
        ]
    )
```

## Security Checklist

### Pre-Production Security
- [ ] Change all default passwords
- [ ] Generate secure JWT secret keys
- [ ] Configure CORS for production domains only
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable database encryption at rest
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Enable security headers
- [ ] Set up intrusion detection
- [ ] Configure fail2ban
- [ ] Enable audit logging
- [ ] Set up vulnerability scanning

### Environment Variables Security
```bash
# Use secrets management
export SECRET_KEY=$(openssl rand -hex 32)
export JWT_SECRET_KEY=$(openssl rand -hex 32)

# Restrict file permissions
chmod 600 .env
```

## Performance Optimization

### Database Optimization
```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_athletes_team_id ON athletes(team_id);
CREATE INDEX idx_athletes_position ON athletes(position);
CREATE INDEX idx_nil_deals_athlete_id ON nil_deals(athlete_id);
```

### Caching Strategy
```python
# Redis caching for frequently accessed data
@cache.memoize(timeout=300)
def get_athlete_stats(athlete_id):
    return db.query(Athlete).filter(Athlete.id == athlete_id).first()
```

### CDN Configuration
- Static assets served via CDN
- Image optimization and compression
- Gzip compression enabled
- Browser caching headers set

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose ps db
docker-compose logs db

# Test connection
docker-compose exec backend python -c "from app.database import engine; print(engine.execute('SELECT 1').scalar())"
```

#### Memory Issues
```bash
# Monitor memory usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

### Health Checks
```bash
# Backend health
curl -f http://localhost:8000/healthz

# Database health
docker-compose exec db pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping
```

## Rollback Procedures

### Application Rollback
```bash
# Rollback to previous version
docker-compose down
git checkout previous-stable-tag
docker-compose up --build
```

### Database Rollback
```bash
# Rollback database migration
poetry run alembic downgrade -1
```

### Emergency Procedures
1. Take application offline
2. Create database backup
3. Rollback to last known good state
4. Verify system functionality
5. Bring application back online
6. Monitor for issues

## Maintenance

### Regular Maintenance Tasks
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Quarterly performance reviews
- [ ] SSL certificate renewal (automated)
- [ ] Log rotation and cleanup
- [ ] Dependency updates
- [ ] Security vulnerability scans

### Scheduled Downtime
- Plan maintenance windows
- Notify users in advance
- Prepare rollback procedures
- Test in staging environment first
