# Gmail Token Auto-Refresh Implementation Guide

## Current Problem

- Gmail OAuth uses **implicit flow** (no refresh tokens)
- Access tokens expire after 1 hour
- Users must manually reconnect Gmail every hour
- Current code only warns users but doesn't auto-refresh

## Solution Architecture

Implement **authorization code flow** with Supabase Edge Function for secure
token refresh.

---

## Step 1: Create Supabase Table

Run `GMAIL_TOKEN_REFRESH_SETUP.sql` in Supabase SQL Editor to create:

- `gmail_credentials` table with RLS policies
- Stores `refresh_token` securely server-side
- Auto-updates `updated_at` timestamp

---

## Step 2: Create Supabase Edge Function

### File: `supabase/functions/gmail-refresh-token/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID')!;
const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET')!;

serve(async req => {
  try {
    // Create Supabase client with user's JWT
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get stored refresh token
    const { data: credentials, error: fetchError } = await supabaseClient
      .from('gmail_credentials')
      .select('refresh_token')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !credentials) {
      return new Response(JSON.stringify({ error: 'No credentials found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Refresh the access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        refresh_token: credentials.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Token refresh failed');
    }

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Update credentials in database
    const { error: updateError } = await supabaseClient
      .from('gmail_credentials')
      .update({
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error('Failed to update credentials');
    }

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
        expires_at: expiresAt.toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Deploy Command:

```bash
supabase functions deploy gmail-refresh-token
```

### Set Secrets:

```bash
supabase secrets set GMAIL_CLIENT_ID=your_client_id
supabase secrets set GMAIL_CLIENT_SECRET=your_client_secret
```

---

## Step 3: Create OAuth Callback Edge Function

### File: `supabase/functions/gmail-oauth-callback/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID')!;
const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('GMAIL_REDIRECT_URI')!; // e.g., https://yourproject.supabase.co/functions/v1/gmail-oauth-callback

serve(async req => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // Contains user's session token

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    // Verify user session
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${state}` } } }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Invalid session');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Token exchange failed');
    }

    // Get user's email from Google
    const profileResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const profile = await profileResponse.json();

    // Calculate expiry
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Store credentials in Supabase
    const { error } = await supabaseClient.from('gmail_credentials').upsert({
      user_id: user.id,
      email: profile.email,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_type: tokenData.token_type,
      expires_at: expiresAt.toISOString(),
      scope: tokenData.scope,
    });

    if (error) {
      throw new Error('Failed to store credentials');
    }

    // Redirect back to app with success
    return Response.redirect(`${url.origin}/?gmail=connected`, 302);
  } catch (error) {
    return Response.redirect(
      `${new URL(req.url).origin}/?gmail=error&message=${encodeURIComponent(error.message)}`,
      302
    );
  }
});
```

### Deploy:

```bash
supabase functions deploy gmail-oauth-callback
```

---

## Step 4: Update index.html

### Replace `initiateGmailAuth()` function:

```javascript
function initiateGmailAuth() {
  // Get user session token to pass as state
  const session = supabase.auth.getSession();
  const accessToken = session?.data?.session?.access_token;

  if (!accessToken) {
    showNotification('Please log in first', 'error');
    return;
  }

  // Use authorization code flow via Edge Function
  const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/gmail-oauth-callback`;

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GMAIL_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(edgeFunctionUrl)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(GMAIL_SCOPES)}&` +
    `state=${accessToken}&` +
    `access_type=offline&` + // Request refresh token
    `prompt=consent`; // Force consent to get refresh token

  window.location.href = authUrl;
}
```

### Replace `ensureGmailTokenValid()` function:

```javascript
async function ensureGmailTokenValid() {
  if (!currentUser) return false;

  // Check if token exists and is valid
  const { data: credentials, error } = await supabase
    .from('gmail_credentials')
    .select('access_token, expires_at')
    .eq('user_id', currentUser.id)
    .single();

  if (error || !credentials) {
    console.log('No Gmail credentials found');
    return false;
  }

  const expiresAt = new Date(credentials.expires_at);
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  // Token still valid
  if (expiresAt - now > fiveMinutes) {
    gmailAccessToken = credentials.access_token;
    gmailTokenExpiry = expiresAt.getTime().toString();
    return true;
  }

  // Token expired or expiring - refresh it
  console.log('🔄 Gmail token expiring, refreshing...');

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/gmail-refresh-token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const refreshed = await response.json();

    gmailAccessToken = refreshed.access_token;
    gmailTokenExpiry = new Date(refreshed.expires_at).getTime().toString();

    // Update localStorage
    localStorage.setItem(STORAGE_KEYS.GMAIL_TOKEN, gmailAccessToken);
    localStorage.setItem(STORAGE_KEYS.GMAIL_EXPIRY, gmailTokenExpiry);

    console.log('✅ Gmail token refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    showNotification('Gmail connection expired. Please reconnect.', 'warning');
    gmailAccessToken = null;
    updateGmailButtonState(false);
    return false;
  }
}
```

### Add on page load:

```javascript
// Check for Gmail OAuth callback
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('gmail') === 'connected') {
  showNotification('✅ Gmail connected successfully!', 'success');
  await ensureGmailTokenValid();
  updateGmailButtonState(true);
  // Clear URL params
  window.history.replaceState({}, '', window.location.pathname);
} else if (urlParams.get('gmail') === 'error') {
  showNotification(
    `❌ Gmail connection failed: ${urlParams.get('message')}`,
    'error'
  );
  window.history.replaceState({}, '', window.location.pathname);
}
```

---

## Step 5: Update Google Cloud Console

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://yourproject.supabase.co/functions/v1/gmail-oauth-callback
   ```
4. Save changes

---

## Testing Checklist

- [ ] Run SQL to create `gmail_credentials` table
- [ ] Deploy `gmail-refresh-token` Edge Function
- [ ] Deploy `gmail-oauth-callback` Edge Function
- [ ] Set Supabase secrets (CLIENT_ID, CLIENT_SECRET)
- [ ] Update Google Cloud Console redirect URIs
- [ ] Update `index.html` with new auth flow
- [ ] Test: Click "Connect Gmail" → Should redirect to Google
- [ ] Test: After consent → Should redirect back with success
- [ ] Test: Wait 55 minutes → Token should auto-refresh
- [ ] Test: Check Supabase table for stored credentials

---

## Benefits

✅ **Automatic token refresh** - No more manual reconnection ✅ **Secure** -
Refresh tokens stored server-side with RLS ✅ **Persistent** - Works across page
reloads ✅ **User-friendly** - Connect once, works forever ✅
**Production-ready** - Proper OAuth2 flow with secrets

---

## Security Notes

- Refresh tokens are **never exposed** to client
- All token operations happen in Edge Functions
- RLS policies ensure users only access their own credentials
- Client secrets stored securely in Supabase secrets
