#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! pg_isready -h postgres -U ${POSTGRES_USER:-pharmalitics_user} > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready!"

echo "Running database migrations..."
cd /app
alembic upgrade head || echo "Migration failed or no migrations to run"

echo "Creating initial admin user..."
python -c "
import sys
sys.path.insert(0, '/app')
from backend.core.database import SessionLocal
from backend.models.user import User
from backend.core.security import get_password_hash

db = SessionLocal()
try:
    # Check if admin exists
    admin = db.query(User).filter(User.username == 'admin').first()
    if not admin:
        admin = User(
            email='admin@qsdpharma.com',
            username='admin',
            hashed_password=get_password_hash('admin123'),
            first_name='Admin',
            last_name='System',
            role='admin',
            is_active=True
        )
        db.add(admin)
        db.commit()
        print('Admin user created successfully!')
    else:
        print('Admin user already exists')
except Exception as e:
    print(f'Error creating admin user: {e}')
    db.rollback()
finally:
    db.close()
" || echo "Could not create admin user"

echo "Starting application..."
exec "$@"
