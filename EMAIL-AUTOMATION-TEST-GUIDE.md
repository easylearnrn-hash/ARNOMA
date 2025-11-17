# 🔬 Email Automation System - Testing Guide

## Quick Start

### Run Full Diagnostic Test

1. **Open your ARNOMA site**: https://www.richyfesta.com
2. **Open browser DevTools**: Press `F12` or `Cmd+Option+I` (Mac)
3. **Go to Console tab**
4. **Copy and paste** the entire contents of `test-automation-system.js`
5. **Press Enter** to run

### What the Test Checks

The diagnostic script tests **7 categories** with **17+ individual checks**:

1. ✅ **Iframe Initialization** - Hidden email iframe exists and loaded
2. ✅ **Data Injection** - Parent window has groups/students data
3. ✅ **PostMessage Communication** - Data sent to iframe successfully
4. ✅ **Automation Engine Status** - Automations loaded and active
5. ✅ **Supabase Configuration** - URL and ANON_KEY present
6. ⏰ **Interval Schedulers** - 60-second checks, 30-second data refresh
7. 🧪 **Manual Trigger** - Force run automation check

---

## Test Results Interpretation

### ✅ All Tests Pass
**System is healthy.** If emails still not sending:
- Wait 60 seconds for next automation check
- Monitor console for `[AutomationEngine] 🔄 Running automation check...`
- Verify automations match current class times

### ❌ Iframe Not Found
**CRITICAL:** Email system not initialized
```javascript
// Fix: Run in console
initializeEmailSystemIframe();
```

### ❌ Data Not Received (dataReceived = false)
**CRITICAL:** PostMessage blocked or not sent
```javascript
// Fix: Send data manually
sendGroupsDataToEmailSystem();
```

### ⚠️ No Students/Groups in Iframe
**WARNING:** Data empty in iframe but present in parent
- Reload page to trigger data send
- Check for CORS or iframe security errors

### ⚠️ No Automations Configured
**WARNING:** No active automations exist
- Go to Email System UI
- Create a "Before Class" automation
- Set trigger time (e.g., 30 minutes before)
- Assign groups and template
- Save and activate

---

## Manual Testing Commands

### Force Trigger Automation Check
```javascript
window.testAutomationManually()
```
**When to use:** Test automation logic without waiting 60 seconds

### Send Data to Iframe
```javascript
sendGroupsDataToEmailSystem()
```
**When to use:** Iframe not receiving data

### Check Iframe Data Status
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
console.log('Data received:', iframe.contentWindow.dataReceived);
console.log('Groups:', iframe.contentWindow.groupsData?.length);
console.log('Students:', iframe.contentWindow.studentsData?.length);
```
**When to use:** Verify data in iframe after send

### View Active Automations
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
const automations = iframe.contentWindow.automationSystem?._automations || [];
console.table(automations.filter(a => a.active));
```
**When to use:** Check automation configuration

### View Sent Reminders (Duplicate Prevention)
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
console.log('Sent reminders today:', iframe.contentWindow.sentReminders);
```
**When to use:** Check if emails already sent today

---

## Monitoring Live Automation

### Watch Console for These Logs

**Every 60 seconds (automation check):**
```
[AutomationEngine] 🔄 Running automation check...
[AutomationEngine] 📊 Groups available: 12
[AutomationEngine] 👥 Students available: 34
```

**Every 30 seconds (data refresh):**
```
[AutomationEngine] 📡 Requested groups/students data from parent window
📤 Sending automation data: 12 groups, 34 students
📨 Received: 12 groups, 34 students
```

**When automation triggers:**
```
[AutomationEngine] ⏰ [Automation Name] triggered for [Group Name]
[AutomationEngine] 📧 Sending reminder to: student@example.com
[AutomationEngine] ✅ Reminder sent successfully
```

**When email fails:**
```
[AutomationEngine] ❌ Failed to send reminder: [error message]
```

---

## Test Supabase Edge Function Directly

### Using Thunder Client (VS Code)

1. Open Thunder Client
2. Create new request:
   - Method: `POST`
   - URL: `https://[YOUR_PROJECT].supabase.co/functions/v1/send-email`
   - Headers:
     ```
     Content-Type: application/json
     Authorization: Bearer [SUPABASE_ANON_KEY]
     ```
   - Body:
     ```json
     {
       "to": "your-test@email.com",
       "subject": "Test Email from ARNOMA",
       "html": "<h1>Test</h1><p>If you receive this, the Edge Function works!</p>"
     }
     ```
3. Click Send
4. Expect: `200 OK` response

### Using curl (Terminal)
```bash
curl -X POST \
  'https://[YOUR_PROJECT].supabase.co/functions/v1/send-email' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer [SUPABASE_ANON_KEY]' \
  -d '{
    "to": "your-test@email.com",
    "subject": "Test Email",
    "html": "<p>Test</p>"
  }'
```

---

## Common Failure Scenarios

### Scenario 1: Automations Not Triggering
**Symptoms:**
- No console logs every 60 seconds
- `dataReceived` is false

**Fix:**
1. Run `sendGroupsDataToEmailSystem()`
2. Verify iframe exists: `document.querySelector('iframe[src*="email-system-complete.html"]')`
3. Check if initAutomationEngine() ran (look for "⚡ Initializing Automation Engine..." in console)

### Scenario 2: Emails Not Sending (But Automation Triggers)
**Symptoms:**
- Console shows "⏰ [Automation] triggered"
- Console shows "📧 Sending reminder to..."
- No "✅ Reminder sent successfully"

**Fix:**
1. Test Supabase Edge Function directly (see above)
2. Check Supabase logs: Dashboard → Edge Functions → send-email → Logs
3. Verify Resend API key in Supabase secrets
4. Check if student email is valid

### Scenario 3: Duplicate Emails Sent
**Symptoms:**
- Same student receives multiple emails within 2 minutes

**Fix:**
1. Check `sentReminders` Set: 
   ```javascript
   const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
   console.log(iframe.contentWindow.sentReminders);
   ```
2. Verify reminderKey format: `${automation.id}-${groupId}-${sessionTime}-${student.email}`
3. Check if multiple automations target same group/time

### Scenario 4: Wrong Timezone (Emails Too Early/Late)
**Symptoms:**
- Emails sent at wrong time (30 min before becomes 2 hours before, etc.)

**Fix:**
1. Check LA time in iframe:
   ```javascript
   const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
   console.log('LA Time:', iframe.contentWindow.getCurrentLATime());
   ```
2. Verify server timezone matches Los Angeles
3. Check schedule parsing: `parseScheduleString("Mon/Wed 8:00 PM")`

---

## Verification Checklist

After running diagnostic and fixes:

- [ ] ✅ All diagnostic tests pass (0 failures)
- [ ] ⏰ Console shows automation check every 60 seconds
- [ ] 📡 Console shows data refresh every 30 seconds
- [ ] 📊 Iframe has groups data (count > 0)
- [ ] 👥 Iframe has students data (count > 0)
- [ ] 🔧 At least 1 active "before_class" automation configured
- [ ] 🧪 Manual trigger test (`window.testAutomationManually()`) works
- [ ] 📧 Test email sent via Supabase Edge Function succeeds
- [ ] 🕐 Current LA time matches expected timezone
- [ ] 🎯 Automation trigger window: ±2 minutes from target time

---

## Support Information

**Email Automation Architecture:**
- Parent window: `index.html` (main app)
- Iframe: `email-system-complete.html` (automation engine)
- Communication: postMessage API
- Edge Function: `/functions/v1/send-email`
- Email Service: Resend (via Supabase Edge Function)
- Database: Supabase (PostgreSQL)

**Key Files:**
- `index.html` → Lines 10140-10240: Iframe initialization
- `email-system-complete.html` → Lines 3260-3690: Automation engine
- `supabase/functions/send-email/index.ts` → Edge Function

**Console Log Prefixes:**
- `[AutomationEngine]` → Automation engine logs
- `📤 Sending automation data` → Parent sending data
- `📨 Received` → Iframe received data
- `⏰ [Automation Name]` → Automation triggered

---

## Next Steps After Testing

1. **If all tests pass but no emails:**
   - Check automation trigger times match actual class schedules
   - Verify "Before Class" time (e.g., 30 minutes) is reasonable
   - Confirm at least one student is `active` and has valid email

2. **If tests fail:**
   - Fix failures based on recommended actions in test output
   - Re-run diagnostic test to verify fixes
   - Test manual trigger after fixes applied

3. **Monitor for 24 hours:**
   - Check console regularly for automation logs
   - Verify emails sent at correct times
   - Review `sent_emails` table in Supabase

4. **Production monitoring:**
   - Set up Supabase Edge Function alerts
   - Monitor Resend dashboard for delivery rates
   - Check `sent_emails` table daily for gaps
