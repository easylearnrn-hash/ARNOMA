# 🚨 URGENT: Database Migration Required

## Error in Console
```
[SkipClassManager] ❌ Error saving to Supabase: {code: "PGRST204", details: null, hint: null, message: "Could not find the 'skip_type' column of 'skipped_classes' in the schema cache"}
```

## Fix Required
You need to run the migration SQL file to add the missing `skip_type` column.

## Steps to Fix

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `arnoma-db` 

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration**
   - Open the file: `MIGRATION-CLASS-CANCELLATION-SUPPORT.sql`
   - Copy the ENTIRE contents
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify**
   - Go to "Table Editor" in left sidebar
   - Click on `skipped_classes` table
   - Verify these columns exist:
     - ✅ `skip_type` (text)
     - ✅ `note` (text)

## What This Migration Does
- Adds `skip_type` column to differentiate between student skips and class cancellations
- Adds `note` column for optional cancellation reasons
- Adds columns to `credit_payments` for payment forwarding
- Creates indexes for better performance
- Migrates existing data safely

## After Running Migration
- Refresh your ARNOMA app (hard refresh: Cmd+Shift+R)
- The "Cancel Class" feature will work correctly
- No more database errors in console

---
**This is required for the cancel class feature to work!**
