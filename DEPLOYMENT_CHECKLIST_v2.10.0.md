# One-Time Schedule Feature - Deployment Checklist

**Version**: 2.10.0  
**Date**: November 21, 2025  
**Feature**: One-Time Schedule Override

---

## ✅ Pre-Deployment Steps

### 1. Database Migration (REQUIRED)

Run this SQL in Supabase SQL Editor:

```sql
-- File: ADD_ONE_TIME_SCHEDULES_COLUMN.sql

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS one_time_schedules JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN groups.one_time_schedules IS 
'JSON array of one-time schedule overrides. Each object contains: 
date (YYYY-MM-DD), day (day name), time (12h format), oneTime (true)';
```

**Verify**:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'groups' 
  AND column_name = 'one_time_schedules';
```

Expected result: Column exists with type `jsonb` and default `'[]'::jsonb`

---

### 2. Code Files Modified

- ✅ `index.html` (version 2.10.0)
  - Added checkbox and date input to schedule editor
  - Updated `addScheduleItem()` function
  - Added `toggleOneTimeDate()` helper
  - Updated `saveScheduleEdit()` to handle one-time schedules
  - Updated `saveGroup()` to persist one-time schedules
  - Updated `loadGroupsFromSupabase()` to load one-time schedules
  - Added `getScheduleForDate()` helper function
  - Added `cleanupExpiredOneTimeSchedules()` function
  - Updated `generateCalendarData()` to check overrides
  - Updated `getDayData()` to check overrides
  - Added daily cleanup automation on startup

- ✅ `ADD_ONE_TIME_SCHEDULES_COLUMN.sql` (new file)
  - Database migration script

- ✅ `ONE_TIME_SCHEDULE_FEATURE.md` (new file)
  - Complete feature documentation

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

1. Open Supabase SQL Editor
2. Paste contents of `ADD_ONE_TIME_SCHEDULES_COLUMN.sql`
3. Click **Run**
4. Verify success message: `✅ one_time_schedules column added successfully!`

### Step 2: Deploy Updated Code

1. Push `index.html` to production
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Verify version in browser console: `ARNOMA v2.10.0 - One-Time Schedule Override`

---

## ✅ Post-Deployment Verification

### Test 1: Add One-Time Override

1. Open **Group Manager** (📚 button)
2. Click **Edit Schedule** for any group
3. Click **+ Add Time Slot**
4. Select day and time
5. ✅ Check **"One-Time Only"**
6. Select a future date
7. Click **💾 Save**
8. Open browser DevTools Console
9. Look for: `📅 Schedule Update Check: { ..., oneTimeSchedules: [...] }`

**Expected**: 
- No errors in console
- One-time schedule saved successfully
- `group.one_time_schedules` contains the override

### Test 2: Verify Calendar Display

1. Navigate to the month containing the override date
2. Find the specific date on the calendar
3. Verify students in that group appear on the override day
4. Verify they do NOT appear on the regular day for that week

**Expected**:
- Calendar shows students on override date only
- Regular schedule applies to all other weeks

### Test 3: Verify Cleanup

1. Add a one-time override for today or a past date
2. Reload the page
3. Check browser console for: `🧹 Cleaned X expired one-time schedules from group...`

**Expected**:
- Past overrides are automatically removed
- Console shows cleanup message

### Test 4: Edit Existing Override

1. Open **Group Manager**
2. Click **Edit Schedule** for a group with an override
3. Verify the override appears with:
   - Checkbox ✅ checked
   - Date field filled
4. Modify the date or time
5. Click **💾 Save**

**Expected**:
- Changes persist
- Calendar updates immediately

### Test 5: Delete Override

1. Open **Group Manager** → **Edit Schedule**
2. Find the one-time override row
3. Click **🗑️** (delete button)
4. Click **💾 Save**

**Expected**:
- Override removed from database
- Calendar reverts to regular schedule

---

## 🔍 Monitoring & Logging

Watch browser console for:

- ✅ `📅 Schedule Update Check:` – Shows schedule changes being saved
- ✅ `🧹 Cleaned X expired one-time schedules` – Shows automatic cleanup
- ✅ `✅ ARNOMA v2.10.0 - One-Time Schedule Override ✅` – Confirms correct version

---

## ⚠️ Known Limitations

1. **No visual indicator** on calendar cells showing which days have overrides
   - Future enhancement: Add blue border or badge

2. **No bulk override creation**
   - Must add one date at a time
   - Future enhancement: Multi-date picker

3. **No override history/audit log**
   - Once deleted or expired, no record remains
   - Future enhancement: Archive expired overrides

---

## 🆘 Rollback Plan (If Needed)

### If issues occur:

1. **Revert code**: Deploy previous version (2.9.1)
2. **Database rollback** (optional):
   ```sql
   ALTER TABLE groups DROP COLUMN IF EXISTS one_time_schedules;
   ```
3. Clear browser cache

**Note**: Rolling back the database column will **delete all one-time overrides**. Only do this if absolutely necessary.

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify database migration completed successfully
3. Ensure `one_time_schedules` column exists in `groups` table
4. Verify version is 2.10.0 (check console on page load)

---

## ✅ Deployment Complete

Once all tests pass:

- [ ] Database migration successful
- [ ] Code deployed and version verified
- [ ] One-time schedules can be added
- [ ] Calendar displays overrides correctly
- [ ] Cleanup runs automatically
- [ ] No errors in console

**Status**: Ready for production ✅

---

**Deployed by**: _______________  
**Date**: _______________  
**Time**: _______________  
**Production URL**: https://arnoma.app (or your domain)
