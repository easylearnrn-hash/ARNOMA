// ============================================================================
// MANUAL TEST: Payment Reminder Manager
// ============================================================================
// Run this in the browser console to test payment reminders
//
// USAGE:
//   1. Open index.html in browser
//   2. Open browser console (F12 or Cmd+Option+I)
//   3. Copy and paste this entire script
//   4. Press Enter
//
// This will:
//   - Force a reminder check (bypasses "already checked today" limit)
//   - Show detailed logs of what's being checked
//   - Send reminders for all eligible unpaid classes (past and present)
// ============================================================================

console.log('\n🧪 ════════════════════════════════════════════════════════════════');
console.log('🧪 MANUAL TEST: Payment Reminder Manager');
console.log('🧪 ════════════════════════════════════════════════════════════════\n');

// Check if PaymentReminderManager exists
if (!window.PaymentReminderManager) {
  console.error('❌ PaymentReminderManager NOT FOUND');
  console.log('   Make sure index.html has finished loading');
} else {
  console.log('✅ PaymentReminderManager found');

  // Check if checkAndSendReminders function exists
  if (typeof window.PaymentReminderManager.checkAndSendReminders !== 'function') {
    console.error('❌ checkAndSendReminders function NOT FOUND');
  } else {
    console.log('✅ checkAndSendReminders function found');

    console.log('\n🔄 FORCING REMINDER CHECK...');
    console.log('   This will check ALL students for unpaid classes');
    console.log('   (past and present, as long as class has ended)');
    console.log('   Watch the console for detailed logs...\n');

    // Force check by calling the function directly
    // This bypasses the "already checked today" limit
    window.PaymentReminderManager.checkAndSendReminders()
      .then(() => {
        console.log('\n🧪 ════════════════════════════════════════════════════════════════');
        console.log('🧪 MANUAL TEST COMPLETE');
        console.log('🧪 ════════════════════════════════════════════════════════════════\n');
        console.log('Check the logs above to see:');
        console.log('  • How many students were checked');
        console.log('  • How many unpaid classes were found');
        console.log('  • How many reminders were sent');
        console.log('  • Any errors or issues\n');
      })
      .catch(error => {
        console.error('\n❌ ERROR during manual test:', error);
        console.error('Stack trace:', error.stack);
      });
  }
}
