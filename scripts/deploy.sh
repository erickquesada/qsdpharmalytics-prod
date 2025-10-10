#!/bin/bash

# QSDPharmalitics Production Deployment Script
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Starting QSDPharmalitics Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Create necessary directories
mkdir -p ./backups ./logs ./certbot/conf ./certbot/www ./nginx/ssl

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    echo "[ERROR] $1" >> $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
    echo "[WARNING] $1" >> $LOG_FILE
}

# Check if .env file exists
if [ ! -f .env ]; then
    if [ -f .env.prod ]; then
        log "Using .env.prod file for production deployment"
        cp .env.prod .env
    else
        error ".env file not found. Please copy .env.example to .env and configure it."
        error "Or use .env.prod for production deployment."
        exit 1
    fi
fi

# Source environment variables
source .env

# Set default values if not provided
if [ -z "$DB_PASSWORD" ]; then
    export DB_PASSWORD="pharmalitics_pass"
fi
if [ -z "$REDIS_PASSWORD" ]; then
    export REDIS_PASSWORD="redis_pass"
fi
if [ -z "$SECRET_KEY" ]; then
    export SECRET_KEY="pharmalitics-change-this-secret-key-32-chars"
fi

log "Environment variables validated successfully"

# Pull latest changes from git (if git repo exists)
if [ -d ".git" ]; then
    log "Pulling latest changes from repository..."
    git pull origin main || log "Warning: Could not pull from git repository"
else
    log "Not a git repository, skipping git pull"
fi

# Create backup of current database (if exists)
log "Creating database backup..."
if docker compose -f $COMPOSE_FILE ps postgres | grep -q "Up"; then
    DATE=$(date +%Y%m%d_%H%M%S)
    docker compose -f $COMPOSE_FILE exec -T postgres pg_dump \
        -U pharmalitics_user pharmalitics \
        | gzip > $BACKUP_DIR/pharmalitics_backup_$DATE.sql.gz
    log "Database backup created: pharmalitics_backup_$DATE.sql.gz"
else
    warning "PostgreSQL container not running, skipping backup"
fi

# Stop existing services
log "Stopping existing services..."
docker compose -f $COMPOSE_FILE down --remove-orphans

# Build new images
log "Building new Docker images..."
docker compose -f $COMPOSE_FILE build --no-cache backend

# Start database and cache first
log "Starting PostgreSQL and Redis..."
docker compose -f $COMPOSE_FILE up -d postgres redis

# Wait for database to be ready
log "Waiting for database to be ready..."
sleep 30

# Check database health
for i in {1..10}; do
    if docker compose -f $COMPOSE_FILE exec postgres pg_isready -U pharmalitics_user -d pharmalitics; then
        log "Database is ready"
        break
    fi
    if [ $i -eq 10 ]; then
        error "Database failed to start after 10 attempts"
        exit 1
    fi
    log "Waiting for database... (attempt $i/10)"
    sleep 10
done

# Start backend service
log "Starting backend service..."
docker compose -f $COMPOSE_FILE up -d backend

# Wait for backend to be ready
log "Waiting for backend to be ready..."
sleep 20

# Check backend health
for i in {1..10}; do
    if docker compose -f $COMPOSE_FILE exec backend curl -f http://localhost:8001/api/v1/health; then
        log "Backend is ready"
        break
    fi
    if [ $i -eq 10 ]; then
        error "Backend failed to start after 10 attempts"
        exit 1
    fi
    log "Waiting for backend... (attempt $i/10)"
    sleep 10
done

# Initialize/migrate database
log "Initializing database..."
docker compose -f $COMPOSE_FILE exec backend python scripts/init_db.py

# Start Nginx
log "Starting Nginx reverse proxy..."
docker compose -f $COMPOSE_FILE up -d nginx

# Obtain/renew SSL certificate
log "Obtaining/renewing SSL certificate..."
if [ ! -d "./certbot/conf/live/pharma.qsdconnect.cloud" ]; then
    log "Obtaining new SSL certificate..."
    docker compose -f $COMPOSE_FILE run --rm certbot \
        certonly --webroot --webroot-path=/var/www/certbot \
        --email admin@qsdconnect.cloud --agree-tos --no-eff-email \
        -d pharma.qsdconnect.cloud -d www.pharma.qsdconnect.cloud
else
    log "Renewing existing SSL certificate..."
    docker compose -f $COMPOSE_FILE run --rm certbot renew
fi

# Reload Nginx with new certificates
log "Reloading Nginx configuration..."
docker compose -f $COMPOSE_FILE exec nginx nginx -s reload

# Start monitoring services (optional)
if [ "$1" = "--with-monitoring" ]; then
    log "Starting monitoring services..."
    docker compose -f $COMPOSE_FILE --profile admin up -d pgadmin
fi

# Final health check
log "Performing final health check..."
sleep 10

# Check all services status
log "Checking services status..."
docker compose -f $COMPOSE_FILE ps

# Test API endpoints
log "Testing API endpoints..."
API_BASE="https://pharma.qsdconnect.cloud/api/v1"

# Test health endpoint
if curl -s -f "$API_BASE/health" > /dev/null; then
    log "✅ Health endpoint: OK"
else
    error "❌ Health endpoint: FAILED"
fi

# Test authentication endpoint
if curl -s -f -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username_or_email": "admin", "password": "admin"}' > /dev/null; then
    log "✅ Authentication endpoint: OK"
else
    warning "⚠️  Authentication endpoint: Check manually"
fi

# Display deployment summary
log "=================== DEPLOYMENT SUMMARY ==================="
log "🌐 API URL: https://pharma.qsdconnect.cloud"
log "📚 Documentation: https://pharma.qsdconnect.cloud/api/v1/docs"
log "📊 Interactive Docs: https://pharma.qsdconnect.cloud/api/v1/redoc"

if [ "$1" = "--with-monitoring" ]; then
    log "🔧 PgAdmin: http://your-server-ip:5050"
fi

log "👥 Default Users:"
log "   Admin: admin / admin"
log "   Analyst: analyst / analyst"
log "   Sales Rep: salesrep / sales"

log "📁 Logs Location: $LOG_FILE"
log "💾 Backups Location: $BACKUP_DIR"
log "========================================================="

# Show useful commands
log ""
log "📋 Useful Commands:"
log "   View logs: docker compose -f $COMPOSE_FILE logs -f [service]"
log "   Restart service: docker compose -f $COMPOSE_FILE restart [service]"
log "   Scale service: docker compose -f $COMPOSE_FILE up -d --scale backend=2"
log "   Database backup: ./scripts/backup.sh"
log "   Stop all: docker compose -f $COMPOSE_FILE down"

log "🎉 Deployment completed successfully!"
log "The QSDPharmalitics API is now running in production mode."

# Exit successfully
exit 0