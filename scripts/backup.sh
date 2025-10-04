#!/bin/bash

# QSDPharmalitics Backup Script
# Creates backups of database and files

set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Create backup directory
mkdir -p $BACKUP_DIR

echo -e "${GREEN}🔄 Starting QSDPharmalitics Backup - $DATE${NC}"

# Database backup
echo -e "${GREEN}📊 Backing up PostgreSQL database...${NC}"
if docker-compose -f $COMPOSE_FILE ps postgres | grep -q "Up"; then
    docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump \
        -U pharmalitics_user pharmalitics \
        | gzip > $BACKUP_DIR/pharmalitics_db_$DATE.sql.gz
    
    DB_SIZE=$(du -h $BACKUP_DIR/pharmalitics_db_$DATE.sql.gz | cut -f1)
    echo -e "${GREEN}✅ Database backup completed: pharmalitics_db_$DATE.sql.gz ($DB_SIZE)${NC}"
else
    echo -e "${RED}❌ PostgreSQL container is not running${NC}"
    exit 1
fi

# Files backup
echo -e "${GREEN}📁 Backing up application files...${NC}"
tar -czf $BACKUP_DIR/pharmalitics_files_$DATE.tar.gz \
    --exclude='./backups' \
    --exclude='./logs/*.log' \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    ./reports ./uploads ./certbot/conf 2>/dev/null || true

FILES_SIZE=$(du -h $BACKUP_DIR/pharmalitics_files_$DATE.tar.gz | cut -f1)
echo -e "${GREEN}✅ Files backup completed: pharmalitics_files_$DATE.tar.gz ($FILES_SIZE)${NC}"

# Configuration backup
echo -e "${GREEN}⚙️ Backing up configuration files...${NC}"
tar -czf $BACKUP_DIR/pharmalitics_config_$DATE.tar.gz \
    .env docker-compose*.yml nginx/ scripts/ \
    2>/dev/null || true

CONFIG_SIZE=$(du -h $BACKUP_DIR/pharmalitics_config_$DATE.tar.gz | cut -f1)
echo -e "${GREEN}✅ Configuration backup completed: pharmalitics_config_$DATE.tar.gz ($CONFIG_SIZE)${NC}"

# Cleanup old backups (keep last 7 days)
echo -e "${GREEN}🧹 Cleaning up old backups...${NC}"
find $BACKUP_DIR -name "pharmalitics_*" -mtime +7 -delete 2>/dev/null || true

# Summary
echo -e "${GREEN}=================== BACKUP SUMMARY ===================${NC}"
echo -e "${GREEN}📅 Date: $DATE${NC}"
echo -e "${GREEN}📊 Database: $DB_SIZE${NC}"
echo -e "${GREEN}📁 Files: $FILES_SIZE${NC}"
echo -e "${GREEN}⚙️ Config: $CONFIG_SIZE${NC}"
echo -e "${GREEN}📂 Location: $BACKUP_DIR${NC}"
echo -e "${GREEN}=======================================================${NC}"

# List recent backups
echo -e "${GREEN}📋 Recent backups:${NC}"
ls -lah $BACKUP_DIR/pharmalitics_*$DATE* 2>/dev/null || true

echo -e "${GREEN}✅ Backup completed successfully!${NC}"