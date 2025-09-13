#!/bin/bash

set -e

echo "Setting up NIL Moneyball for Production"
echo "======================================"

echo "1. Creating required directories..."
mkdir -p logs
mkdir -p ssl
mkdir -p backups

echo "2. Setting proper permissions..."
chmod +x scripts/*.sh
chmod +x scripts/*.py

echo "3. Creating log files..."
touch logs/access.log
touch logs/error.log
touch logs/nginx_access.log
touch logs/nginx_error.log

echo "4. Checking Docker and Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

echo "5. Validating configuration files..."
if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml found"
else
    echo "❌ docker-compose.yml not found"
    exit 1
fi

if [ -f "nginx.conf" ]; then
    echo "✅ nginx.conf found"
else
    echo "❌ nginx.conf not found"
    exit 1
fi

echo "6. Checking monitoring configuration..."
if [ -f "monitoring/prometheus.yml" ]; then
    echo "✅ Prometheus configuration found"
else
    echo "❌ Prometheus configuration not found"
    exit 1
fi

if [ -f "monitoring/grafana/datasources/prometheus.yml" ]; then
    echo "✅ Grafana datasource configuration found"
else
    echo "❌ Grafana datasource configuration not found"
    exit 1
fi

echo "7. Production setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update environment variables in docker-compose.yml for production"
echo "2. Configure SSL certificates in the ssl/ directory"
echo "3. Run: docker-compose up --build -d"
echo "4. Test with: python scripts/test_production_features.py"
echo ""
echo "Monitoring URLs (after startup):"
echo "- Application: http://localhost"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin123)"
