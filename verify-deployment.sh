#!/bin/bash

# Deployment Verification Script
# This script helps verify your deployment configuration

echo "🚀 Urgent Note Sender - Deployment Verification"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URLs are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./verify-deployment.sh <BACKEND_URL> <FRONTEND_URL>"
    echo "Example: ./verify-deployment.sh https://backend.onrender.com https://frontend.vercel.app"
    exit 1
fi

BACKEND_URL=$1
FRONTEND_URL=$2

echo "Testing Backend: $BACKEND_URL"
echo "Testing Frontend: $FRONTEND_URL"
echo ""

# Test backend health endpoint
echo "1. Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/health")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $HEALTH_RESPONSE)${NC}"
fi

# Test backend API base
echo ""
echo "2. Testing backend API base..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api")

if [ "$API_RESPONSE" = "404" ] || [ "$API_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${RED}✗ Backend API not responding properly (HTTP $API_RESPONSE)${NC}"
fi

# Test frontend
echo ""
echo "3. Testing frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend not accessible (HTTP $FRONTEND_RESPONSE)${NC}"
fi

# Test CORS (basic check)
echo ""
echo "4. Testing CORS configuration..."
CORS_RESPONSE=$(curl -s -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: GET" -X OPTIONS "$BACKEND_URL/health" -o /dev/null -w "%{http_code}")

if [ "$CORS_RESPONSE" = "200" ] || [ "$CORS_RESPONSE" = "204" ]; then
    echo -e "${GREEN}✓ CORS appears to be configured${NC}"
else
    echo -e "${YELLOW}⚠ CORS might need attention (HTTP $CORS_RESPONSE)${NC}"
fi

echo ""
echo "================================================"
echo "Verification Complete!"
echo ""
echo "Next steps:"
echo "1. Visit $FRONTEND_URL and register an account"
echo "2. Login and test the full functionality"
echo "3. Check browser console for any errors"
echo ""
echo "If you encounter issues, check:"
echo "- Backend logs on Render"
echo "- Frontend deployment logs on Vercel"
echo "- Environment variables are set correctly"
echo "- CLIENT_ORIGIN on backend matches frontend URL"
echo "- VITE_API_BASE_URL on frontend matches backend URL"
