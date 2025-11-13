# 🎯 Setup: Absent Students & Credit Payments Cloud Sync

## What's New?

Your calendar now syncs **100% of all data** across devices! 🎉

Previously synced:
- ✅ Students & Groups
- ✅ Payments
- ✅ Skipped Classes

**NEW** - Now also synced:
- ✅ **Absent Students** (gray dots)
- ✅ **Credit-Applied Payments** (blue dots)

## Quick Setup (3 minutes)

### Step 1: Run SQL Script in Supabase

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `zlvnxvrzotamhpezqedr`
3. Go to **SQL Editor** → Click **New Query**
4. Copy the entire contents of `supabase-absences-credits-tables.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd+Enter)

You should see:
```
Success. No rows returned
```

### Step 2: Verify Tables Created

In Supabase Dashboard:
1. Go to **Table Editor** (left sidebar)
2. You should see 2 new tables:
   - `student_absences` - Tracks absent students
   - `credit_payments` - Tracks credit-applied payments

### Step 3: Test Multi-Device Sync

**Device A (your main device):**
1. Open your calendar
2. Click on any class date
3. Mark a student as **⚪ Absent**
4. Or apply credit to a class (will show blue dot)

**Device B (another device/browser):**
1. Open your calendar in private/incognito window or another device
2. Click **☁️ Sync Cloud** button at the top
3. You should now see:
   - Gray dots for absent students
   - Blue dots for credit-applied payments

## How It Works

### Absent Students (Gray Dots)
- **AbsentManager** automatically syncs to Supabase
- When you mark a student absent → saves to `student_absences` table
- Other devices load from same table → see gray dots

### Credit Payments (Blue Dots)
- **CreditPaymentManager** automatically syncs to Supabase
- When you apply credit to a class → saves to `credit_payments` table
- Other devices load from same table → see blue dots

### Offline Support
- Both managers have **localStorage fallback**
- If Supabase is unreachable → saves locally
- Next time online → syncs automatically

## Sync Button Behavior

The **☁️ Sync Cloud** button now:
1. Saves all students to Supabase
2. Reloads skipped classes
3. **NEW:** Reloads absent students
4. **NEW:** Reloads credit payments
5. Refreshes calendar with latest data

## Troubleshooting

### Gray dots not showing on other device?
1. Make sure you ran the SQL script (Step 1)
2. Check `student_absences` table has data
3. Click **☁️ Sync Cloud** on the other device
4. Check browser console for errors (F12)

### Blue dots not showing on other device?
1. Make sure you ran the SQL script (Step 1)
2. Check `credit_payments` table has data
3. Click **☁️ Sync Cloud** on the other device
4. Check browser console for errors (F12)

### "Error loading absences/credit payments"
- Check Supabase is online
- Verify RLS policies are enabled (they should be)
- Check browser console for detailed error

## Database Schema

### student_absences
```sql
- id: bigserial (primary key)
- student_id: integer (links to student)
- class_date: date (the date student was absent)
- marked_at: timestamptz (when they were marked absent)
- created_at: timestamptz (record creation time)
```

### credit_payments
```sql
- id: bigserial (primary key)
- student_id: integer (links to student)
- class_date: date (the date credit was applied)
- amount: decimal(10,2) (amount deducted from credit)
- balance_after: decimal(10,2) (remaining balance)
- applied_at: timestamptz (when credit was applied)
- created_at: timestamptz (record creation time)
```

## Migration from localStorage

If you have existing absent marks or credit payments in localStorage:

1. They're automatically migrated when managers initialize
2. First load reads from localStorage
3. Then saves to Supabase
4. Future loads come from Supabase

No manual migration needed! 🎉

## What's Synced - Complete List

| Data Type | Synced? | Table/Manager |
|-----------|---------|---------------|
| Students | ✅ | `students` |
| Groups | ✅ | `groups` |
| Payments | ✅ | `payments` |
| Skipped Classes | ✅ | `skipped_classes` / SkipClassManager |
| Absent Students | ✅ | `student_absences` / AbsentManager |
| Credit Payments | ✅ | `credit_payments` / CreditPaymentManager |

**Everything is now cloud-synced!** 🚀

## Need Help?

Check the browser console (F12) for detailed logs:
- `☁️` = Loading from Supabase
- `✅` = Success
- `❌` = Error
- `📦` = Fallback to localStorage
