#!/bin/bash

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -la /backups/nil_moneyball_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="nil_moneyball"
DB_USER="postgres"
DB_HOST="db"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring from backup: $BACKUP_FILE"

if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | psql -h $DB_HOST -U $DB_USER -d $DB_NAME --no-password
else
    psql -h $DB_HOST -U $DB_USER -d $DB_NAME --no-password < "$BACKUP_FILE"
fi

echo "Restore completed successfully"
