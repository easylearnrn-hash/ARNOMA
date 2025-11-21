# ARNOMA – AI Agent Instructions

**READ THIS FIRST.** ARNOMA is a production system with real student data. Any
mistakes here can break payments, calendars, or email automation. Follow these
rules strictly.

---

## 1. Project Overview

ARNOMA is a cloud-synced student management system with:

- Automated payment tracking
- Gmail integration & parsing
- Calendar scheduling and absence tracking
- Email automation and notifications

The app is a single-page application (SPA) built with vanilla JavaScript (ES6+)
and a Supabase backend.

### Tech Stack

**Frontend**

- `index.html` – primary SPA (~22k+ lines, HTML + CSS + JS in one file)
- `index.mobile.html` + `styles.mobile.css` – mobile-optimized version
- `email-system-complete.html` – runs in an iframe for email automation / Gmail
  parsing
- Design system: glassmorphism, purple/blue gradients, neon glow, rounded cards

**Backend**

- Supabase project: `zlvnxvrzotamhpezqedr.supabase.co`
- Supabase JS SDK: `@supabase/supabase-js@2.x`
- Edge Functions:
  - `/functions/v1/send-email` – calls Resend API for sending emails
  - `/functions/v1/gmail-oauth-callback` – Gmail OAuth2 callback handler
  - `/functions/v1/gmail-refresh-token` – refreshes Gmail tokens

**External APIs**

- Gmail API via OAuth2 (Google client library)
- Resend API (email sending, from Edge Function)

---

## 2. Backend Data Model (Supabase)

**Tables** (do not rename):

- `students` – Core student profile and billing data
  - Fields: `id`, `name`, `group_name`, `price_per_class`, `balance`, `status`,
    `email`, `phone`, `notes`, `show_in_grid`, `created_at`
- `groups` – Group metadata and schedule
  - Fields: `id`, `name`, `schedule`, `updated_at`
- `payments` – Payment records, mostly imported from Gmail
  - Fields: `id`, `payer`, `amount`, `date`, `gmail_id`, `student_id`
- `skipped_classes` – Canceled or skipped classes, used by calendar
  - Fields: `id`, `group_name`, `class_date`, `skip_type`, `note`
- `student_absences` – Individual student absences
  - Fields: `id`, `student_id`, `class_date`, `marked_at`
- `credit_payments` – Manual credits applied to specific dates
  - Fields: `id`, `student_id`, `amount`, `class_date`, `payment_date`, `note`
- `notifications` – Notification log (for history + toasts)
  - Fields: `id`, `type`, `title`, `description`, `student_name`, `timestamp`,
    `read`
- `user_preferences` – User settings (especially for timezone)
  - Fields: `id`, `timezone_offset_winter`, `timezone_offset_summer`
- `auto_reminder_paused` – Controls whether auto reminders are paused per
  student
  - Fields: `id`, `student_id`, `paused`
- `sent_emails` – Email send history
  - Fields: `id`, `template_name`, `recipient_email`, `status`, `sent_at`

**Do not:**

- Rename tables or core column names without explicit instruction.
- Change types for ID / date / status / foreign key fields.

---

## 3. Frontend Architecture & Data Flow

### 3.1 Core Files

- `index.html`
  - Main monolithic SPA – HTML, CSS, and JS live together.
  - Contains: Layout and UI for student manager, calendar, filters, modals, etc.
  - Global JS functions and singletons
  - Inline styles for glassmorphism UI and student cards
- `index.mobile.html` + `styles.mobile.css`
  - Mobile breakpoint and layout adjustments
  - Should mirror desktop logic; do not drift logic between desktop and mobile.
- `email-system-complete.html`
  - Runs inside an iframe.
  - Handles: Gmail OAuth, fetching and parsing payments
  - Communicates back to main app via postMessage

### 3.2 Data Flow & Caching

1. **Initial Load**
   - App queries Supabase:
     - `students` → `window.studentsCache`
     - `groups` → `window.groupsCache`
   - Caches use a 30s TTL (`window.studentsCacheTimestamp`, etc.).
2. **Updates (General Pattern)**
   - User action → local state mutation → `supabase.upsert()` (or insert/update)
     → cache updated → custom events dispatched.
3. **Custom Event System**
   - Used for cross-module communication:
     - `students:updated`
     - `payments:updated`
     - `calendar:initialized`
   - Consumers listen on `window.addEventListener(...)`.
4. **localStorage Usage**
   - Only for:
     - `gmail_access_token`
     - `gmail_refresh_token`
     - Optional lightweight fallback cache
   - Do NOT store sensitive data beyond what already exists.

---

## 4. Global Managers & Singletons

These are attached to `window`. Do not rename or relocate without explicit
direction:

- `PaymentStore` – All payment CRUD and Supabase sync.
- `SkipClassManager` – Tracks canceled / skipped classes. Used to gray out
  calendar cells.
- `AbsentManager` – Tracks absent students. Used to show gray dots.
- `CreditPaymentManager` – Tracks credit payments. Used to show blue dots.
- `NotificationCenter` – Creates and persists notifications. Also drives in-app
  toast UI.
- `AutomationEngine` – Runs automation (email reminders, etc.), often inside
  iframe context.

**Pattern:**

- Managers typically:
  - Load from Supabase on init.
  - Cache results.
  - Provide query methods (e.g., `isClassSkipped`, `isAbsent`,
    `getCreditPayment`).
  - Dispatch events on changes.

---

## 5. Critical Business Logic (Invariants)

### 5.1 Timezone Handling (ABSOLUTELY CRITICAL)

- **Base timezone**: `America/Los_Angeles` (LA time)
- **Functions** (examples; names must not be changed):
  - `getLANow()`
  - `formatDateInLA()`
  - `convertLATimeToYerevan()` (and similar helpers)
- `user_preferences` table stores:
  - `timezone_offset_winter`
  - `timezone_offset_summer`

**⚠️ DO NOT CHANGE:**

- The timezone baseline (LA).
- Existing timezone calculation logic and helpers.
- How dates and times are converted between LA and Yerevan.

This logic directly affects payment parsing, calendar rendering, email
timestamps, and schedule matching.

### 5.2 Student Status & Visibility

- **status values**:
  - `active`
  - `paused`
  - `graduated`
  - Stored lowercase in DB.
- **Additional visibility flag**:
  - DB: `show_in_grid`
  - Frontend: `showInGrid`
- **Interpretation**:
  - `status === 'active'` AND `showInGrid === true` → student appears on
    calendar.
  - If `showInGrid === false`: student remains active but is hidden from
    calendar.

Calendar generation (e.g., `generateCalendarData()`):

- MUST check both `status` and `showInGrid`.
- Do not change this invariant.

### 5.3 Payment Linking

- Gmail → payments flow:
  1. Payments fetched via Gmail API.
  2. Parsed (payer, amount, date, message, etc.).
  3. Auto-matched to students by name/alias.
  4. Supabase record:
     - `payment.student_id` links to `students.id`.
  5. Updating balances:
     - Changes trigger notification creation through `NotificationCenter`.

Do not rewrite payment matching unless explicitly requested.

### 5.4 Calendar Indicators

Each calendar cell may display:

- **Gray background** – class skipped/canceled →
  `SkipClassManager.isClassSkipped()`
- **Gray dot** – student absent → `AbsentManager.isAbsent()`
- **Blue dot** – credit payment applied →
  `CreditPaymentManager.getCreditPayment()`
- **Borders for payment state**:
  - Green border – full payment received
  - Red border – payment missing
  - Orange border – partial payment

Maintain these visual conventions and their underlying logic.

### 5.5 Schedule Parsing

- **Format**:
  - `"Monday 8:00 PM, Wednesday 8:00 PM"` (comma-separated).
- **Core function**:
  - `parseScheduleDays()` – extracts day names from schedule strings.
- **Rules**:
  - Classes appear only on or after the student's `created_at` date.
  - Group changes must:
    - Update `student.group` or `student.group_name`.
    - Trigger schedule recalculation and calendar refresh.

Do not change schedule parsing behavior or formats without explicit instruction.

---

## 6. UI & Design Constraints

### Student Cards & Buttons

- Glassmorphism design with neon glow and rounded edges.
- Core structure (examples):
  - `.btn-wrapper`
  - `.btn`
  - `.btn-txt`
- **Rules**:
  - Do not remove or rename CSS classes that are referenced from JS.
  - Do not significantly alter card structure (HTML hierarchy) without
    coordinating JS changes.
  - Maintain the existing glow, shadow, and gradient style.

### Modals

- Positioning, sizing, and basic behavior (open/close) are sensitive.
- **Do not**:
  - Change modal base layout or transitions casually.
  - Introduce layout shifts when opening/closing modals.

---

## 7. Versioning & Release Discipline

- Current version stored in `<meta name="version" content="...">` near the top
  of `index.html`.
- Example: `2.8.1`
- **Valid formats**:
  - Semantic: `MAJOR.MINOR.PATCH` (e.g., `2.6.4`)
  - Date-based: `YYYY.MM.DD.XX` (e.g., `2025.11.20.01`)

**⚠️ REQUIRED:** Increment the version on every push that changes behavior or
UI. Update is typically at line ~12 of `index.html`.

---

## 8. Safe Extension Patterns

### 8.1 Adding a New Field to Students

When introducing a new property (e.g., `preferred_language`):

1. **Supabase**
   - Add a column to the `students` table with the correct type.
2. **Data Load**
   - Update `loadStudents()` mapping (~line 6450 in `index.html`).
3. **Data Save**
   - Update `saveStudent()` payload mapping (~line 6500).
4. **UI**
   - Add inputs to the Student Manager modal.
   - Add display output to the student card (if needed).
5. **Cache + Events**
   - Ensure the students cache is updated and `students:updated` dispatched.

### 8.2 Creating Notifications

Use `NotificationCenter` where available:

```javascript
if (window.NotificationCenter) {
  await window.NotificationCenter.add(
    window.NotificationCenter.NotificationType.SUCCESS,
    'Title',
    'Description',
    { studentName: 'John', metadata: {} }
  );
}
```

### 8.3 Querying Supabase Safely

Standard pattern:

```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error querying Supabase:', error);
  return;
}
```

### 8.4 Updating Caches & Dispatching Events

After modifying student data:

```javascript
window.studentsCache = students; // Update cache contents
window.studentsCacheTimestamp = Date.now(); // Reset TTL timestamp

window.dispatchEvent(
  new CustomEvent('students:updated', {
    detail: { source: 'manual-edit' },
  })
);
```

---

## 9. Development Safety Rules (MUST FOLLOW)

### 9.1 Do NOT Modify (Unless Explicitly Requested)

- Timezone and date functions:
  - `getLANow`, `formatDateInLA`, `convertLATimeToYerevan`, etc.
- Schedule parsing:
  - `parseScheduleDays`, `parseSchedule`, schedule string formats.
- Payment matching and linking logic.
- Calendar indicator logic (gray background, gray dot, blue dot, borders).
- Filter / toggle persistence behavior in UI.
- Modal base layout, positioning, and open/close behavior.
- Student card structure and main glassmorphism design.
- Manager initialization and event binding sequences.

### 9.2 Do NOT Rename/Relocate

- **Global caches / data**:
  - `window.studentsCache`
  - `window.studentsCacheTimestamp`
  - `window.groupsCache`
  - `window.globalData`
- **Global managers**:
  - `window.SkipClassManager`
  - `window.AbsentManager`
  - `window.CreditPaymentManager`
  - `window.NotificationCenter`
  - `window.PaymentStore`
  - `window.AutomationEngine`
- **Core functions** (names & signatures):
  - `renderCalendar()`
  - `loadStudents()`
  - `saveStudent()`
  - `updateStudentCardDisplay()`
- CSS classes referenced in JS queries (e.g.,
  `document.querySelector('.some-class')`).

---

## 10. Testing & Debugging Guidelines

### 10.1 Console Logging Conventions

Look for prefixed logs in DevTools Console:

- `✅` – success
- `❌` – error
- `☁️` – Supabase / cloud sync
- `📊` – calendar / data calculations

Modules may prefix logs with:

- `[SkipClassManager]`
- `[AbsentManager]`
- `[NotificationCenter]`
- `[PaymentStore]`
- `[AutomationEngine]`

### 10.2 Common Issues to Check

- **Gmail disconnected**
  - Tokens expired → re-run OAuth flow.
- **Calendar not reflecting changes**
  - Ensure corresponding manager reloads from Supabase (e.g.,
    `SkipClassManager.reloadFromSupabase()`).
- **Students missing from calendar**
  - Check both `status === 'active'` and `showInGrid === true`.
- **Balances incorrect**
  - Verify `payment.student_id` linking is correct.
  - Confirm no duplicate payments or wrong dates.

---

## 11. Pre-Commit / Pre-Push Checklist (AI & Humans)

Before you consider a change "done":

- ✅ No errors or warnings in browser console.
- ✅ No layout shifts on:
  - Desktop (`index.html`)
  - Mobile (`index.mobile.html`)
- ✅ All modals open/close and scroll correctly.
- ✅ Filters and toggles persist until the user clears them explicitly.
- ✅ Calendar renders:
  - Skip gray background
  - Absence gray dots
  - Credit blue dots
  - Payment borders (green/red/orange)
- ✅ Student cards show correct:
  - Group association
  - Status (active/paused/graduated)
  - Visibility (honors `showInGrid`)
- ✅ Button / card click behaviors work as before.
- ✅ Version number in `<meta name="version">` incremented.
- ✅ Supabase queries do not log secrets and handle errors gracefully.

---

## 12. Git & Collaboration Guidelines

- Keep commits small and focused.
- Do not combine unrelated features or refactors.
- Use descriptive commit messages that reference the feature or bug.
- When making larger changes:
  - Add inline comments explaining non-obvious logic.
  - Avoid "clever" one-liners that obscure the business rules.

---

**Last Updated**: 2025-11-20 **AI Agent Note**: This is a production system with
real student data. Exercise extreme caution. Always validate changes before
pushing.
