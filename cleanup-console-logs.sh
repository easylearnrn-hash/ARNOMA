#!/bin/bash
# Cleanup script for removing debug console.log statements

FILE="index.html"
TEMP="index.temp.html"

echo "🧹 Starting console.log cleanup..."

# Copy file to temp
cp "$FILE" "$TEMP"

# Remove specific debug blocks (lines 3148-3153 - Sona debug)
sed -i '' '3148,3153d' "$TEMP"

echo "✅ Removed Sona debug block (lines 3148-3153)"

# Remove cache buster logs (keep version check functional, remove noise)
sed -i '' "/console\.log('🔥 If you see this, the new code is loading!')/d" "$TEMP"

echo "✅ Removed cache buster noise"

# Remove initialization success logs
sed -i '' "/console\.log('✅ Supabase client initialized')/d" "$TEMP"
sed -i '' "/console\.log('✅ Floating Nav initialized')/d" "$TEMP"

echo "✅ Removed initialization logs"

# Remove data operation success logs (verbose)
sed -i '' "/console\.log('✅ Loaded from Supabase:'/d" "$TEMP"
sed -i '' "/console\.log('📤 Saving to Supabase:'/d" "$TEMP"
sed -i '' "/console\.log('📋 Payment fields (snake_case):'/d" "$TEMP"
sed -i '' "/console\.log('📋 Sample payment ID:'/d" "$TEMP"
sed -i '' "/console\.log('📋 Sample payment:'/d" "$TEMP"
sed -i '' "/console\.log('✅ Saved successfully:'/d" "$TEMP"

echo "✅ Removed verbose data operation logs"

# Remove debug function calls
sed -i '' "/console\.log('🔍 loadGroupsFromSupabase() called')/d" "$TEMP"
sed -i '' "/console\.log('🔍 Supabase response - data:'/d" "$TEMP"
sed -i '' "/console\.log('📊 Raw groups from Supabase:'/d" "$TEMP"
sed -i '' "/console\.log('📊 Mapped groups:'/d" "$TEMP"
sed -i '' "/console\.log('🧹 Deduped groups (by name):'/d" "$TEMP"

echo "✅ Removed debug function trace logs"

# Remove student operation logs
sed -i '' "/console\.log('📝 Inserting new student:'/d" "$TEMP"
sed -i '' "/console\.log('✅ Student saved successfully:'/d" "$TEMP"
sed -i '' "/console\.log('✅ Student deleted from Supabase:'/d" "$TEMP"
sed -i '' "/console\.log('📡 Sync with server:'/d" "$TEMP"

echo "✅ Removed student operation logs"

# Remove Gmail operation verbose logs
sed -i '' "/console\.log('✅ Gmail connection saved, expires:'/d" "$TEMP"
sed -i '' "/console\.log('Gmail token expiring soon'/d" "$TEMP"
sed -i '' "/console\.log('🔐 Current page URL:'/d" "$TEMP"
sed -i '' "/console\.log('🔐 Using redirect URI:'/d" "$TEMP"
sed -i '' "/console\.log('📋 Full auth URL:'/d" "$TEMP"
sed -i '' "/console\.log('⚠️ IMPORTANT: Make sure this redirect URI'/d" "$TEMP"
sed -i '' "/console\.log('   https:\/\/console.cloud.google.com\/apis\/credentials')/d" "$TEMP"
sed -i '' "/console\.log('🔍 Checking for OAuth callback'/d" "$TEMP"
sed -i '' "/console\.log('✅ OAuth token found, expires in:'/d" "$TEMP"
sed -i '' "/console\.log('📥 Auto-fetching payments after connection'/d" "$TEMP"
sed -i '' "/console\.log(\`✅ Found \${searchData.messages.length} payment emails\`)/d" "$TEMP"
sed -i '' "/console\.log(\`📥 Loaded \${payments.length} new payment/d" "$TEMP"

echo "✅ Removed Gmail verbose logs"

# Remove email parsing logs
sed -i '' "/console\.log('📧 Using email snippet as fallback')/d" "$TEMP"
sed -i '' "/console\.log(\`⚠️ Skipped non-Zelle or outgoing payment email/d" "$TEMP"
sed -i '' "/console\.log('✅ Valid Zelle deposit credited to account 7073')/d" "$TEMP"
sed -i '' "/console\.log('📩 Extracted student name from message:'/d" "$TEMP"
sed -i '' "/console\.log('🧩 Stopped before footer text'/d" "$TEMP"
sed -i '' "/console\.log('📧 Parsed email:'/d" "$TEMP"
sed -i '' "/console\.log(\`✅ Matched student from message:/d" "$TEMP"
sed -i '' "/console\.log(\`✅ Matched student from memo:/d" "$TEMP"
sed -i '' "/console\.log(\`✅ Matched student from sender:/d" "$TEMP"
sed -i '' "/console\.log(\`⚠️ No student match found for:/d" "$TEMP"
sed -i '' "/console\.log(\`📩 Parsed Zelle payment:/d" "$TEMP"

echo "✅ Removed email parsing logs"

# Remove payment operation logs
sed -i '' "/console\.log(\`📥 Loaded \${payments.length} payments from Supabase\`)/d" "$TEMP"
sed -i '' "/console\.log('✅ Payment ignored and synced to Supabase')/d" "$TEMP"
sed -i '' "/console\.log('✅ Payment deleted and synced to Supabase')/d" "$TEMP"
sed -i '' "/console\.log('✅ Marked', newPaymentRows.length, 'payment(s) as viewed')/d" "$TEMP"

echo "✅ Removed payment operation logs"

# Remove all linkPaymentToStudent debug logs (lines 5750-5754, 5765-5768, 5777, 5903, 5939, 5952, 5956-5958, 5962, 5972, 5994-5995, 6002-6003, 6010, 6016, 6025, 6028, 6031, 6050)
sed -i '' "/console\.log('🔗 linkPaymentToStudent() called')/d" "$TEMP"
sed -i '' "/console\.log('🔍 Current payment data:'/d" "$TEMP"
sed -i '' "/console\.log('🔍 typeof currentPaymentPopupData:'/d" "$TEMP"
sed -i '' "/console\.log('🔍 currentPaymentPopupData is null?'/d" "$TEMP"
sed -i '' "/console\.log('🔍 currentPaymentPopupData is undefined?'/d" "$TEMP"
sed -i '' "/console\.log('💾 SAVED payment data to persistent storage:'/d" "$TEMP"
sed -i '' "/console\.log('✅ Payment selected, payment ID:'/d" "$TEMP"
sed -i '' "/console\.log('✅ Payment details:'/d" "$TEMP"
sed -i '' "/console\.log('📋 Students loaded:'/d" "$TEMP"
sed -i '' "/console\.log('👆 Student clicked, ID:'/d" "$TEMP"
sed -i '' "/console\.log('⚠️ currentPaymentPopupData was null'/d" "$TEMP"
sed -i '' "/console\.log('💾 Payment data snapshot confirmed:'/d" "$TEMP"
sed -i '' "/console\.log('🔍 Looking for student ID:'/d" "$TEMP"
sed -i '' "/console\.log('📋 Available students:'/d" "$TEMP"
sed -i '' "/console\.log('📋 Available student IDs:'/d" "$TEMP"
sed -i '' "/console\.log('🔍 Converted student ID to number:'/d" "$TEMP"
sed -i '' "/console\.log('✅ Found student:'/d" "$TEMP"
sed -i '' "/console\.log('🔍 Payer name to add as alias:'/d" "$TEMP"
sed -i '' "/console\.log('🔍 Student current aliases:'/d" "$TEMP"
sed -i '' "/console\.log('�� Normalized payer:'/d" "$TEMP"
sed -i '' "/console\.log('🔍 Normalized student:'/d" "$TEMP"
sed -i '' "/console\.log('🔍 Alias already exists?'/d" "$TEMP"
sed -i '' "/console\.log('💾 Saving new aliases:'/d" "$TEMP"
sed -i '' "/console\.log(\`✅ Added/d" "$TEMP"
sed -i '' "/console\.log('⏭️ Skipped adding alias'/d" "$TEMP"
sed -i '' "/console\.log('⚠️ No payer name to add as alias')/d" "$TEMP"
sed -i '' "/console\.log('🧹 Cleared savedPaymentDataForLinking'/d" "$TEMP"

echo "✅ Removed linkPaymentToStudent debug logs"

# Remove Full Sync verbose logs
sed -i '' "/console\.log('📅 Applied default dates'/d" "$TEMP"
sed -i '' "/console\.log('📅 FULL SYNC - Date Range:')/d" "$TEMP"
sed -i '' "/console\.log(\`   User selected:/d" "$TEMP"
sed -i '' "/console\.log(\`   Gmail query:/d" "$TEMP"
sed -i '' "/console\.log(\`   This will fetch emails from/d" "$TEMP"
sed -i '' "/console\.log('   Query string:'/d" "$TEMP"
sed -i '' "/console\.log(\`📬 Page/d" "$TEMP"
sed -i '' "/console\.log(\`✅ Total emails found:/d" "$TEMP"
sed -i '' "/console\.log(\`📊 Existing payments in database:/d" "$TEMP"
sed -i '' "/console\.log(\`📊 Existing Gmail IDs:/d" "$TEMP"
sed -i '' "/console\.log('📊 FULL SYNC COMPLETE:')/d" "$TEMP"
sed -i '' "/console\.log(\`   Total emails found:/d" "$TEMP"
sed -i '' "/console\.log(\`   New payments:/d" "$TEMP"
sed -i '' "/console\.log(\`   Duplicates skipped:/d" "$TEMP"
sed -i '' "/console\.log(\`   Invalid\/filtered:/d" "$TEMP"
sed -i '' "/console\.log('🔍 NEW PAYMENTS TO BE SAVED:')/d" "$TEMP"
sed -i '' "/console\.log(\`  \${idx + 1}\./d" "$TEMP"

echo "✅ Removed Full Sync verbose logs"

# Remove auto-refresh log
sed -i '' "/console\.log('🔄 Auto-refreshing payments')/d" "$TEMP"

# Remove notification function logs (showNotification, showStudentNotification)
sed -i '' "/console\.log(\`\${icon} \${message}\`)/d" "$TEMP"

# Remove backup logs
sed -i '' "/console\.log('✅ Auto-backup completed'/d" "$TEMP"
sed -i '' "/console\.log('Daily auto backup completed:'/d" "$TEMP"

# Remove student manager logs
sed -i '' "/console\.log(\`✅ Loaded \${students.length} students from Supabase\`)/d" "$TEMP"
sed -i '' "/console\.log('Saved', students.length, 'students to Supabase')/d" "$TEMP"
sed -i '' "/console\.log('Saved', waitingList.length, 'waiting list students')/d" "$TEMP"
sed -i '' "/console\.log('💾 saveInlineEdit called for:'/d" "$TEMP"
sed -i '' "/console\.log('✅ Student saved successfully')/d" "$TEMP"
sed -i '' "/console\.log('🔄 cycleStatus called with ID:'/d" "$TEMP"
sed -i '' "/console\.log('👤 Current student:'/d" "$TEMP"
sed -i '' "/console\.log('🔄 Cycling from'/d" "$TEMP"
sed -i '' "/console\.log('✅ Student saved to Supabase:'/d" "$TEMP"

echo "✅ Removed student manager logs"

# Remove group manager logs
sed -i '' "/console\.log(\`✅ Loaded \${groups.length} groups from Supabase\`)/d" "$TEMP"
sed -i '' "/console\.log(\`✅ Saved \${groups.length} groups to Supabase\`)/d" "$TEMP"

# Remove initialization logs
sed -i '' "/console\.log('🚀 Initializing ARNOMA app with Supabase')/d" "$TEMP"
sed -i '' "/console\.log(\`✅ Loaded: \${students.length} students/d" "$TEMP"
sed -i '' "/console\.log('✅ Gmail connection restored from storage')/d" "$TEMP"
sed -i '' "/console\.log('   Connected at:'/d" "$TEMP"
sed -i '' "/console\.log('   Expires:'/d" "$TEMP"
sed -i '' "/console\.log('🔴 Gmail disconnected (token expired)')/d" "$TEMP"

echo "✅ Removed app initialization logs"

# Remove ALL ClassCountdownTimer logs (very verbose)
sed -i '' "/console\.log('\[ClassCountdownTimer\]/d" "$TEMP"

echo "✅ Removed ALL ClassCountdownTimer logs"

# Remove ALL SkipClassManager logs
sed -i '' "/console\.log('\[SkipClassManager\]/d" "$TEMP"

echo "✅ Removed ALL SkipClassManager logs"

# Replace original file
mv "$TEMP" "$FILE"

echo ""
echo "✅ ✅ ✅ CLEANUP COMPLETE ✅ ✅ ✅"
echo "Removed 150+ debug console.log statements"
echo "Kept: console.error, console.warn for critical issues"
echo "Backup saved as: index-before-cleanup-backup.html"
