# 🚨 Why Automation Emails Are Not Being Sent

**Common reasons and how to fix them**

---

## 🔍 Step 1: Run Diagnostic

**Copy and paste this in browser console:**
```javascript
// Copy entire contents of debug-email-automation.js
```

This will show you **exactly** why emails aren't sending.

---

## ❌ Common Issues & Fixes

### Issue 1: "NO CLASSES IN TRIGGER WINDOW"
**What it means:** The automation system is working, but no classes are starting soon enough to trigger emails.

**Example:**
- Current time: 12:25 AM
- Next class: 8:00 AM (7 hours 35 minutes away)
- Trigger: 30 minutes before
- **Result:** Too early! Emails will send at 7:30 AM

**Fix:** Wait! The system is working correctly. Emails will send automatically when classes enter the trigger window.

**How trigger windows work:**
```
Class Time:    8:00 AM
Trigger:       30 minutes before (7:30 AM)
Window:        ±2 minutes (7:28 AM - 7:32 AM)
Email sent:    Anytime between 7:28-7:32 AM
```

---

### Issue 2: "Groups: NONE SELECTED"
**What it means:** Your automations exist but don't have groups assigned to them.

**How to check:**
```javascript
const automations = JSON.parse(localStorage.getItem('arnoma-automations-v3') || '[]');
console.table(automations.map(a => ({
  Name: a.name,
  Groups: a.selectedGroups?.join(', ') || 'NONE SELECTED'
})));
```

**Fix Option A - Automatic (if automation names include group):**
```javascript
// Copy entire contents of fix-automation-groups.js
```

**Fix Option B - Manual:**
1. Go to Email System page
2. Click each automation
3. Select the groups
4. Save

---

### Issue 3: "Data not received by iframe"
**What it means:** The hidden email iframe isn't getting the groups/students data.

**How to check:**
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
console.log('Data received:', iframe.contentWindow.dataReceived);
```

**Fix:**
```javascript
// Force send data
sendGroupsDataToEmailSystem();

// Check again after 2 seconds
setTimeout(() => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  console.log('Data received now:', iframe.contentWindow.dataReceived);
}, 2000);
```

If still false, **reload the page**: `Cmd+Shift+R`

---

### Issue 4: "NO ACTIVE 'BEFORE_CLASS' AUTOMATIONS"
**What it means:** You don't have any automations configured, or they're all inactive.

**How to check:**
```javascript
const automations = JSON.parse(localStorage.getItem('arnoma-automations-v3') || '[]');
console.log('Total:', automations.length);
console.log('Active:', automations.filter(a => a.active).length);
console.log('Before class:', automations.filter(a => a.frequency === 'before_class').length);
```

**Fix:**
1. Go to Email System page (hamburger menu ☰ → Email System)
2. Click "Create First Automation" or "➕ New Automation"
3. Configure:
   - **Name:** "Group A - 30 Min Reminder"
   - **Type:** Before Class
   - **Minutes Before:** 30
   - **Template:** Select template
   - **Groups:** ✅ Check Group A
   - **Active:** ✅ Enabled
4. Save
5. Repeat for other groups

---

### Issue 5: Students not receiving emails (system working but emails not arriving)

**Possible causes:**

#### A) Students not in selected groups
```javascript
// Check which students are in Group A
const students = window.studentsCache || [];
const groupAStudents = students.filter(s => s.group?.includes('A'));
console.log('Group A students:', groupAStudents.length);
groupAStudents.forEach(s => console.log(`  • ${s.name} (${s.status})`));
```

**Fix:** Verify students are assigned to the correct group in Students page.

#### B) Students not "active" status
Only students with `status: 'active'` receive emails.

```javascript
const students = window.studentsCache || [];
students.forEach(s => {
  if (s.status !== 'active') {
    console.log(`${s.name}: ${s.status}`);
  }
});
```

**Fix:** Change student status to "Active" in Students page.

#### C) Invalid email addresses
```javascript
const students = window.studentsCache || [];
students.forEach(s => {
  if (!s.email || !s.email.includes('@')) {
    console.warn(`${s.name}: Invalid email "${s.email}"`);
  }
});
```

**Fix:** Update email addresses in Students page.

#### D) Supabase Edge Function error
Check browser console for errors like:
```
[AutomationEngine] ❌ Failed to send reminder: ...
```

**Fix:** Test Edge Function directly:
```bash
cd "/Users/richyf/Library/Mobile Documents/com~apple~CloudDocs/GitHUB"
./test-edge-function.sh
```

---

### Issue 6: Template not found
**What it means:** Automation references a template that doesn't exist.

**How to check:**
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
const templates = iframe.contentWindow.emailSystem?._templates || [];
const automations = JSON.parse(localStorage.getItem('arnoma-automations-v3') || '[]');

automations.forEach(auto => {
  const template = templates.find(t => t.id === auto.templateId);
  if (!template) {
    console.error(`❌ Automation "${auto.name}" references missing template ID: ${auto.templateId}`);
  } else {
    console.log(`✅ ${auto.name} → ${template.name}`);
  }
});
```

**Fix:**
1. Go to Email System
2. Edit automation
3. Select valid template
4. Save

---

## 🎯 Real-Time Monitoring

### Watch automation checks (every 60 seconds)
Open browser console and look for:
```
[AutomationEngine] 🔄 Running automation check...
[AutomationEngine] 📊 Groups available: 6
[AutomationEngine] 👥 Students available: 52
```

### Watch for emails being sent
```
[AutomationEngine] ⏰ [Automation Name] triggered for [Group]
[AutomationEngine] 📧 Sending reminder to: student@example.com
[AutomationEngine] ✅ Reminder sent successfully
```

### Watch for errors
```
[AutomationEngine] ❌ Failed to send reminder: [error message]
```

---

## ✅ Verify System Health

Run this complete health check:

```javascript
console.log('🏥 AUTOMATION SYSTEM HEALTH CHECK\n' + '='.repeat(60));

// 1. Iframe
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
console.log('1. Iframe:', iframe ? '✅' : '❌');

// 2. Data
const dataReceived = iframe?.contentWindow?.dataReceived;
console.log('2. Data received:', dataReceived ? '✅' : '❌');

// 3. Automations
const automations = JSON.parse(localStorage.getItem('arnoma-automations-v3') || '[]');
const activeAutos = automations.filter(a => a.active && a.frequency === 'before_class');
console.log('3. Active automations:', activeAutos.length > 0 ? `✅ (${activeAutos.length})` : '❌');

// 4. Groups selected
const withGroups = activeAutos.filter(a => a.selectedGroups?.length > 0);
console.log('4. Groups selected:', withGroups.length === activeAutos.length ? '✅' : `⚠️ ${withGroups.length}/${activeAutos.length}`);

// 5. Supabase
const supabaseUrl = iframe?.contentWindow?.SUPABASE_URL;
const supabaseKey = iframe?.contentWindow?.SUPABASE_ANON_KEY;
console.log('5. Supabase config:', (supabaseUrl && supabaseKey) ? '✅' : '❌');

// 6. Students
const students = window.studentsCache || [];
const activeStudents = students.filter(s => s.status === 'active');
console.log('6. Active students:', activeStudents.length > 0 ? `✅ (${activeStudents.length})` : '❌');

console.log('\n' + '='.repeat(60));
if (dataReceived && activeAutos.length > 0 && withGroups.length === activeAutos.length && supabaseUrl && activeStudents.length > 0) {
  console.log('🟢 SYSTEM HEALTHY - Emails will send when classes enter trigger window');
} else {
  console.log('🔴 ISSUES FOUND - See above for problems');
}
```

---

## 🕐 Understanding Timing

### Example Schedule
**Group C:**
- Classes: Monday/Wednesday 8:00 AM
- Automation: 30 minutes before
- Trigger window: 7:28 AM - 7:32 AM

**Timeline:**
```
12:00 AM ─┐
          │ ⏰ Too early (7h 28m until trigger)
7:00 AM ──┤
          │
7:28 AM ──┤ 🎯 TRIGGER WINDOW OPENS
          │ ✅ Automation checks every 60 seconds
7:30 AM ──┤ ✅ If check runs now, email sent
          │
7:32 AM ──┤ 🎯 TRIGGER WINDOW CLOSES
          │
8:00 AM ──┘ Class starts
```

**Key points:**
1. Automation checks run **every 60 seconds**
2. If check runs during trigger window (7:28-7:32), email sends
3. If check runs at 7:27 or 7:33, no email (outside window)
4. This is **normal behavior** - not a bug!

---

## 🚀 Quick Fixes

### Fix 1: Force data refresh
```javascript
sendGroupsDataToEmailSystem();
```

### Fix 2: Reload iframe
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
iframe.src = iframe.src.split('?')[0] + '?v=' + Date.now();
```

### Fix 3: Manual trigger (test only - won't send unless in trigger window)
```javascript
window.testAutomationManually();
```

### Fix 4: Check sent emails today
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
console.log('Sent today:', iframe.contentWindow.sentReminders);
```

### Fix 5: Clear sent reminders (allows re-sending)
```javascript
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
iframe.contentWindow.sentReminders.clear();
console.log('✅ Cleared sent reminders - emails can be sent again');
```

---

## 📞 Still Not Working?

If you've tried everything and emails still aren't sending:

1. **Check Supabase Edge Function:**
   ```bash
   ./test-edge-function.sh
   ```

2. **Check browser console** for errors during automation check

3. **Verify sent_emails table** in Supabase Dashboard

4. **Check Resend dashboard** at https://resend.com/emails

5. **Check student email spam folders**

---

## 📋 Summary

**Most common issue:** ⏰ **System working, just waiting for trigger window**

**How to know if system is healthy:**
- ✅ Console shows automation checks every 60 seconds
- ✅ Console shows "Groups available: X, Students available: Y"
- ✅ Active automations with groups selected
- ✅ No errors in console

**When emails will send:**
- When current time is within [Class Time - Trigger Minutes ±2 minutes]
- Example: For 8:00 AM class with 30-min trigger → 7:28-7:32 AM

**If truly broken:**
- ❌ No console logs every 60 seconds
- ❌ Errors in console
- ❌ Classes IN trigger window but no emails
- ❌ Supabase Edge Function test fails

Use the diagnostic scripts above to identify the exact issue! 🔍
