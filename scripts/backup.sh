#!/bin/bash

set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="nil_moneyball"
DB_USER="postgres"
DB_HOST="db"
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME --no-password > "$BACKUP_DIR/nil_moneyball_$TIMESTAMP.sql"

gzip "$BACKUP_DIR/nil_moneyball_$TIMESTAMP.sql"

echo "Backup completed: nil_moneyball_$TIMESTAMP.sql.gz"

find $BACKUP_DIR -name "nil_moneyball_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Cleanup completed - removed backups older than $RETENTION_DAYS days"

echo "Current backups:"
ls -la $BACKUP_DIR/nil_moneyball_*.sql.gz 2>/dev/null || echo "No backups found"
