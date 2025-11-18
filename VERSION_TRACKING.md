# ARNOMA Version Tracking

## Current Version: v2.1.7

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
- **EMAIL SYSTEM VERIFICATION**: All email variables validated
  - Payment Reminder: {{StudentName}}, {{UnpaidClasses}}, {{Balance}}
  - Payment Receipt: Hardcoded values (student.name, paymentAmount, paymentDate, newBalance)
  - Class Reminder: {{StudentName}}, {{GroupName}}, {{ClassTime}}, {{TimeOfDay}}, {{PaymentMessage}}, {{ClassDate}}
  - Class Starting Soon: {{StudentName}}, {{GroupName}}, {{ClassTime}}, {{ClassDate}}, {{ZoomLink}}
  - Welcome Email: {{StudentName}}, {{Group}}, {{GroupSchedule}}
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

- **Major.Minor.Patch** (e.g., 2.1.5)
- **Patch** (+0.0.1): Bug fixes, minor tweaks, console log cleanup
- **Minor** (+0.1.0): New features, significant improvements
- **Major** (+1.0.0): Breaking changes, major overhauls

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
