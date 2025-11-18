# ARNOMA Email Auto-Send Configuration

## 📧 AUTO-SEND EMAILS (No Confirmation Required)

These emails send **automatically** the moment their trigger happens:

### 1. ✅ **CLASS REMINDER** (Auto)
- **Function:** `sendClassReminderEmail()` in email-system-complete.html
- **Trigger:** Automation engine based on group schedule
- **Location:** Automation Engine at line ~5106
- **Status:** ✅ Already implemented

### 2. 💰 **UNPAID PAYMENT REMINDER** (Auto)
- **Function:** `sendPaymentReminder()` in index.html
- **Trigger:** PaymentReminderManager detects unpaid class
- **Location:** Line ~18746 (sendPaymentReminder function)
- **Status:** ✅ Already implemented

### 3. 💳 **PAYMENT RECEIPT** (Auto)
- **Function:** `sendPaymentReceiptEmail()` in index.html
- **Trigger:** Payment registered (Gmail sync or manual)
- **Location:** Lines 12557-12590 (sender) + email-system-complete.html handler
- **Status:** ✅ NEW - Just created
- **⚠️ TODO:** Wire to payment registration in `addPayment()` function

### 4. 👋 **WELCOME EMAIL** (Auto)
- **Function:** `sendWelcomeEmail()` in index.html
- **Trigger:** New student added for the first time
- **Location:** Line ~12164
- **Status:** ✅ Already implemented - Called at line 12125

### 5. 🚫 **ABSENCE EMAIL** (Auto)
- **Function:** `sendAbsenceNotificationEmail()` in index.html
- **Trigger:** Richy clicks "Absent" for a student
- **Location:** Lines 12447-12475 (sender function - NO confirmation)
- **Status:** ✅ Fixed - Removed confirmation modal
- **⚠️ TODO:** Wire to absence marking in calendar

### 6. 💵 **CREDIT APPLIED EMAIL** (Auto)
- **Function:** `sendCreditAppliedEmail()` in index.html
- **Trigger:** System deducts credit for today's class payment
- **Location:** Line ~9236
- **Status:** ✅ Already implemented - Called at line 19543

### 7. 📅 **CLASS SCHEDULE CHANGE EMAIL** (Auto)
- **Function:** `sendScheduleChangeEmail()` in index.html
- **Trigger:** Richy updates group schedule
- **Location:** Lines 12478-12506 (sender function - NO confirmation)
- **Status:** ✅ Fixed - Removed confirmation modal
- **⚠️ TODO:** Wire to schedule save in Group Manager

### 8. 🎓 **NEW GROUP ENROLLMENT CONFIRMATION** (Auto)
- **Function:** `sendGroupEnrollmentEmail()` in index.html
- **Trigger:** Student added/moved to a new group
- **Location:** Lines 12509-12537 (sender function - NO confirmation)
- **Status:** ✅ Fixed - Removed confirmation modal
- **⚠️ TODO:** Wire to group assignment in Student Manager

---

## ⚠️ MANUAL CONFIRMATION EMAILS (Require Popup)

These emails **ALWAYS** show confirmation popup before sending:

### 1. ⏸️ **STATUS CHANGE: Active → Paused**
- **Function:** `sendStatusChangeToPausedEmail()` in index.html
- **Location:** Lines 12312-12347
- **Status:** ✅ Has confirmEmailSend() modal

### 2. ▶️ **STATUS CHANGE: Paused → Active**
- **Function:** `sendStatusChangeToActiveEmail()` in index.html
- **Location:** Lines 12350-12385
- **Status:** ✅ Has confirmEmailSend() modal

### 3. 🎓 **STATUS CHANGE: Active → Graduated**
- **Function:** `sendStatusChangeToGraduatedEmail()` in index.html
- **Location:** Lines 12388-12423
- **Status:** ✅ Has confirmEmailSend() modal

### 4. 💰 **CREDIT ADDED (Manual)**
- **Function:** `sendCreditAddedEmail()` in email-system-complete.html
- **Trigger:** Richy manually adds credit to student
- **Location:** Line ~3980 (handler requires manual trigger)
- **Status:** ✅ Manual send only - NOT called automatically

### 5. 📝 **ALIAS ADDED**
- **Function:** `sendAliasAddedEmail()` in email-system-complete.html
- **Location:** Line ~4265 (handler)
- **Status:** ✅ Manual confirmation required

### 6. ✏️ **PROFILE UPDATE EMAIL**
- **Function:** `sendProfileUpdateEmail()` in index.html
- **Location:** Line ~12215
- **Status:** ✅ Manual trigger only

---

## 🔒 IMPLEMENTATION CHECKLIST

### ✅ COMPLETED:
- [x] Removed confirmation from `sendAbsenceNotificationEmail()`
- [x] Removed confirmation from `sendScheduleChangeEmail()`
- [x] Removed confirmation from `sendGroupEnrollmentEmail()`
- [x] Created `sendPaymentReceiptEmail()` sender function (auto-send)
- [x] Created payment receipt handler in email-system-complete.html
- [x] Verified Welcome and Credit Applied are already auto-send
- [x] Verified Class Reminder and Payment Reminder are already auto-send
- [x] Kept confirmation in Status Change emails (Paused, Active, Graduated)

### ⚠️ TODO (WIRING):
- [ ] Wire `sendPaymentReceiptEmail()` to `addPayment()` function
- [ ] Wire `sendAbsenceNotificationEmail()` to absence marking button
- [ ] Wire `sendScheduleChangeEmail()` to group schedule save
- [ ] Wire `sendGroupEnrollmentEmail()` to student group assignment
- [ ] Test all 8 auto-send emails send without popup
- [ ] Test all manual emails show confirmation popup

---

## 📋 ARNOMA EMAIL STYLE COMPLIANCE

All emails follow the official ARNOMA Email Template Style:
- ✅ Gradient boxes with `border-left` colored accent (4px)
- ✅ Color coding: Green (#22c55e) positive, Red (#ef4444) negative, Blue (#3b82f6) info, Orange (#fbbf24) warning, Purple (#a855f7) graduation
- ✅ Structure: Dear {{Name}} → Status box → Info box → Footer
- ✅ Responsive padding (16-20px), border-radius (8-12px)
- ✅ `generateEmailHTML(title, bodyContent)` wrapper for consistency
- ✅ Tracked in `sent_emails` table via `trackSentEmail()`
- ✅ Notifications posted to NotificationCenter after send

---

## 🚨 CRITICAL RULES

1. **NO confirmation popup** for the 8 auto-send emails
2. **ALWAYS confirm** for status change and manual credit emails
3. **ALL emails** must follow ARNOMA style
4. **Create only if missing** - do NOT duplicate existing templates
5. **Track ALL emails** in sent_emails table
6. **Post ALL emails** to NotificationCenter

---

## 🔧 DEVELOPER NOTES

### Auto-Send Pattern:
```javascript
async function sendAutoEmail(student, params) {
  try {
    if (!student || !student.email) {
      return { success: false, error: 'No email address' };
    }

    // AUTO-SEND: Skip confirmEmailSend() entirely
    const emailFrame = document.querySelector('iframe[src*="email-system-complete.html"]');
    if (!emailFrame) {
      return { success: false, error: 'Email system not loaded' };
    }

    emailFrame.contentWindow.postMessage({
      action: 'sendAutoEmail',
      student: { name: student.name, email: student.email, id: student.id },
      ...params
    }, '*');

    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.data.action === 'autoEmailSent') {
          window.removeEventListener('message', handler);
          resolve({ success: true });
        }
      };
      window.addEventListener('message', handler);
      setTimeout(() => resolve({ success: false, error: 'Timeout' }), 30000);
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Manual Confirmation Pattern:
```javascript
async function sendManualEmail(student, params) {
  try {
    if (!student || !student.email) {
      return { success: false, error: 'No email address' };
    }

    // MANUAL: Show confirmation modal (BLOCKING)
    const confirmed = await confirmEmailSend(
      'Email Type',
      student.name,
      student.email,
      'Preview HTML...'
    );

    if (!confirmed) {
      return { success: false, error: 'User cancelled' };
    }

    // ... rest same as auto-send pattern
  }
}
```

---

**Last Updated:** November 18, 2025  
**Version:** 2.0 (Final Auto-Send Configuration)
