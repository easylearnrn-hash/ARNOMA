#!/bin/bash

# ============================================================================
# DEPLOYMENT VALIDATION SCRIPT
# Prevents deployment of invalid Supabase credentials
# ============================================================================

set -e  # Exit on any error

echo "🔍 VALIDATING DEPLOYMENT..."
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FILE="index.html"

# 1. Check file exists
if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ ERROR: $FILE not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ File found: $FILE${NC}"

# 2. Extract SUPABASE_ANON_KEY
ANON_KEY=$(grep -o "SUPABASE_ANON_KEY = '[^']*'" "$FILE" | cut -d"'" -f2)

if [ -z "$ANON_KEY" ]; then
    echo -e "${RED}❌ ERROR: Could not find SUPABASE_ANON_KEY${NC}"
    exit 1
fi
echo -e "${GREEN}✅ ANON_KEY found${NC}"

# 3. Validate JWT format (3 parts separated by dots)
PARTS=$(echo "$ANON_KEY" | tr '.' '\n' | wc -l)
if [ "$PARTS" -ne 3 ]; then
    echo -e "${RED}❌ ERROR: Invalid JWT format (expected 3 parts, got $PARTS)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ JWT format valid (3 parts)${NC}"

# 4. Decode and validate payload
PAYLOAD=$(echo "$ANON_KEY" | cut -d'.' -f2)
# Add padding if needed
case $((${#PAYLOAD} % 4)) in
    2) PAYLOAD="${PAYLOAD}==";;
    3) PAYLOAD="${PAYLOAD}=";;
esac

DECODED=$(echo "$PAYLOAD" | base64 -d 2>/dev/null || echo "")

if [ -z "$DECODED" ]; then
    echo -e "${RED}❌ ERROR: Failed to decode JWT payload${NC}"
    exit 1
fi
echo -e "${GREEN}✅ JWT payload decoded${NC}"

# 5. Validate required fields
echo "$DECODED" | grep -q '"iss":"supabase"' || {
    echo -e "${RED}❌ ERROR: Invalid issuer (must be 'supabase')${NC}"
    exit 1
}
echo -e "${GREEN}✅ Issuer: supabase${NC}"

echo "$DECODED" | grep -q '"ref":"zlvnxvrzotamhpezqedr"' || {
    echo -e "${RED}❌ ERROR: Invalid project ref${NC}"
    exit 1
}
echo -e "${GREEN}✅ Project ref: zlvnxvrzotamhpezqedr${NC}"

echo "$DECODED" | grep -q '"role":"anon"' || {
    echo -e "${RED}❌ ERROR: Invalid role (must be 'anon')${NC}"
    exit 1
}
echo -e "${GREEN}✅ Role: anon${NC}"

# 6. Validate issued date is in the past
IAT=$(echo "$DECODED" | grep -o '"iat":[0-9]*' | cut -d':' -f2)
NOW=$(date +%s)

if [ "$IAT" -gt "$NOW" ]; then
    echo -e "${RED}❌ ERROR: Token issued date is in the FUTURE!${NC}"
    echo -e "   IAT: $IAT ($(date -r $IAT))"
    echo -e "   NOW: $NOW ($(date -r $NOW))"
    exit 1
fi
echo -e "${GREEN}✅ Issued date valid: $(date -r $IAT)${NC}"

# 7. Validate expiration is in the future
EXP=$(echo "$DECODED" | grep -o '"exp":[0-9]*' | cut -d':' -f2)

if [ "$EXP" -lt "$NOW" ]; then
    echo -e "${RED}❌ ERROR: Token has EXPIRED!${NC}"
    echo -e "   EXP: $EXP ($(date -r $EXP))"
    echo -e "   NOW: $NOW ($(date -r $NOW))"
    exit 1
fi
echo -e "${GREEN}✅ Expiration valid: $(date -r $EXP)${NC}"

# 8. Validate correct ANON_KEY value (known good key)
EXPECTED_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsdm54dnJ6b3RhbWhwZXpxZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0NjU0NDgsImV4cCI6MjA0NjA0MTQ0OH0.xJxL6HXuCVlxvnEqmRO8yXQMY1GCFMGCo4e2MhEFT-Y"

if [ "$ANON_KEY" != "$EXPECTED_KEY" ]; then
    echo -e "${YELLOW}⚠️  WARNING: ANON_KEY differs from expected value${NC}"
    echo -e "   Expected: ${EXPECTED_KEY:0:40}..."
    echo -e "   Got:      ${ANON_KEY:0:40}..."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ ANON_KEY matches expected value${NC}"
fi

# 9. Test Supabase connection
echo ""
echo "🔄 Testing Supabase connection..."
RESPONSE=$(curl -s -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
    "https://zlvnxvrzotamhpezqedr.supabase.co/rest/v1/payments?select=count&limit=1")

if echo "$RESPONSE" | grep -q "Invalid API key"; then
    echo -e "${RED}❌ ERROR: API key rejected by Supabase!${NC}"
    echo -e "   Response: $RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Supabase connection successful${NC}"

# All checks passed!
echo ""
echo "================================"
echo -e "${GREEN}🎉 ALL VALIDATION CHECKS PASSED!${NC}"
echo -e "${GREEN}✅ Safe to deploy${NC}"
echo "================================"
exit 0
