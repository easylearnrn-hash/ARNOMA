# Gmail OAuth Refresh Token Fix

## Problem Diagnosis

Gmail OAuth is **NOT refreshing** because the current implementation uses the **OAuth 2.0 Implicit Flow** which:
- ❌ Only returns **access tokens** (expires in 1 hour)
- ❌ Does **NOT** return **refresh tokens**
- ❌ Requires user to manually re-authenticate every hour

## Root Cause

**File:** `email-system-complete.html` Line ~1157
```javascript
// CURRENT (BROKEN):
response_type=token  // ❌ Implicit flow - NO refresh token
```

**What happens:**
1. User clicks "Connect Gmail"
2. Google OAuth returns **only** `access_token` (valid for 1 hour)
3. No `refresh_token` is provided
4. After 1 hour, token expires
5. `ensureGmailTokenValid()` tries to call `gmail-refresh-token` Edge Function
6. Edge Function fails because there's no refresh token in database

## Solution: Switch to Authorization Code Flow

### Required Changes

#### 1. Frontend Changes (`email-system-complete.html`)

**Change OAuth URL from:**
```javascript
// OLD (BROKEN):
response_type=token   // Implicit flow
```

**To:**
```javascript
// NEW (WORKING):
response_type=code    // Authorization code flow
access_type=offline   // Required to get refresh token
prompt=consent        // Force consent screen (ensures refresh token)
```

**Complete new OAuth flow:**
```javascript
async function connectGmail() {
  const redirectUri = `${SUPABASE_URL}/functions/v1/gmail-oauth-callback`;
  
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GMAIL_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +        // ✅ Authorization code flow
    `access_type=offline&` +        // ✅ Get refresh token
    `prompt=consent&` +             // ✅ Force consent screen
    `scope=${encodeURIComponent(GMAIL_SCOPES)}&` +
    `state=${encodeURIComponent(JSON.stringify({ userId: 'admin', returnUrl: window.location.href }))}`;

  window.location.href = authUrl;
}
```

#### 2. Edge Function (`gmail-oauth-callback/index.ts`)

Already exists! But needs small update to handle redirect back to app:

```typescript
// After successful token exchange and DB save:
const state = url.searchParams.get('state');
const stateData = state ? JSON.parse(state) : {};
const returnUrl = stateData.returnUrl || 'https://www.richyfesta.com';

// Redirect back to app with success
return new Response(null, {
  status: 302,
  headers: {
    'Location': `${returnUrl}?gmail_auth=success`,
  },
});
```

#### 3. Handle Callback in Frontend

Add to `email-system-complete.html`:

```javascript
// Check if returning from OAuth
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('gmail_auth') === 'success') {
  // Token is now in database, fetch it
  await fetchStoredGmailToken();
  showNotification('✅ Gmail connected with auto-refresh enabled!', 'success');
  
  // Clean URL
  window.history.replaceState(null, null, window.location.pathname);
}

async function fetchStoredGmailToken() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/gmail-get-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ userId: 'admin' }),
  });
  
  const { access_token, expires_at } = await response.json();
  
  gmailAccessToken = access_token;
  gmailTokenExpiry = new Date(expires_at).getTime();
  
  localStorage.setItem(GMAIL_CONNECTION_KEY, JSON.stringify({
    access_token,
    expiry_date: gmailTokenExpiry,
  }));
  
  updateGmailButtonState(true);
}
```

## Implementation Steps

### Step 1: Update Edge Function (Optional Enhancement)
Make `gmail-oauth-callback/index.ts` redirect back to app instead of returning JSON.

### Step 2: Update Frontend OAuth Flow
Modify `email-system-complete.html` to use `response_type=code`.

### Step 3: Add Token Fetch Function
Create function to fetch stored token from database after OAuth callback.

### Step 4: Test Flow
1. Click "Connect Gmail"
2. Authorize in Google
3. Get redirected back to app
4. Token automatically fetched from database
5. Check database - should have `refresh_token` saved

### Step 5: Verify Auto-Refresh
1. Wait 55 minutes (or manually expire token in DB)
2. `ensureGmailTokenValid()` should trigger
3. New access token should be fetched using refresh token
4. No user interaction required

## Files to Modify

1. ✅ `supabase/functions/gmail-oauth-callback/index.ts` - Already exists, needs redirect update
2. ❌ `email-system-complete.html` - Update OAuth flow
3. ❌ `index.html` - Update `ensureGmailTokenValid()` to fetch from database

## Alternative: Simplified Approach

If you want to keep it simple and avoid database storage:

**Use Google's Identity Services (GSI) Library:**
```html
<script src="https://accounts.google.com/gsi/client"></script>
<script>
  google.accounts.oauth2.initTokenClient({
    client_id: GMAIL_CLIENT_ID,
    scope: GMAIL_SCOPES,
    callback: (response) => {
      gmailAccessToken = response.access_token;
      // Save token
    },
  }).requestAccessToken();
</script>
```

But this still doesn't solve refresh - you'd still need authorization code flow.

## Recommended Action

**FULL FIX: Implement authorization code flow with database storage**

This is the only way to get true auto-refresh without user interaction.

## Testing Checklist

- [ ] User clicks "Connect Gmail"
- [ ] Redirected to Google OAuth consent screen
- [ ] After authorization, redirected back to app
- [ ] Access token saved to localStorage
- [ ] Refresh token saved to Supabase `gmail_credentials` table
- [ ] Token auto-refreshes after 55 minutes
- [ ] No errors in console
- [ ] Email sending works
- [ ] Payment parsing works

## Current Status

- ✅ Database table created (`gmail_credentials`)
- ✅ Edge Function created (`gmail-refresh-token`)
- ✅ Edge Function created (`gmail-oauth-callback`)
- ❌ Frontend still using implicit flow
- ❌ No fetch function to get token from database
- ❌ Callback redirect not implemented
