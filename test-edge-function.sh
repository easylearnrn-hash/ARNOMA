#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Test Supabase Edge Function: send-email
# ═══════════════════════════════════════════════════════════════════════════
# This script tests the send-email Edge Function directly without the
# automation engine to isolate Edge Function issues.
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🧪 Testing Supabase Edge Function: send-email"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

# TODO: Replace these with your actual values
SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"
TEST_EMAIL="your-test-email@example.com"

echo "📋 Configuration:"
echo "   Supabase URL: $SUPABASE_URL"
echo "   Test Email: $TEST_EMAIL"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Check Prerequisites
# ─────────────────────────────────────────────────────────────────────────────

if ! command -v curl &> /dev/null; then
    echo "❌ ERROR: curl is not installed"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "⚠️  WARNING: jq not installed (JSON output will not be formatted)"
    echo "   Install: brew install jq"
    USE_JQ=false
else
    USE_JQ=true
fi

# ─────────────────────────────────────────────────────────────────────────────
# Test Edge Function
# ─────────────────────────────────────────────────────────────────────────────

echo "🚀 Sending test email via Edge Function..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/functions/v1/send-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -d "{
    \"to\": \"${TEST_EMAIL}\",
    \"subject\": \"Test Email from ARNOMA System\",
    \"html\": \"<html><body><h1>Test Successful</h1><p>This is a test email from the ARNOMA automation system.</p><p>If you received this, the Edge Function is working correctly!</p><p><strong>Timestamp:</strong> $(date)</p></body></html>\"
  }")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📊 Response:"
echo "   HTTP Status: $HTTP_CODE"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Interpret Results
# ─────────────────────────────────────────────────────────────────────────────

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ SUCCESS: Email sent successfully!"
    echo ""
    echo "📧 Response Body:"
    if [ "$USE_JQ" = true ]; then
        echo "$BODY" | jq '.'
    else
        echo "$BODY"
    fi
    echo ""
    echo "✓ Check $TEST_EMAIL for the test email"
    echo "✓ Edge Function is working correctly"
    echo ""
    
elif [ "$HTTP_CODE" == "401" ]; then
    echo "❌ AUTHENTICATION ERROR"
    echo ""
    echo "Response Body:"
    echo "$BODY"
    echo ""
    echo "Possible causes:"
    echo "  1. SUPABASE_ANON_KEY is incorrect"
    echo "  2. SUPABASE_ANON_KEY is expired"
    echo "  3. SUPABASE_URL is incorrect"
    echo ""
    echo "Fix:"
    echo "  1. Go to Supabase Dashboard → Settings → API"
    echo "  2. Copy the 'anon/public' key"
    echo "  3. Update SUPABASE_ANON_KEY in this script"
    echo ""
    
elif [ "$HTTP_CODE" == "404" ]; then
    echo "❌ FUNCTION NOT FOUND"
    echo ""
    echo "Response Body:"
    echo "$BODY"
    echo ""
    echo "Possible causes:"
    echo "  1. Edge Function not deployed"
    echo "  2. Function name is incorrect (should be 'send-email')"
    echo "  3. SUPABASE_URL is incorrect"
    echo ""
    echo "Fix:"
    echo "  1. Deploy Edge Function:"
    echo "     cd supabase/functions/send-email"
    echo "     supabase functions deploy send-email"
    echo "  2. Verify function exists in Supabase Dashboard"
    echo ""
    
elif [ "$HTTP_CODE" == "500" ]; then
    echo "❌ EDGE FUNCTION ERROR"
    echo ""
    echo "Response Body:"
    echo "$BODY"
    echo ""
    echo "Possible causes:"
    echo "  1. Resend API key not configured"
    echo "  2. Error in Edge Function code"
    echo "  3. Database connection issue"
    echo ""
    echo "Fix:"
    echo "  1. Check Edge Function logs:"
    echo "     Supabase Dashboard → Edge Functions → send-email → Logs"
    echo "  2. Verify Resend API key:"
    echo "     Supabase Dashboard → Project Settings → Secrets"
    echo "     Should have: RESEND_API_KEY"
    echo "  3. Test Resend API key at: https://resend.com/api-keys"
    echo ""
    
else
    echo "❌ UNEXPECTED ERROR"
    echo ""
    echo "HTTP Status: $HTTP_CODE"
    echo "Response Body:"
    echo "$BODY"
    echo ""
fi

# ─────────────────────────────────────────────────────────────────────────────
# Additional Diagnostics
# ─────────────────────────────────────────────────────────────────────────────

echo "═══════════════════════════════════════════════════════════════════════════"
echo "📋 Additional Diagnostics"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "1. Check Edge Function deployment:"
echo "   → Supabase Dashboard → Edge Functions"
echo "   → Verify 'send-email' is listed and deployed"
echo ""

echo "2. Check Edge Function logs:"
echo "   → Supabase Dashboard → Edge Functions → send-email → Logs"
echo "   → Look for errors or successful invocations"
echo ""

echo "3. Verify Resend API key:"
echo "   → Supabase Dashboard → Project Settings → Secrets"
echo "   → Should have: RESEND_API_KEY"
echo "   → Test at: https://resend.com/api-keys"
echo ""

echo "4. Check sent_emails table:"
echo "   → Supabase Dashboard → Table Editor → sent_emails"
echo "   → Should have new record if email sent"
echo ""

echo "5. Manual curl test:"
echo "   curl -X POST \\"
echo "     '${SUPABASE_URL}/functions/v1/send-email' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'Authorization: Bearer ${SUPABASE_ANON_KEY}' \\"
echo "     -d '{"
echo "       \"to\": \"${TEST_EMAIL}\","
echo "       \"subject\": \"Test\","
echo "       \"html\": \"<p>Test</p>\""
echo "     }'"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo "🏁 Test Complete"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
