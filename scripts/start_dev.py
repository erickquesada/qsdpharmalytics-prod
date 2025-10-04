#!/usr/bin/env python3
"""
Development startup script for QSDPharmalitics
Initializes database and starts the development server
"""

import sys
import os
import subprocess
import time

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.database.base import engine, Base
from scripts.init_db import init_db


def check_postgres():
    """Check if PostgreSQL is available"""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return False


def create_tables():
    """Create database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False


def start_backend():
    """Start the FastAPI backend server"""
    try:
        os.chdir('/app')
        print("🚀 Starting QSDPharmalitics Backend Server...")
        
        # Start the server
        subprocess.run([
            "uvicorn", 
            "backend.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8001", 
            "--reload"
        ])
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")


def main():
    """Main startup sequence"""
    print("🏥 QSDPharmalitics Development Setup")
    print("=" * 50)
    
    # Check PostgreSQL connection
    print("1. Checking database connection...")
    if not check_postgres():
        print("⚠️  Using SQLite fallback for development")
        # You might want to switch to SQLite URL here if needed
    
    # Create/update database tables
    print("2. Creating database tables...")
    if not create_tables():
        print("❌ Failed to setup database")
        sys.exit(1)
    
    # Initialize with sample data
    print("3. Initializing sample data...")
    try:
        init_db()
    except Exception as e:
        print(f"⚠️  Sample data initialization failed: {e}")
        print("   Continuing with empty database...")
    
    # Start the backend server
    print("4. Starting backend server...")
    start_backend()


if __name__ == "__main__":
    main()