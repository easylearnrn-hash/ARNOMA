# Gmail API Token Expiration - Configuration Guide

## 🔑 Current Token Behavior

### Access Tokens (Short-lived)
- **Duration:** 1 hour by default
- **Purpose:** Used to make API calls to Gmail
- **Auto-renewal:** Yes, if refresh token is valid

### Refresh Tokens (Long-lived)
- **Duration:** Indefinite (until revoked)
- **Purpose:** Used to get new access tokens
- **Revocation triggers:**
  - User changes password
  - User revokes access manually
  - 6 months of inactivity
  - Token limit exceeded (100 per user per app)

## 📊 Your Current Setup

Your application likely uses **Google OAuth 2.0** for Gmail API access. The typical flow is:

1. User authorizes app → Gets refresh token
2. App stores refresh token
3. Access token expires every hour
4. App uses refresh token to get new access token
5. Repeat step 4 indefinitely

## ⚠️ Why Tokens Expire

**Security reasons:**
- Limits damage if token is stolen
- Forces periodic re-authentication
- Allows users to revoke access
- Prevents long-term unauthorized access

**Google's policy:**
- Access tokens: Always 1 hour (cannot be extended)
- Refresh tokens: Unlimited until revoked or inactive for 6 months

## 🛠️ How to Extend Token Lifetime

### Option 1: Use Refresh Tokens (Recommended)
This is what you should already be doing. The app automatically gets new tokens.

**What to check:**
1. Your app stores the refresh token
2. Your app automatically requests new access tokens
3. The refresh token is kept secure

**Where to verify:**
- Check your Google Cloud Console
- Project: Your ARNOMA project
- APIs & Services → Credentials
- Look for OAuth 2.0 Client IDs

### Option 2: Keep Tokens Active
Refresh tokens expire after **6 months of inactivity**.

**To prevent expiration:**
- Make at least one API call every 6 months
- Or: User re-authenticates periodically
- Or: Implement automated "keep-alive" pings

### Option 3: Request Offline Access
Ensure your OAuth flow requests **offline access**.

**Check your OAuth scope:**
```javascript
// Your authentication should include:
scope: [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send'
],
access_type: 'offline',  // ← THIS IS CRITICAL
prompt: 'consent'         // ← Forces refresh token generation
```

## 🔍 Diagnosing Token Issues

### Check if your app uses refresh tokens:

1. **In Google Cloud Console:**
   - Go to: APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID
   - Check "Authorized redirect URIs"

2. **In your application code:**
   - Search for where you store tokens
   - Look for "refresh_token" in localStorage or database
   - Verify automatic token renewal logic exists

3. **Test token refresh:**
   - Wait for access token to expire (1 hour)
   - Make a Gmail API call
   - App should automatically get new token

### Common Problems:

**Problem 1: No refresh token stored**
- **Symptom:** User must re-authenticate every hour
- **Solution:** Update OAuth flow to request offline access

**Problem 2: Refresh token expired**
- **Symptom:** User must re-authenticate after 6 months
- **Solution:** Make API calls more frequently OR ask user to re-auth

**Problem 3: Too many tokens**
- **Symptom:** Random authentication failures
- **Solution:** Google limits to 100 refresh tokens per user
- **Fix:** Revoke old tokens in Google Account settings

## 💡 Recommended Solution

### For Your ARNOMA App:

**Best Practice Setup:**
1. Use OAuth 2.0 with offline access
2. Store refresh token securely
3. Auto-refresh access tokens every 50 minutes
4. Make regular API calls (daily email checks)
5. Handle token expiration gracefully

**Implementation Example:**
```javascript
// When authenticating user
const auth = await google.auth.getClient({
  credentials: {
    client_id: YOUR_CLIENT_ID,
    client_secret: YOUR_CLIENT_SECRET,
  },
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
  ],
  access_type: 'offline',  // Get refresh token
  prompt: 'consent'        // Force refresh token
});

// Store refresh token
localStorage.setItem('gmail_refresh_token', auth.credentials.refresh_token);

// Auto-refresh access token before expiration
setInterval(async () => {
  const newToken = await auth.refreshAccessToken();
  console.log('Access token refreshed');
}, 50 * 60 * 1000); // Every 50 minutes
```

## 📋 Action Items

To maximize token lifetime:

**Immediate (Do Now):**
- ✅ Verify refresh token is being stored
- ✅ Verify automatic token renewal works
- ✅ Test after 1 hour to confirm auto-renewal

**Short-term (This Week):**
- 📝 Add token expiration monitoring
- 📝 Add graceful re-authentication flow
- 📝 Log token refresh events

**Long-term (Ongoing):**
- 🔄 Make regular API calls (prevents 6-month expiration)
- 🔄 Monitor for authentication errors
- 🔄 Alert user if re-authentication needed

## 🚫 What You CANNOT Do

**These are NOT possible:**
- ❌ Make access tokens last longer than 1 hour
- ❌ Make refresh tokens permanent (6-month max inactivity)
- ❌ Bypass Google's security policies
- ❌ Use service accounts for user Gmail (requires G Suite)

## 📞 Need Help?

**To check your current setup:**

1. Open browser console on richyfesta.com
2. Type: `localStorage.getItem('gmail_refresh_token')`
3. If null → Not storing refresh tokens
4. If string → Refresh tokens are being stored ✅

**To verify auto-renewal:**

1. Note current time
2. Wait 65 minutes
3. Try to fetch emails
4. If works → Auto-renewal working ✅
5. If fails → Need to fix token refresh logic

## 🎯 Summary

**The Good News:**
- Refresh tokens can last indefinitely
- You only need to authenticate once (then auto-renew)
- Your app should already handle this automatically

**The Reality:**
- Access tokens MUST expire every hour (security requirement)
- Refresh tokens expire after 6 months of inactivity
- Users need to re-authenticate if refresh token expires

**The Solution:**
- Ensure your app uses refresh tokens correctly
- Make regular API calls (keeps tokens active)
- Implement graceful re-authentication for expired tokens

---

**Bottom Line:** You can't make tokens last "as long as possible" beyond Google's limits, but you can implement proper refresh token handling to minimize re-authentication needs. The key is to use offline access and store refresh tokens properly.
