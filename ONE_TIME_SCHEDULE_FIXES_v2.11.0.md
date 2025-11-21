# ONE-TIME SCHEDULE FIXES - v2.11.0

## Issues Fixed

### 1. ✅ Checkbox Behavior Fixed
**Problem**: Clicking the checkbox opened date picker automatically  
**Solution**: Date picker stays always visible, checkbox just indicates temporary status  
- Added "📅 Temp" label next to checkbox for clarity
- Date picker is always visible but only used when checkbox is checked
- Simplified `toggleOneTimeDate()` function

### 2. ✅ Countdown Timer Integration
**Problem**: One-time schedules didn't appear in countdown timer  
**Solution**: Integrated one-time schedules into timer logic
- Created `getOneTimeSessionsForDate()` helper function
- Modified `findNextClass()` to check one-time schedules first
- Modified `getAllUpcomingClasses()` to include one-time schedules
- One-time classes show "(One-Time)" suffix in countdown timer
- Debug logs show "📅 ONE-TIME" label for easy identification

### 3. ✅ Group Manager Display
**Problem**: One-time schedules not visible in group editor  
**Solution**: Already implemented correctly
- One-time schedules load from `group.one_time_schedules` array
- Display with checkbox checked and date filled
- Save correctly separating regular vs one-time schedules

### 4. ⚠️ Database Migration Required
**Problem**: `skip_type` column missing from `skipped_classes` table  
**Action Required**: Run `MIGRATION-CLASS-CANCELLATION-SUPPORT.sql` in Supabase
- See `URGENT_DB_MIGRATION_REQUIRED.md` for instructions
- Required for "Cancel Class" feature to work

## How It Works Now

### Adding One-Time Schedule
1. Open Group Manager → Edit Schedule
2. Click "+ Add Schedule"
3. Select day of week (e.g., "Monday")
4. Set time (e.g., "8:00 PM")
5. Check "📅 Temp" checkbox
6. Click on date picker and select specific date
7. Click "Save Schedule"

### Visual Indicators
- **Group Manager**: 
  - Checkbox checked = temporary class
  - Date picker shows specific date
  - "📅 Temp" label for clarity
- **Countdown Timer**:
  - Group name shows "(One-Time)" suffix
  - Appears in chronological order with regular classes
- **Calendar**:
  - Uses `getScheduleForDate()` which prioritizes one-time overrides

### How System Handles One-Time Schedules

**Priority Order**:
1. Check for one-time schedule override for specific date
2. If override exists → use it (ignores regular schedule for that date)
3. If no override → use regular recurring schedule

**Example**:
- Regular schedule: "Monday 8:00 PM, Wednesday 8:00 PM"
- One-time override: Monday 2025-11-25 at 6:00 PM
- Result for Nov 25: Class at 6:00 PM (not 8:00 PM)
- Result for other Mondays: Class at 8:00 PM (regular schedule)

## Code Changes

### New Function
```javascript
function getOneTimeSessionsForDate(group, targetDate)
```
- Returns one-time schedule sessions for a specific date
- Used by countdown timer to check each date

### Modified Functions
1. **findNextClass()**: Checks one-time schedules before recurring schedule
2. **getAllUpcomingClasses()**: Includes one-time schedules in upcoming classes list
3. **toggleOneTimeDate()**: Simplified - no longer shows/hides date picker
4. **addScheduleItem()**: Date picker always visible, added "📅 Temp" label

## Testing Checklist

- [ ] Add one-time schedule in Group Manager
- [ ] Verify checkbox shows "📅 Temp" label
- [ ] Verify date picker is always visible
- [ ] Save and check countdown timer shows "(One-Time)" suffix
- [ ] Verify calendar uses one-time schedule on specified date
- [ ] Verify regular schedule used on other dates
- [ ] Verify expired one-time schedules get cleaned up automatically

## Files Modified
- `index.html` (v2.11.0)
  - Line ~14787: `addScheduleItem()` - added Temp label
  - Line ~14811: `toggleOneTimeDate()` - simplified behavior
  - Line ~16530: Added `getOneTimeSessionsForDate()` helper
  - Line ~16568: `findNextClass()` - integrated one-time schedules
  - Line ~16798: `getAllUpcomingClasses()` - integrated one-time schedules

## Related Features
- One-time schedules stored in `groups.one_time_schedules` JSONB column
- Auto-cleanup of expired one-time schedules via `cleanupExpiredOneTimeSchedules()`
- Calendar rendering via `getScheduleForDate()` respects one-time overrides

---
**Version**: 2.11.0  
**Date**: November 21, 2025  
**Status**: ✅ Complete (pending DB migration for cancel class feature)
