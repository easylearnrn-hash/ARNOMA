/**
 * DIAGNOSTIC SCRIPT: Check Mariam Gevorgyan Payment Status
 * 
 * Paste this script into browser console to see exactly why
 * Mariam received an unpaid payment reminder.
 * 
 * This will show:
 * 1. All her class dates
 * 2. Payment status for each date
 * 3. All payments linked to her
 * 4. Why each class is marked paid/unpaid
 */

console.log('\n🔍 ════════════════════════════════════════════════════════════════');
console.log('   DIAGNOSTIC: Mariam Gevorgyan Payment Status Check');
console.log('   ════════════════════════════════════════════════════════════════\n');

// Find Mariam in calendar data
let mariam = null;
let mariamData = null;

if (window.currentCalendarData && window.currentCalendarData.students) {
  for (const studentData of window.currentCalendarData.students) {
    const student = studentData.student;
    if (student.name.toLowerCase().includes('mariam') && student.name.toLowerCase().includes('gevorgyan')) {
      mariam = student;
      mariamData = studentData;
      break;
    }
  }
}

if (!mariam) {
  console.log('❌ ERROR: Could not find Mariam Gevorgyan in calendar data');
  console.log('   Make sure calendar is loaded (click calendar tab)');
  console.log('\n   ════════════════════════════════════════════════════════════════\n');
} else {
console.log('   ID: ' + mariam.id);
console.log('   Group: ' + mariam.group);
console.log('   Balance: $' + (mariam.balance || 0).toFixed(2));
console.log('   Status: ' + (mariam.status || 'active'));
console.log('   Created: ' + (mariam.created_at || 'unknown'));
console.log('   Email: ' + (mariam.email || 'not set'));

// Get all payments
const allPayments = window.paymentsCache || [];
console.log('\n📊 TOTAL PAYMENTS IN SYSTEM: ' + allPayments.length);

// Find payments for Mariam
const mariamPayments = allPayments.filter(p => {
  if (p.ignored) return false;
  
  const paymentStudentName = (p.studentName || '').toLowerCase().trim();
  const paymentPayerName = (p.payerName || '').toLowerCase().trim();
  const paymentPayerNameRaw = (p.payerNameRaw || '').toLowerCase().trim();
  const mariamNameLower = (mariam.name || '').toLowerCase().trim();
  
  // Check if matches Mariam
  if (paymentStudentName === mariamNameLower) return true;
  if (paymentPayerName === mariamNameLower) return true;
  if (paymentPayerNameRaw === mariamNameLower) return true;
  
  // Check aliases
  if (mariam.aliases && Array.isArray(mariam.aliases)) {
    return mariam.aliases.some(alias => {
      const aliasLower = alias.toLowerCase().trim();
      return (
        aliasLower === paymentStudentName ||
        aliasLower === paymentPayerName ||
        aliasLower === paymentPayerNameRaw
      );
    });
  }
  
  return false;
});

console.log('\n💰 PAYMENTS FOUND FOR MARIAM: ' + mariamPayments.length);

if (mariamPayments.length > 0) {
  console.log('\n   Payment Details:');
  console.log('   ' + '═'.repeat(80));
  
  mariamPayments.forEach((p, i) => {
    const paymentTimestamp = p.emailDate || p.date || p.timestamp;
    const paymentDate = new Date(paymentTimestamp);
    const paymentDateStr = paymentDate.toISOString().split('T')[0];
    
    console.log(`\n   Payment ${i + 1}:`);
    console.log(`   Date: ${paymentDateStr}`);
    console.log(`   Amount: $${(p.amount || 0).toFixed(2)}`);
    console.log(`   From: ${p.payerNameRaw || p.payerName || 'unknown'}`);
    console.log(`   Student Name: ${p.studentName || 'not set'}`);
    console.log(`   Status: ${p.status || 'active'}`);
    console.log(`   Ignored: ${p.ignored || false}`);
  });
  
  console.log('\n   ' + '═'.repeat(80));
}

// Show attendance records
console.log('\n📅 CLASS ATTENDANCE RECORDS: ' + mariamData.attendance.length);
console.log('\n   ' + '═'.repeat(80));

const today = new Date().toISOString().split('T')[0];

// Sort by date
const sortedAttendance = [...mariamData.attendance].sort((a, b) => a.date.localeCompare(b.date));

sortedAttendance.forEach(a => {
  const isPast = a.date < today;
  const isToday = a.date === today;
  const isFuture = a.date > today;
  
  let dateLabel = a.date;
  if (isToday) dateLabel += ' (TODAY)';
  else if (isPast) dateLabel += ' (PAST)';
  else dateLabel += ' (FUTURE)';
  
  let statusEmoji = '';
  if (a.status === 'paid') statusEmoji = '✅';
  else if (a.status === 'unpaid') statusEmoji = '❌';
  else if (a.status === 'absent') statusEmoji = '🚫';
  else if (a.status === 'skipped') statusEmoji = '⏭️';
  else if (a.status === 'pending') statusEmoji = '⏳';
  else if (a.status === 'deducted') statusEmoji = '🎫';
  
  console.log(`\n   ${statusEmoji} ${dateLabel}`);
  console.log(`      Status: ${a.status}`);
  console.log(`      Balance: $${(a.balance || 0).toFixed(2)}`);
  console.log(`      Message: ${a.message || 'none'}`);
  
  // Check if payment exists for this date
  const paymentOnDate = mariamPayments.find(p => {
    const paymentTimestamp = p.emailDate || p.date || p.timestamp;
    const paymentDate = new Date(paymentTimestamp);
    const paymentDateStr = paymentDate.toISOString().split('T')[0];
    
    // Exact match
    if (paymentDateStr === a.date) return true;
    
    // For past classes: check if payment is within 7 days after
    if (a.date < today) {
      const classDate = new Date(a.date);
      const payDate = new Date(paymentDateStr);
      const daysDiff = Math.floor((payDate - classDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0 && daysDiff <= 7) return true;
    }
    
    return false;
  });
  
  if (paymentOnDate) {
    console.log(`      ✅ PAYMENT FOUND: $${(paymentOnDate.amount || 0).toFixed(2)} on ${new Date(paymentOnDate.emailDate || paymentOnDate.date).toISOString().split('T')[0]}`);
  } else {
    console.log(`      ❌ NO PAYMENT FOUND`);
  }
});

console.log('\n   ' + '═'.repeat(80));

// Check if auto-reminders are paused for Mariam
if (window.PaymentReminderManager && window.PaymentReminderManager.isPaused) {
  const isPaused = window.PaymentReminderManager.isPaused(mariam.id);
  console.log('\n⏸️  AUTO-REMINDER STATUS: ' + (isPaused ? 'PAUSED' : 'ACTIVE'));
  if (isPaused) {
    console.log('   (Auto-reminders are disabled for this student)');
  }
}

// Count unpaid classes
const unpaidClasses = mariamData.attendance.filter(a => a.status === 'unpaid' && a.date <= today);
console.log('\n🔴 UNPAID CLASSES (past & present): ' + unpaidClasses.length);

if (unpaidClasses.length > 0) {
  console.log('\n   WHY EMAIL WAS SENT:');
  console.log('   ' + '─'.repeat(80));
  console.log('   The system detected ' + unpaidClasses.length + ' unpaid class(es) and sent a reminder.');
  console.log('   Dates: ' + unpaidClasses.map(c => c.date).join(', '));
  console.log('\n   POSSIBLE REASONS:');
  console.log('   1. ❌ No payment recorded for these dates');
  console.log('   2. ❌ Payment made but not linked to student name');
  console.log('   3. ❌ Payment made but date mismatch');
  console.log('   4. ❌ Payment recorded but ignored flag is set');
  console.log('   5. ❌ Name mismatch (payment under different name)');
  console.log('\n   SOLUTION:');
  console.log('   • Check if payment exists in Payments tab');
  console.log('   • Verify student name matches payment name');
  console.log('   • Check payment date matches class date (or within 7 days after)');
  console.log('   • Manually link payment if needed');
} else {
  console.log('\n✅ NO UNPAID CLASSES FOUND');
  console.log('   If Mariam received an email, it may have been sent before payment was recorded.');
  console.log('   Or it may have been a manual reminder sent by mistake.');
}

console.log('\n🔍 ════════════════════════════════════════════════════════════════');
console.log('   END DIAGNOSTIC');
console.log('   ════════════════════════════════════════════════════════════════\n');
}
