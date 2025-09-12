# NIL Moneyball - Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- Git installed

## Step-by-Step Deployment

### 1. Clone the Repository
```bash
git clone https://github.com/moverton7474/DevinNILMoneyBall2.git
cd DevinNILMoneyBall2
git checkout devin/1726087967-nil-moneyball-fresh-implementation
```

### 2. Start the Application
```bash
docker-compose up --build -d
```

### 3. Verify Services are Running
```bash
docker-compose ps
```
You should see all 5 services (db, redis, backend, frontend, nginx) with status "Up".

### 4. Access the Application
Open your web browser and go to:
- **Main Application**: http://localhost
- **API Documentation**: http://localhost:8000/docs

### 5. Test the Application
1. Register a new user account
2. Login with your credentials
3. Explore the dashboard and features

## Troubleshooting

### If you get "Connection Refused" errors:

1. **Check Docker is running**:
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Check all services are up**:
   ```bash
   docker-compose ps
   ```

3. **Check logs for errors**:
   ```bash
   docker-compose logs
   ```

4. **Restart services**:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

5. **Check port availability**:
   - Make sure port 80 is not being used by another application
   - Try accessing http://localhost:80 directly

### Alternative Access Methods
If port 80 doesn't work, try:
- http://localhost:3000 (direct frontend access)
- http://localhost:8000 (direct backend access)

### Common Issues

**Port 80 already in use**:
```bash
# Stop any existing web servers
sudo service apache2 stop
sudo service nginx stop

# Or modify docker-compose.yml to use different port:
# Change "80:80" to "8080:80" under nginx ports
# Then access via http://localhost:8080
```

**Docker permission issues (Linux)**:
```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

## Application Features
- User registration and authentication
- Team dashboard with analytics
- Athlete management
- NIL deals tracking
- Revenue share management
- Transfer portal monitoring
- Compliance tracking

## Support
If you encounter issues, check:
1. Docker Desktop is running
2. No other applications using port 80
3. All Docker services show "Up" status
4. Firewall isn't blocking the ports
