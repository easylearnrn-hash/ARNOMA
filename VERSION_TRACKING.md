# ARNOMA Version Tracking

## Current Version: v2.1.9

## Version Update Checklist (Before Every Push)
When making changes, update the version in **3 places** in `index.html`:

### 1. Meta Tags (Line ~6)
```html
<title>ARNOMA - Student Management [v2.1.X]</title>
<meta name="version" content="2.1.X-description" />
```

### 2. Console Version Log (Line ~71)
```javascript
console.log('🔥 ARNOMA v2.1.X - Description of changes');
```

### 3. Payment Records Header (Line ~4847)
```html
<h1>Payment Records <span style="font-size: 14px; color: rgba(255, 255, 255, 0.7); font-weight: 500;">🔥 ARNOMA v2.1.X</span></h1>
```

## Version History

### v2.1.9 (2025-11-18)
- **FIX**: Enhanced email notification viewer debugging
  - Added comprehensive error logging to `openPreviewModal()` function
  - Checks if modal and iframe elements exist before attempting to open
  - Logs each step: element found, content written, active class added
  - Added try-catch around `openPreviewModal()` call in `viewSentEmail()`
  - Better error messages to identify exact failure point
  - Helps diagnose why email preview modal may not be opening from notifications
- **PURPOSE**: Identify and fix notification email viewer issues once and for all

### v2.1.8 (2025-01-20)
- **NEW FEATURE**: Complete Automation Manager in Email System
  - View ALL active automations in one place (⚙️ Automations button)
  - System Automations section shows 3 built-in automations:
    - Payment Reminder (Auto) - Every 24 hours
    - Class Reminder (12 Hours Before)
    - Class Starting Soon (30 Minutes Before)
  - Each automation shows: description, template, check interval, trigger, and managing system
  - **Pause/Resume Controls**: Click ⏸️/▶️ to pause or resume any automation
  - Pause state persists in localStorage and respected by automation managers
  - Custom Automations section ready for future user-created automations
- **TECHNICAL**: Added pause checks in all automation managers
  - ClassReminderManager: Checks `automation_system_class_reminder_12h_paused`
  - ClassStartingSoonManager: Checks `automation_system_class_starting_soon_paused`
  - PaymentReminderManager: Checks `automation_system_payment_reminder_paused`
  - All managers update `last_check` timestamp in localStorage
  - Managers log "⏸️ PAUSED - Skipping reminder check" when paused
- **UI/UX**: Beautiful automation cards with color-coded status
  - Green border = Active system automation
  - Orange border = Paused system automation
  - Purple "SYSTEM" badge distinguishes built-in automations
  - Shows template name, check frequency, trigger conditions, and managing code
  - Monospace font for technical details (managed by which file/manager)

### v2.1.7 (2025-01-20)
- **CRITICAL FIX**: Fixed duplicate class reminder emails
  - Root cause: `forEach` with `async/await` doesn't properly wait for promises
  - Solution: Replaced all `forEach` with `for...of` loops in reminder managers
  - Changed `return` to `continue` for proper loop flow control
- **NEW FEATURE**: 30-Minute "Class Starting Soon" Reminder System
  - Complete `ClassStartingSoonManager` module (248 lines)
  - Sends Zoom link email 30 minutes before class
  - Checks every 10 minutes, sends in 25-35 minute window
  - localStorage deduplication: `class_starting_soon_sent`
  - Added template to email-system-complete.html with {{ZoomLink}} variable
  - Includes email handler for `sendClassStartingSoon` action
- **CRITICAL FIX**: Payment receipt emails now auto-send 100% of the time
  - Fixed `quickAddPayment()` - was bypassing `addPayment()` and directly saving to PaymentStore
  - Complete rewrite: Now calls `await addPayment()` properly
  - Triggers Supabase insert → auto-sends receipt email → creates notification
  - Ensures calendar quick-add payments get receipts like manual payments
- **NEW FEATURE**: Payment receipt notifications
  - Enhanced `addPayment()` to create notification after successful email
  - Shows "Payment Receipt Sent: $X" with student name, amount, date
  - User always sees confirmation that receipt was sent
- **FIX**: Welcome email template now says "Group E" instead of just "E"
  - Changed from: "You are enrolled in {{Group}}"
  - Changed to: "You are enrolled in Group {{Group}}"
- **FIX**: Notification email viewer now works 100% of the time
  - Previously: Clicking email notifications showed "Email not found" if Sent Emails modal never opened
  - Root cause: viewSentEmail() relied on window._sentEmailsCache (only populated when modal opened)
  - Solution: Changed to async function that fetches directly from Supabase if not in cache
  - Now works immediately from notifications without needing to open Sent Emails first
- **EMAIL SYSTEM VERIFICATION**: All email variables validated
  - Payment Reminder: {{StudentName}}, {{UnpaidClasses}}, {{Balance}}
  - Payment Receipt: Hardcoded values (student.name, paymentAmount, paymentDate, newBalance)
  - Class Reminder: {{StudentName}}, {{GroupName}}, {{ClassTime}}, {{TimeOfDay}}, {{PaymentMessage}}, {{ClassDate}}
  - Class Starting Soon: {{StudentName}}, {{GroupName}}, {{ClassTime}}, {{ClassDate}}, {{ZoomLink}}
  - Welcome Email: {{StudentName}}, Group {{Group}}, {{GroupSchedule}}
  - All variables properly mapped and replaced in handlers

### v2.1.6 (2025-11-18)
- **NEW FEATURE**: Automated Class Reminder System
  - Sends reminders 12 hours before each class
  - "tomorrow" for morning classes (7-10 AM), "today" for evening classes
  - Smart payment status logic:
    - Paid: Simple reminder only
    - Unpaid (no credit): Payment reminder with Zelle QR code
    - Unpaid (has credit): Shows credit application and remaining balance
  - Includes class details: Group name, time, date
  - Automatic hourly checks
  - Creates notifications with email preview

### v2.1.5 (2025-11-18)
- Added version number display in Payment Records header
- Version now visible next to "Payment Records" title

### v2.1.4 (2025-11-18)
- Silenced 30 PaymentReminderManager verbose logs
- Total reduction: 56% of console.log calls removed
- Only shows summary and actual actions, not every check

### v2.1.3 (2025-11-18)
- Silenced 48 initialization logs
- Converted [ARNOMA], [NotificationCenter], [PaymentReminderManager] logs to debugLog
- Total reduction: 46% of console.log calls removed

### v2.1.2 (2025-11-18)
- Replaced 85 console.log calls with debugLog
- Silenced emoji-prefixed and bracketed debug logs
- 29% reduction in console overhead

### v2.1.1 (2025-11-18)
- Gmail polling reduced from 2min to 30min (93% reduction)
- Implemented 30s cache layer for Supabase reads
- Added 300ms debouncing for search inputs
- Hot-path console.log cleanup in processOverpayments
- Estimated 40-50% faster initial load

### v2.1.0 (2025-11-18)
- Initial performance-optimized version
- Comprehensive performance audit completed
- 72 performance issues documented

## Versioning Rules

**⚠️ CRITICAL RULE: EVERY UPDATE MUST CHANGE THE VERSION NUMBER**

Even for tiny updates (template fixes, single-line changes, typos), you MUST:
- Increment version number (e.g., v2.1.8 → v2.1.9), OR
- Add "S" suffix (e.g., v2.1.8 → v2.1.8S for small update)

### Version Increments:
- **Major.Minor.Patch** (e.g., 2.1.5)
- **Patch** (+0.0.1): Bug fixes, minor tweaks, console log cleanup, template updates
- **Minor** (+0.1.0): New features, significant improvements
- **Major** (+1.0.0): Breaking changes, major overhauls

### Alternative for Small Updates:
- Add "S" suffix to current version (e.g., v2.1.8 → v2.1.8S)
- Use for: Single-line fixes, typos, minor template changes
- Commit message format: `🔥 v2.1.8S: Brief description (update)`

## Quick Commands

### Update version and commit:
```bash
# Update the 3 locations in index.html first, then:
git add index.html
git commit -m "🔥 v2.1.X: Description of changes"
git push origin main
```

### Check current deployed version:
Open www.richyfesta.com and look at:
1. Browser tab title
2. Console first log
3. Payment Records header
