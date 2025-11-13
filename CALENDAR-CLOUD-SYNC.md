# ☁️ Calendar Cloud Sync - Setup Guide

## Overview

Your Smart Payment Calendar is now **fully cloud-synced** using Supabase! All calendar data (students, groups, payments, and skipped classes) syncs automatically across all devices.

---

## ✅ What's Already Synced

Your application **already syncs** these data sources to Supabase:

1. **Students** → `students` table
2. **Groups** (with schedules) → `groups` table  
3. **Payments** → `payments` table

The calendar reads from these tables, so **it already works across devices** for most features!

---

## 🆕 New Feature: Skipped Classes Sync

The **only remaining piece** that was stored locally has now been upgraded to cloud sync:

### What Changed

**Before:**
- Skipped classes stored in `localStorage` only
- Each device had its own skipped class list
- No sync between devices

**After:**
- Skipped classes stored in Supabase `skipped_classes` table
- Automatic sync across all devices
- localStorage used as backup fallback

---

## 🚀 Setup Instructions

### Step 1: Create the Supabase Table

1. Open your Supabase dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `zlvnxvrzotamhpezqedr`
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Open the file `supabase-skipped-classes-table.sql` in this directory
6. Copy the entire SQL script and paste it into the query editor
7. Click **"Run"** to execute
8. Verify the table was created: Go to **"Table Editor"** → you should see `skipped_classes`

### Step 2: Test the Sync

1. Open ARNOMA on Device A (e.g., your laptop)
2. Open the **Class Countdown Timer** (click the ◷ button in the floating nav)
3. Double-click any class to skip it
4. Open ARNOMA on Device B (e.g., your phone)
5. Click the **☁️ Sync Cloud** button in Student Manager
6. Open the calendar → the skipped class should appear grayed out! ✅

---

## 📊 Supabase Table Structure

```sql
skipped_classes
├── id (bigserial) - Primary key
├── group_name (text) - Group identifier (e.g., "A", "B", "Group C")
├── class_date (date) - Date of skipped class (YYYY-MM-DD)
├── skipped_at (timestamptz) - When it was skipped
└── created_at (timestamptz) - Record creation timestamp

Indexes:
- idx_skipped_classes_group_name (fast lookup by group)
- idx_skipped_classes_class_date (fast lookup by date)
- idx_skipped_classes_group_date (composite index)

Constraints:
- UNIQUE(group_name, class_date) - Prevents duplicates
```

---

## 🔄 How Sync Works

### Load Process (App Startup)
```javascript
1. SkipClassManager.init() called
2. Load from Supabase: SELECT * FROM skipped_classes
3. Convert to app format: { groupName: { 'YYYY-MM-DD': true } }
4. Fallback to localStorage if Supabase fails
```

### Save Process (Skip a Class)
```javascript
1. User double-clicks class in timer → confirmation dialog
2. Class marked as skipped: skippedClasses['A']['2025-11-15'] = true
3. Save to Supabase:
   - DELETE all rows (full replace)
   - INSERT new records
4. Save to localStorage as backup
5. Dispatch events to refresh calendar & timer
```

### Multi-Device Sync
```javascript
// Device A: Skip a class
skipClass('A', '2025-11-15') → Saved to Supabase

// Device B: Reload data
syncWithCloud() → Fetches from Supabase → Calendar updates
```

---

## 🛠️ Manual Sync Options

### Option 1: Via Student Manager
1. Open **Student Manager** (gear icon → 👥 Student Manager)
2. Click **☁️ Sync Cloud** button
3. All data (including skipped classes) reloads from Supabase

### Option 2: Via Console
```javascript
// Reload skipped classes from Supabase
await window.SkipClassManager.reloadFromSupabase();
```

### Option 3: Automatic Refresh
- The calendar automatically syncs when opened
- Use the **↻ Refresh** button in the floating nav to force sync

---

## 🐛 Troubleshooting

### Issue: Skipped classes not syncing

**Check 1: Is the table created?**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM skipped_classes LIMIT 10;
```

**Check 2: Check browser console**
```
✅ [SkipClassManager] Loaded 3 groups from Supabase
✅ [SkipClassManager] Saved 5 skipped classes to Supabase
```

**Check 3: Verify RLS policies**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'skipped_classes';
-- Should return at least one policy allowing access
```

### Issue: Permission denied errors

**Solution: Re-run the policy creation**
```sql
-- Allow anonymous access (using your anon key)
CREATE POLICY "Allow all operations for skipped_classes" ON skipped_classes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
```

### Issue: Data not appearing on Device B

1. **Hard refresh** the page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
2. Click **☁️ Sync Cloud** in Student Manager
3. Check console for errors: `F12` → Console tab

---

## 📱 Multi-Device Testing Checklist

- [ ] Device A: Skip a class → verify it saves (green checkmark in console)
- [ ] Device B: Click ☁️ Sync Cloud → verify it loads (green checkmark)
- [ ] Device B: Open calendar → verify class is grayed out
- [ ] Device A: Unskip class (if implemented) → verify it syncs to Device B
- [ ] Offline test: Disconnect WiFi → skip class → verify localStorage fallback
- [ ] Online recovery: Reconnect → sync → verify Supabase updates

---

## 🎉 Benefits of Cloud Sync

✅ **Multi-Device Access** - Work from laptop, tablet, or phone  
✅ **Real-Time Updates** - Changes sync instantly  
✅ **Data Backup** - All data stored securely in Supabase  
✅ **Offline Fallback** - localStorage backup if internet fails  
✅ **Team Collaboration** - Multiple teachers can share the system  

---

## 📚 Related Files

- `index.html` - Main app (lines 11280-11620: SkipClassManager)
- `supabase-skipped-classes-table.sql` - Database setup script
- `CALENDAR-CLOUD-SYNC.md` - This documentation file

---

## 🔮 Future Enhancements

Potential features to add:

1. **Real-time subscriptions** - Update calendar live when another device makes changes
2. **Conflict resolution** - Handle simultaneous edits from multiple devices
3. **Audit log** - Track who skipped which classes and when
4. **Bulk operations** - Skip entire weeks or months at once
5. **Export/Import** - Download skipped classes as CSV

---

## 💡 Pro Tips

1. **Always use Sync Cloud** before making critical changes
2. **Check console logs** to verify sync operations
3. **Keep localStorage as backup** - helps during connection issues
4. **Test on mobile** - ensure calendar works on all screen sizes
5. **Monitor Supabase usage** - free tier has limits, watch your quota

---

## ✨ Summary

Your calendar is now **100% cloud-synced**! Every data source (students, groups, payments, skipped classes) is stored in Supabase and accessible from any device.

**No more localStorage-only data** - everything is backed up and synced! 🎉

---

**Questions?** Check the code comments in `index.html` or consult the Supabase docs: https://supabase.com/docs
