# Gmail OAuth Auto-Refresh Deployment Guide

## ✅ Code Changes Complete (v2.9.0)

All code has been pushed to GitHub. Now you need to deploy the Edge Functions to
Supabase.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ Supabase CLI installed (`npm install -g supabase`)
- ✅ Logged into Supabase CLI (`supabase login`)
- ✅ Linked to your project (`supabase link --project-ref zlvnxvrzotamhpezqedr`)
- ✅ Gmail OAuth credentials (Client ID + Client Secret)
- ✅ `gmail_credentials` table exists in Supabase (run `setup-gmail-table.sql`
  if not)

---

## 🚀 Deployment Steps

### Step 1: Set Supabase Secrets

Your Edge Functions need these environment variables:

```bash
# Set Gmail OAuth credentials
supabase secrets set GMAIL_CLIENT_ID="YOUR_GMAIL_CLIENT_ID"
supabase secrets set GMAIL_CLIENT_SECRET="YOUR_GMAIL_CLIENT_SECRET"
```

**To get your credentials:**

1. Go to
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Copy Client ID and Client Secret

### Step 2: Deploy Edge Functions

Deploy all three Gmail-related Edge Functions:

```bash
cd "/Users/richyf/Library/Mobile Documents/com~apple~CloudDocs/GitHUB"

# Deploy gmail-oauth-callback (handles OAuth redirect)
supabase functions deploy gmail-oauth-callback

# Deploy gmail-get-token (fetches token from database)
supabase functions deploy gmail-get-token

# Deploy gmail-refresh-token (refreshes expired tokens)
supabase functions deploy gmail-refresh-token
```

### Step 3: Update Google OAuth Redirect URI

⚠️ **CRITICAL**: Add the Edge Function URL to your Google OAuth config:

1. Go to
   [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://zlvnxvrzotamhpezqedr.supabase.co/functions/v1/gmail-oauth-callback
   ```
4. Save

### Step 4: Verify Database Table

Run this in Supabase SQL Editor to check the table exists:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'gmail_credentials';
```

Should show these columns:

- `id` (uuid)
- `user_id` (varchar)
- `email` (varchar)
- `access_token` (text)
- `refresh_token` (text)
- `client_id` (text)
- `client_secret` (text)
- `token_type` (varchar)
- `expires_at` (timestamptz)
- `scopes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

If table doesn't exist, run `setup-gmail-table.sql`.

---

## 🧪 Testing the Full Flow

### Test 1: Fresh OAuth Connection

1. **Disconnect Gmail** (if currently connected):
   - Open your app
   - Click Gmail disconnect button

2. **Clear old credentials**:
   - Open browser DevTools → Console
   - Run: `localStorage.removeItem('gmail-connection')`
   - Run: `localStorage.removeItem('gmail_access_token')`
   - Run: `localStorage.removeItem('gmail_token_expiry')`

3. **Connect Gmail**:
   - Click "Connect Gmail" button
   - Should redirect to Google OAuth consent screen
   - After approving, should redirect back to your app with
     `?gmail_auth=success`
   - Should show notification: "✅ Gmail connected with auto-refresh enabled!"

4. **Verify in Database**:

   ```sql
   SELECT
     user_id,
     email,
     expires_at,
     refresh_token IS NOT NULL as has_refresh_token,
     created_at
   FROM gmail_credentials
   WHERE user_id = 'admin';
   ```

   Should show:
   - ✅ `has_refresh_token`: true
   - ✅ `expires_at`: ~1 hour from now

5. **Check Console Logs**: Open DevTools Console, should see:
   ```
   ✅ Gmail OAuth successful, fetching token from database...
   ✅ Token fetched and saved
   Has refresh token in DB: true
   ```

### Test 2: Auto-Refresh (Manual Trigger)

1. **Manually expire the token** in database:

   ```sql
   UPDATE gmail_credentials
   SET expires_at = NOW() - INTERVAL '1 minute'
   WHERE user_id = 'admin';
   ```

2. **Trigger a Gmail operation** (e.g., fetch payments or send email)

3. **Watch Console Logs**: Should see:

   ```
   🔄 Gmail token expiring soon, refreshing via Supabase...
   ✅ Gmail token refreshed successfully
   New expiry: [new timestamp]
   ```

4. **Verify in Database**:

   ```sql
   SELECT expires_at, updated_at
   FROM gmail_credentials
   WHERE user_id = 'admin';
   ```

   `expires_at` should be ~1 hour in the future, `updated_at` should be recent.

### Test 3: Auto-Refresh (Real-Time)

1. **Wait 55 minutes** (or set a timer)
2. The `setInterval` in `index.html` should automatically trigger
   `ensureGmailTokenValid()`
3. Token should refresh automatically
4. No user interaction required
5. Check console for refresh logs

---

## 🐛 Troubleshooting

### Error: "No refresh token received"

**Cause**: Google didn't return a refresh token.

**Solutions**:

1. **Revoke access** and re-authenticate:
   - Go to
     [Google Account Permissions](https://myaccount.google.com/permissions)
   - Find "ARNOMA" app
   - Click "Remove access"
   - Reconnect Gmail in your app

2. **Ensure OAuth URL has**:
   - `access_type=offline` ✅
   - `prompt=consent` ✅

### Error: "Token refresh failed"

**Cause**: refresh_token is null or invalid in database.

**Solutions**:

1. Check database:
   ```sql
   SELECT refresh_token FROM gmail_credentials WHERE user_id = 'admin';
   ```
2. If null, disconnect and reconnect Gmail
3. Ensure Google OAuth consent screen shows all permissions

### Error: "Failed to fetch token from database"

**Cause**: Edge Function not deployed or secrets not set.

**Solutions**:

1. Verify Edge Function is deployed:
   ```bash
   supabase functions list
   ```
2. Check secrets are set:
   ```bash
   supabase secrets list
   ```
3. Redeploy function:
   ```bash
   supabase functions deploy gmail-get-token
   ```

### Error: "redirect_uri_mismatch"

**Cause**: Google OAuth redirect URI not configured.

**Solution**:

1. Add to Google Cloud Console → Credentials:
   ```
   https://zlvnxvrzotamhpezqedr.supabase.co/functions/v1/gmail-oauth-callback
   ```

---

## 📊 Monitoring

### Check Token Status

```sql
SELECT
  user_id,
  email,
  expires_at,
  expires_at > NOW() as is_valid,
  EXTRACT(EPOCH FROM (expires_at - NOW())) / 60 as minutes_until_expiry,
  refresh_token IS NOT NULL as has_refresh_token,
  updated_at
FROM gmail_credentials
WHERE user_id = 'admin';
```

### Check Recent Refreshes

```sql
SELECT
  user_id,
  updated_at,
  expires_at,
  LAG(expires_at) OVER (ORDER BY updated_at) as previous_expiry
FROM gmail_credentials
WHERE user_id = 'admin'
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 🎯 Success Criteria

✅ **OAuth Flow**:

- User clicks "Connect Gmail"
- Redirects to Google
- After auth, redirects back with `?gmail_auth=success`
- Token fetched from database
- Notification shows "auto-refresh enabled"

✅ **Database**:

- `refresh_token` is NOT NULL
- `expires_at` is ~1 hour from connection time
- `access_token` is populated

✅ **Auto-Refresh**:

- Token refreshes automatically when near expiry
- No user interaction required
- Console shows refresh logs
- New `expires_at` is updated in database

✅ **Email Operations**:

- Sending emails works
- Fetching payments works
- No "Please reconnect" warnings

---

## 📝 Next Steps After Deployment

1. **Disconnect existing Gmail connection**
2. **Reconnect using new flow**
3. **Verify refresh_token in database**
4. **Monitor for 1-2 hours** to ensure auto-refresh works
5. **Check console logs** for any errors
6. **Test email sending and payment fetching**

---

## 🔗 Related Files

- **Edge Functions**:
  - `supabase/functions/gmail-oauth-callback/index.ts`
  - `supabase/functions/gmail-get-token/index.ts`
  - `supabase/functions/gmail-refresh-token/index.ts`

- **Frontend**:
  - `index.html` (ensureGmailTokenValid)
  - `email-system-complete.html` (connectGmail, handleGmailOAuthCallback)

- **Database**:
  - `setup-gmail-table.sql`

- **Documentation**:
  - `GMAIL_OAUTH_FIX_PLAN.md`
