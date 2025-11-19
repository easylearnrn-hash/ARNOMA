# 🔐 Gmail OAuth - Mobile Support Setup

## Current Issue
Your Google OAuth app is configured for **desktop only**. Mobile users cannot connect to Gmail.

## ✅ What You Need to Add

Go to your Google Cloud Console OAuth configuration and add these URLs:

### Authorized JavaScript Origins
```
https://www.richyfesta.com
https://richyfesta.com
```
✅ Already configured

### Authorized Redirect URIs
**ADD THESE TWO:**
```
https://www.richyfesta.com/index.mobile.html
https://richyfesta.com/index.mobile.html
```

Your current redirect URIs only have the desktop versions:
- ✅ https://www.richyfesta.com (desktop)
- ✅ https://richyfesta.com (desktop)

## 📍 Where to Add This

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Scroll to **Authorized redirect URIs**
4. Click **+ ADD URI** (twice)
5. Add both mobile URLs above
6. Click **SAVE**

## 🧪 How to Test After Adding

1. Open https://richyfesta.com/index.mobile.html on your phone
2. Click the **Gmail** button
3. You should see the Google login screen
4. After login, it should redirect back to the mobile version
5. Gmail button should turn green
6. You should be able to sync payments

## 🚨 What Happens Without This

- Mobile users click Gmail button
- Google OAuth rejects the redirect
- Error: "redirect_uri_mismatch"
- Cannot connect to Gmail from mobile

## ✅ After Adding

- Mobile OAuth will work
- Users can connect Gmail from phone
- Payments sync on mobile
- Auto-refresh works on mobile

---

**Current Status:** Mobile OAuth URLs NOT configured yet
**Action Required:** Add the 2 mobile redirect URIs listed above
