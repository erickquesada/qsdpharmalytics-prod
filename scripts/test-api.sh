#!/bin/bash

# Test script for QSDPharmalitics API

echo "🧪 Testing QSDPharmalitics API..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
API_BASE="http://localhost:8001"
if [ "$1" = "prod" ]; then
    API_BASE="https://pharma.qsdconnect.cloud"
fi

echo "Testing API at: $API_BASE"
echo "================================"

# Test 1: Health Check
echo -n "1. Health Check: "
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE/api/v1/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($HEALTH_RESPONSE)"
else
    echo -e "${RED}✗ FAIL${NC} ($HEALTH_RESPONSE)"
fi

# Test 2: Root Endpoint
echo -n "2. Root Endpoint: "
ROOT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE/)
if [ "$ROOT_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($ROOT_RESPONSE)"
else
    echo -e "${RED}✗ FAIL${NC} ($ROOT_RESPONSE)"
fi

# Test 3: API Documentation
echo -n "3. API Docs: "
DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE/api/v1/docs)
if [ "$DOCS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($DOCS_RESPONSE)"
else
    echo -e "${RED}✗ FAIL${NC} ($DOCS_RESPONSE)"
fi

# Test 4: Authentication
echo -n "4. Authentication: "
AUTH_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username_or_email": "admin", "password": "admin"}' \
    -w "%{http_code}" -o /tmp/auth_response.json)

if [ "$AUTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($AUTH_RESPONSE)"
    
    # Extract token for further tests
    TOKEN=$(cat /tmp/auth_response.json | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    
    if [ ! -z "$TOKEN" ]; then
        # Test 5: Protected Endpoint
        echo -n "5. Protected Endpoint: "
        USER_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
            -o /dev/null -w "%{http_code}" "$API_BASE/api/v1/users/me")
        
        if [ "$USER_RESPONSE" = "200" ]; then
            echo -e "${GREEN}✓ PASS${NC} ($USER_RESPONSE)"
        else
            echo -e "${RED}✗ FAIL${NC} ($USER_RESPONSE)"
        fi
    fi
else
    echo -e "${RED}✗ FAIL${NC} ($AUTH_RESPONSE)"
    echo -e "${YELLOW}Check if database is initialized and users exist${NC}"
fi

# Test 6: Products Endpoint
echo -n "6. Products List: "
PRODUCTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/v1/products")
if [ "$PRODUCTS_RESPONSE" = "200" ] || [ "$PRODUCTS_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✓ PASS${NC} ($PRODUCTS_RESPONSE)"
else
    echo -e "${RED}✗ FAIL${NC} ($PRODUCTS_RESPONSE)"
fi

echo "================================"
echo "🏁 API Testing completed!"

# Clean up
rm -f /tmp/auth_response.json