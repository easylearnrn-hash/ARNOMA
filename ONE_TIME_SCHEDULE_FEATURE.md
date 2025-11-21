# One-Time Schedule Override Feature

**Version**: 2.10.0  
**Date**: November 21, 2025  
**Status**: ✅ Implemented

---

## Overview

The one-time schedule feature allows teachers to temporarily override a group's recurring weekly schedule for a specific date. After that date passes, the system automatically reverts to the normal recurring schedule.

---

## Use Case Example

**Normal Schedule**: Tuesday 8:00 PM (recurring weekly)

**Scenario**: Teacher needs to cancel Tuesday's class and reschedule to Wednesday for one week only.

**Solution**: Add a one-time schedule override for Wednesday with the specific date. Next week automatically returns to the regular Tuesday schedule.

---

## How It Works

### 1. User Interface

In the **Group Manager** → **Edit Schedule** section:

- Each schedule entry now includes a **"One-Time Only"** checkbox
- When checked, a date input field appears
- User selects the specific override date
- The override is saved separately from the recurring schedule

### 2. Data Structure

**Supabase Schema**:
```sql
ALTER TABLE groups
ADD COLUMN one_time_schedules JSONB DEFAULT '[]'::jsonb;
```

**Format**:
```json
[
  {
    "date": "2025-11-27",
    "day": "Wednesday",
    "time": "8:00 PM",
    "oneTime": true
  }
]
```

### 3. Schedule Resolution Logic

When generating the calendar for a specific date:

1. **Check for one-time override** for that exact date
2. If found → use the one-time schedule
3. If not found → use the regular recurring weekly schedule

**Function**: `getScheduleForDate(group, dateStr)`

### 4. Automatic Cleanup

- One-time schedules are automatically filtered out when their date is in the past
- Cleanup runs:
  - On app startup
  - Once per day (24-hour interval)
  - When checking schedules for calendar generation

**Function**: `cleanupExpiredOneTimeSchedules()`

---

## Technical Implementation

### Modified Functions

1. **`addScheduleItem()`**
   - Added parameters: `isOneTime`, `overrideDate`
   - Renders checkbox and date input
   - Toggles date input visibility

2. **`toggleOneTimeDate()`**
   - Shows/hides date input based on checkbox
   - Sets default date to today

3. **`saveScheduleEdit()`**
   - Separates regular schedules from one-time overrides
   - Saves both independently
   - `group.schedule` = recurring weekly schedule
   - `group.one_time_schedules` = array of overrides

4. **`saveGroup()`**
   - Includes `one_time_schedules` in Supabase payload
   - Persists overrides to database

5. **`loadGroupsFromSupabase()`**
   - Loads `one_time_schedules` field
   - Defaults to empty array for legacy records

6. **`getScheduleForDate()`** ⭐ **NEW**
   - Checks for one-time override first
   - Falls back to recurring schedule
   - Filters out expired overrides

7. **`cleanupExpiredOneTimeSchedules()`** ⭐ **NEW**
   - Removes expired one-time schedules
   - Runs daily automatically
   - Updates Supabase and cache

8. **`generateCalendarData()`**
   - Uses `getScheduleForDate()` instead of `parseScheduleDays()`
   - Checks both regular and override schedules

9. **`getDayData()`**
   - Uses `getScheduleForDate()` for day detail view
   - Consistent with main calendar logic

---

## Database Migration

**Required SQL** (run in Supabase SQL Editor):

File: `ADD_ONE_TIME_SCHEDULES_COLUMN.sql`

```sql
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS one_time_schedules JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN groups.one_time_schedules IS 
'JSON array of one-time schedule overrides. Each object contains: 
date (YYYY-MM-DD), day (day name), time (12h format), oneTime (true)';
```

---

## User Workflow

### Creating a One-Time Override

1. Open **Group Manager** (📚 button)
2. Click **Edit Schedule** for the desired group
3. Click **+ Add Time Slot**
4. Select the day and time for the override
5. ✅ Check **"One-Time Only"**
6. Select the specific date in the date picker
7. Click **💾 Save**

### Result

- The calendar will show the override **only for that specific date**
- All other dates use the regular recurring schedule
- After the date passes, the override is automatically removed

### Editing Existing Overrides

1. Open **Group Manager** → **Edit Schedule**
2. One-time schedules appear with the checkbox checked and date filled
3. Modify as needed or delete the row
4. Click **💾 Save**

---

## Important Notes

### ⚠️ Critical Invariants

1. **One-time schedules DO NOT modify the recurring schedule**
   - `group.schedule` remains unchanged
   - Overrides are stored separately in `group.one_time_schedules`

2. **Overrides are date-specific**
   - They apply **only** to the exact date specified
   - They do **not** repeat weekly

3. **Automatic expiration**
   - Past dates are automatically ignored
   - Cleanup removes them from the database daily

4. **Priority order**
   - One-time override > Recurring schedule
   - If both exist for a date, override wins

### 🔒 Data Safety

- Regular schedules are never deleted or modified by one-time overrides
- Overrides can be removed without affecting the recurring schedule
- Legacy groups without overrides default to empty array `[]`

---

## Testing Checklist

- ✅ Add a one-time override and verify it appears on the calendar
- ✅ Verify the recurring schedule still applies to other dates
- ✅ Verify past overrides are automatically cleaned up
- ✅ Edit an existing override and save changes
- ✅ Delete an override and verify calendar updates
- ✅ Verify payment tracking works correctly with overrides
- ✅ Verify email notifications (if applicable) work with overrides

---

## Future Enhancements (Optional)

1. **Visual indicator** on calendar cells showing one-time overrides (e.g., blue border)
2. **Bulk override creation** for multiple dates at once
3. **Override history log** for audit purposes
4. **Email notifications** when a one-time schedule is added

---

## Files Modified

- `index.html` (core app)
  - UI components for checkbox and date input
  - Schedule save/load logic
  - Calendar generation logic
  - Cleanup automation

- `ADD_ONE_TIME_SCHEDULES_COLUMN.sql` (database migration)
  - Adds `one_time_schedules` column to `groups` table

---

## Support & Troubleshooting

### One-time schedule not appearing on calendar

1. Check browser console for errors
2. Verify the date is in the future (past dates are ignored)
3. Verify the group is active
4. Refresh the calendar

### Override persists after date has passed

1. Wait for daily cleanup (runs every 24 hours)
2. Or manually reload the page to trigger cleanup on startup

### Schedule conflicts

- One-time overrides **always take priority** over recurring schedules
- If you see unexpected behavior, check for existing overrides in Group Manager

---

**Last Updated**: November 21, 2025  
**Developer**: AI Agent (GitHub Copilot)  
**Production Ready**: ✅ Yes
