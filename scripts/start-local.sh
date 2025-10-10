#!/bin/bash

# Local development startup script

echo "🚀 Starting QSDPharmalitics Local Development..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
pip install -r requirements.txt

# Create necessary directories
echo -e "${GREEN}Creating directories...${NC}"
mkdir -p reports uploads logs static

# Initialize database
echo -e "${GREEN}Initializing database...${NC}"
python scripts/init_db.py

# Start the application
echo -e "${GREEN}Starting FastAPI server...${NC}"
echo "API will be available at: http://localhost:8001"
echo "Documentation at: http://localhost:8001/api/v1/docs"
echo "Press Ctrl+C to stop"
echo ""

uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload