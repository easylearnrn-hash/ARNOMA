# ⚡ QUICK ACTION PLAN - Email Automation System

## ✅ What's Fixed
1. ✅ Supabase config exposed to window (`window.SUPABASE_URL`, `window.SUPABASE_ANON_KEY`)
2. ✅ Automation system exposed to window (`window.automationSystem`)
3. ✅ All 9 core diagnostic tests passing
4. ✅ Data flowing correctly: 6 groups, 52 students in iframe
5. ✅ Automation engine running (60-second checks)

## ⚠️ What's Missing
**NO AUTOMATIONS CONFIGURED** - This is why emails aren't sending!

The engine is running perfectly but has nothing to process.

## 🎯 IMMEDIATE ACTION REQUIRED

### Step 1: Reload the Website
**Why:** To load the fixes (Supabase config and automationSystem now exposed to window)

1. Go to https://www.richyfesta.com
2. Press `Cmd+Shift+R` (hard reload) or `Ctrl+F5`
3. Wait for page to fully load

### Step 2: Re-run Diagnostic Test
**Why:** Verify all tests now pass (should be 13/13 or 11/13 with 2 warnings)

1. Press `F12` to open DevTools
2. Go to Console tab
3. Copy entire contents of `test-automation-system.js`
4. Paste in console and press Enter
5. **Expected Result:**
   ```
   ✅ Passed:   11-13 tests
   ❌ Failed:   0 tests
   ⚠️  Warnings: 0-2 tests
   ```

### Step 3: Create First Automation
**This is the CRITICAL step to enable email sending**

1. Click hamburger menu (☰)
2. Click "Email System"
3. Click "Create First Automation" or "➕ New Automation"
4. Fill in:
   ```
   Name: 30-Minute Class Reminder
   Type: Before Class
   Minutes Before: 30
   Template: [Select existing template]
   Groups: [Select all active groups]
   Active: ✅ Enabled
   ```
5. Click "Save Automation"

### Step 4: Verify Automation Created
Run in console:
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
const automations = iframe.contentWindow.automationSystem?._automations || [];
console.table(automations);
```

**Expected:** See 1 row with your automation, `active: true`

### Step 5: Monitor Console
**Watch for automation engine logs every 60 seconds:**

```
[AutomationEngine] 🔄 Running automation check...
[AutomationEngine] 📊 Groups available: 6
[AutomationEngine] 👥 Students available: 52
```

When a class is about to start (within 30 minutes ±2 min window):
```
[AutomationEngine] ⏰ 30-Minute Class Reminder triggered for [Group Name]
[AutomationEngine] 📧 Sending reminder to: student@example.com
[AutomationEngine] ✅ Reminder sent successfully
```

### Step 6: Verify Email Sent
1. **Console:** Look for "✅ Reminder sent successfully"
2. **Supabase:** Dashboard → Table Editor → `sent_emails` (should have new record)
3. **Student Email:** Check student inbox for email

---

## 🧪 Manual Test (Optional)

If you want to test immediately without waiting for a class:

### Option A: Use Manual Trigger
```javascript
window.testAutomationManually()
```
**Note:** This only checks if automations SHOULD trigger. Won't send emails unless class is actually within trigger window.

### Option B: Test Supabase Edge Function Directly
```bash
cd "/Users/richyf/Library/Mobile Documents/com~apple~CloudDocs/GitHUB"
./test-edge-function.sh
```
**Edit first:** Update `TEST_EMAIL` to your email address in the script

---

## 📊 Success Metrics

You'll know it's working when:
- [ ] Diagnostic test shows 11-13 passed, 0 failed
- [ ] Automation count > 0 (visible in console test)
- [ ] Console shows automation checks every 60 seconds
- [ ] Email appears in student inbox at correct time
- [ ] `sent_emails` table has new records
- [ ] No errors in browser console

---

## 🚨 If Still Not Working After Creating Automation

### Check 1: Automation Active?
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
iframe.contentWindow.automationSystem._automations[0].active
// Should be: true
```

### Check 2: Groups Selected?
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
iframe.contentWindow.automationSystem._automations[0].selectedGroups
// Should have array with group IDs
```

### Check 3: Template Exists?
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
iframe.contentWindow.automationSystem._automations[0].templateId
// Should have a template ID
```

### Check 4: Class Time Within Window?
Automation only triggers if:
- Class exists in schedule (e.g., "Mon/Wed 8:00 PM")
- Current time is within: [Class Start Time - Trigger Minutes ±2 minutes]
- Example: 30-min automation triggers between 7:28 PM - 7:32 PM for 8:00 PM class

---

## 🎯 Timeline to Success

1. **NOW:** Reload site with fixes
2. **+1 min:** Re-run diagnostic (verify all pass)
3. **+3 min:** Create first automation via UI
4. **+4 min:** Verify automation in console
5. **+5 min:** Monitor console for 60-second checks
6. **Next class:** Wait for class within trigger window
7. **Email sent:** Verify in console, Supabase, student inbox

---

## 📞 Support

All diagnostic files created:
- `test-automation-system.js` - Full diagnostic test
- `EMAIL-AUTOMATION-TEST-GUIDE.md` - Complete testing guide
- `test-edge-function.sh` - Supabase function test
- `EMAIL-AUTOMATION-DIAGNOSIS-RESULTS.md` - Full diagnostic results

**Current Status:** 🟢 System ready - just need to create automation!
