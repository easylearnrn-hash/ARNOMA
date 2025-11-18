# Class Cancellation & Payment Forwarding - Implementation Status

## ✅ COMPLETED (Step 1 & 2)

### 1. Database Schema Migration

**File:** `MIGRATION-CLASS-CANCELLATION-SUPPORT.sql`

**Changes to `skipped_classes` table:**

- ✅ Added `skip_type` column (enum: 'student-skipped' | 'class-canceled')
- ✅ Added `note` column for cancellation reasons
- ✅ Added indexes for performance
- ✅ Migrated existing records to 'student-skipped' type

**Changes to `credit_payments` table:**

- ✅ Added `payment_date` column (when payment was actually made)
- ✅ Added `applied_class_date` column (which class the payment applies to)
- ✅ Added `note` column for tracking payment forwarding
- ✅ Added indexes for performance
- ✅ Backward compatibility: existing records get default values

**ACTION REQUIRED:** Run the SQL migration in Supabase SQL Editor

### 2. SkipClassManager Core Logic

**File:** `index.html` (lines ~11771-12370)

**Completed Functions:**

- ✅ `loadSkippedClasses()` - Updated to load new structure with type and note
- ✅ `saveSkippedClasses()` - Updated to save type and note
- ✅ `isClassSkipped(groupName, dateStr)` - Check if class is skipped (any type)
- ✅ `isClassCanceled(groupName, dateStr)` - Check if class is fully canceled
- ✅ `getSkipInfo(groupName, dateStr)` - Get skip details (type, note)
- ✅ `cancelClass(groupName, dateStr, note)` - Cancel entire class (NEW)
- ✅ `forwardPaymentsForCanceledClass(groupName, dateStr)` - Auto-forward
  payments (NEW)
- ✅ `findNextActiveClassDate(groupName, fromDateStr)` - Find next non-canceled
  class (NEW)
- ✅ `formatDate(date)` - Helper function (NEW)
- ✅ Updated Public API to expose new functions

**How it works:**

1. When a class is canceled via `cancelClass()`:
   - Stores cancellation in Supabase with type='class-canceled'
   - Automatically calls `forwardPaymentsForCanceledClass()`
   - Refreshes calendar and timer UI

2. Payment forwarding logic:
   - Loads all payments made on the canceled date
   - For each payment, finds next active class using `findNextActiveClassDate()`
   - Updates payment record:
     - `payment_date`: Original date (preserved)
     - `applied_class_date`: Next class date
     - `note`: "Forwarded from canceled class on [date]"

---

## ⏳ IN PROGRESS (Step 3)

### 3. Calendar Rendering Updates

**Location:** `index.html` function `renderCalendar()` and related

**What needs to be done:**

- Update dot rendering logic to check `isClassCanceled()`
- Canceled classes should show **GREY dot** regardless of payment status
- Override any red/unpaid dot logic for canceled dates
- Update tooltip to show "Canceled" status

**Code changes needed:**

```javascript
// In calendar dot rendering logic (find this section):
const skipInfo = window.SkipClassManager.getSkipInfo(groupName, dateStr);

if (skipInfo && skipInfo.type === 'class-canceled') {
  // Show grey dot for canceled class
  dotColor = '#9CA3AF'; // grey
  dotClass = 'canceled';
  tooltipText = 'Class Canceled';
  if (skipInfo.note) {
    tooltipText += `: ${skipInfo.note}`;
  }
} else if (isSkipped) {
  // Regular skip logic...
} else if (isPaid) {
  // Paid logic...
} // etc
```

---

## ❌ TODO (Steps 4-8)

### 4. Sidebar Display Logic

**Location:** Calendar sidebar showing students for selected date

**Requirements:**

- When date is canceled, ALL students show "Canceled" badge (grey)
- NO "Unpaid" status for canceled classes
- NO payment required indicators
- If payment was forwarded, show "Payment forwarded to [next date]"

**Implementation needed:**

```javascript
// In sidebar rendering (when showing students for a date):
if (window.SkipClassManager.isClassCanceled(groupName, dateStr)) {
  // Show canceled badge for all students
  studentStatus = 'canceled';
  statusBadge = '<span class="badge badge-grey">Canceled</span>';

  // Check if payment was forwarded
  const payment = getPaymentForStudent(studentId, dateStr);
  if (payment && payment.applied_class_date !== dateStr) {
    statusBadge += `<span class="badge badge-info">Payment → ${payment.applied_class_date}</span>`;
  }
}
```

### 5. Automation Engine / Reminder System

**Files:**

- `index.html` - PaymentReminderManager
- `email-system-complete.html` - AutomationEngine

**Requirements:**

- Skip canceled classes in automation checks
- No reminders sent for canceled classes
- Filter out canceled dates when checking unpaid students

**Implementation needed:**

```javascript
// In automation engine, before checking students:
const skipInfo = window.SkipClassManager.getSkipInfo(groupName, classDateStr);
if (skipInfo && skipInfo.type === 'class-canceled') {
  console.log('⏭️ Skipping canceled class:', groupName, classDateStr);
  continue; // Skip this class
}
```

### 6. Payment Expectation Logic

**Location:** Multiple locations calculating pending payments, forecasts, totals

**Requirements:**

- Exclude canceled classes from pending payment totals
- Exclude from earnings forecasts
- Exclude from "unpaid" counts
- Update balance calculations to skip canceled dates

**Areas to update:**

- Payment calendar pending totals
- Earnings forecast calculations
- Student payment status checks
- Balance due calculations

### 7. Reverse Cancellation (Undo)

**Location:** `index.html` SkipClassManager

**Requirements:**

- Add `uncancelClass(groupName, dateStr)` function
- Restore class as active
- Handle forwarded payments:
  - If payment date matches original class date → restore to that date
  - If payment was already consumed → keep it where it is
  - Add logic to prevent double-counting

**Implementation needed:**

```javascript
async function uncancelClass(groupName, dateStr) {
  // Remove from skippedClasses
  if (skippedClasses[groupName]) {
    delete skippedClasses[groupName][dateStr];
  }

  // Check for forwarded payments
  const { data: forwardedPayments } = await supabase
    .from('credit_payments')
    .select('*')
    .eq('payment_date', dateStr)
    .neq('applied_class_date', dateStr);

  // Restore forwarded payments if appropriate
  // (Complex logic - need to check if applied_class_date was already consumed)

  await saveSkippedClasses();
  // Refresh UI...
}
```

### 8. Testing

**Test scenarios:**

1. ✅ Cancel a class → verify payments forwarded
2. ❌ Cancel a class → verify grey dot shows in calendar
3. ❌ Cancel a class → verify sidebar shows "Canceled" for all students
4. ❌ Cancel a class → verify no reminders sent
5. ❌ Cancel a class → verify not in pending totals
6. ❌ Student pays on canceled day → verify payment appears on next class
7. ❌ Undo cancellation → verify class restored correctly
8. ❌ Undo cancellation → verify forwarded payments handled correctly

---

## UI INTEGRATION POINTS

### Calendar Sidebar Cancel Button

**Location:** Calendar sidebar (when viewing a specific date)

**Needs to be added:**

```html
<button onclick="cancelClassFromSidebar()" class="btn-cancel-class">
  Cancel This Class
</button>

<script>
  function cancelClassFromSidebar() {
    const groupName = getCurrentSidebarGroup();
    const dateStr = getCurrentSidebarDate();

    const note = prompt('Reason for cancellation (optional):');

    if (confirm(`Cancel entire ${groupName} class on ${dateStr}?`)) {
      window.SkipClassManager.cancelClass(groupName, dateStr, note);
      showNotification('✅ Class canceled and payments forwarded', 'success');
    }
  }
</script>
```

### Countdown Timer Integration

**Location:** Countdown timer skip button

**Current:** Calls `SkipClassManager.skipClass()` (student skip) **Needed:** Add
option to cancel entire class vs skip individual student

---

## API REFERENCE

### New SkipClassManager Functions

```javascript
// Check if class is canceled (entire class)
window.SkipClassManager.isClassCanceled(groupName, dateStr);
// Returns: boolean

// Get skip details
window.SkipClassManager.getSkipInfo(groupName, dateStr);
// Returns: { type: 'student-skipped' | 'class-canceled', note: string | null } | null

// Cancel entire class (with automatic payment forwarding)
window.SkipClassManager.cancelClass(groupName, dateStr, note);
// Returns: boolean (success)

// Find next active class date (excluding canceled dates)
window.SkipClassManager.findNextActiveClassDate(groupName, fromDateStr);
// Returns: string (YYYY-MM-DD) | null
```

---

## PRIORITY ORDER

**HIGH PRIORITY (Must complete for feature to work):**

1. ✅ Database migration (DONE - need to run SQL)
2. ✅ Core logic in SkipClassManager (DONE)
3. ⏳ Calendar dot rendering (IN PROGRESS)
4. ❌ Sidebar display logic
5. ❌ Automation engine exclusions

**MEDIUM PRIORITY (Important for UX):** 6. ❌ Payment expectation logic 7. ❌ UI
buttons to cancel class

**LOW PRIORITY (Nice to have):** 8. ❌ Reverse cancellation (undo) 9. ❌ Mobile
UI consistency

---

## NEXT STEPS

1. **Run SQL migration in Supabase** (MIGRATION-CLASS-CANCELLATION-SUPPORT.sql)
2. **Update calendar rendering** to show grey dots for canceled classes
3. **Update sidebar** to show "Canceled" badge
4. **Update automation engine** to skip canceled classes
5. **Test payment forwarding** with real scenario
6. **Add cancel buttons** to calendar sidebar
7. **Update mobile views** for consistency

---

## NOTES

- Payment forwarding is **automatic** when cancelClass() is called
- Canceled classes are stored the same way as skipped classes (unified system)
- The `applied_class_date` concept allows flexible payment tracking
- Backward compatible: existing records will work without migration (defaults
  applied)
- All canceled classes show as grey dots (override any other status)
