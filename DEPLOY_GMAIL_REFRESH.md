# Gmail OAuth Refresh Token Setup - Deployment Steps

## Prerequisites

- Supabase CLI installed: `brew install supabase/tap/supabase`
- Supabase project created
- Gmail API credentials (Client ID + Secret)

## Step 1: Update Supabase Table

```bash
# Run this in Supabase SQL Editor
cat GMAIL_TOKEN_REFRESH_SETUP.sql
```

## Step 2: Set Supabase Secrets

```bash
supabase secrets set GMAIL_CLIENT_ID="67231383915-4kpdv0k6u517admvhl7jlejku7qtbsjj.apps.googleusercontent.com"
supabase secrets set GMAIL_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
```

## Step 3: Deploy Edge Functions

```bash
cd supabase
supabase functions deploy gmail-oauth-callback
supabase functions deploy gmail-refresh-token
```

## Step 4: Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":
   - `https://www.richyfesta.com`
   - `http://localhost:8080` (for testing)
4. Save

## Step 5: Deploy Frontend

```bash
git add .
git commit -m "🔄 Switch to OAuth authorization code flow with refresh tokens"
git push
```

## Step 6: Test Flow

1. Visit https://www.richyfesta.com
2. Click "Connect Gmail"
3. Complete OAuth flow
4. Check Supabase table: `SELECT * FROM gmail_credentials;`
5. Wait 50 minutes
6. Check browser console for auto-refresh logs

## Verification

- Token should auto-refresh every hour
- No re-authentication needed for 6 months
- Check logs: "✅ Gmail token refreshed successfully"

## Troubleshooting

- If token refresh fails: Check Supabase secrets are set
- If OAuth fails: Verify redirect URI in Google Console
- If table insert fails: Check RLS policies are disabled or user_id matches
