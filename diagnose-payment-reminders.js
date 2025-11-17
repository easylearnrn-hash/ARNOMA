// ============================================================================
// DIAGNOSTIC: Payment Reminder Manager - Why Nov 16 reminders not sent
// ============================================================================

console.log('\n🔍 ════════════════════════════════════════════════════════════════');
console.log('🔍 PAYMENT REMINDER MANAGER DIAGNOSTIC');
console.log('🔍 ════════════════════════════════════════════════════════════════\n');

// Check if PaymentReminderManager exists
if (!window.PaymentReminderManager) {
  console.error('❌ PaymentReminderManager NOT FOUND on window object');
  console.log('   Solution: Make sure index.html has initialized');
} else {
  console.log('✅ PaymentReminderManager found');
}

// Check if calendar data available
if (!window.currentCalendarData) {
  console.error('❌ Calendar data NOT AVAILABLE');
  console.log('   Solution: Wait for calendar to load');
} else {
  console.log('✅ Calendar data available');
  console.log(`   Students: ${window.currentCalendarData.students.length}`);
}

// Get LA timezone date functions
function getLADate() {
  const now = new Date();
  const laStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  return new Date(laStr);
}

function formatDateYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const todayLA = getLADate();
const todayStr = formatDateYYYYMMDD(todayLA);

console.log('\n📅 DATE CHECK:');
console.log(`   Today (LA): ${todayStr}`);
console.log(`   Current LA time: ${todayLA.toLocaleString('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
})}`);

// Find all unpaid classes across all dates
console.log('\n🔴 UNPAID CLASSES SCAN:');
console.log('   Scanning ALL students for unpaid classes...\n');

let unpaidClasses = [];
let totalStudents = 0;
let studentsWithUnpaid = 0;

if (window.currentCalendarData && window.currentCalendarData.students) {
  totalStudents = window.currentCalendarData.students.length;
  
  for (const studentData of window.currentCalendarData.students) {
    const student = studentData.student;
    const unpaidForStudent = studentData.attendance.filter(a => a.status === 'unpaid');
    
    if (unpaidForStudent.length > 0) {
      studentsWithUnpaid++;
      
      unpaidForStudent.forEach(unpaidClass => {
        unpaidClasses.push({
          studentName: student.name,
          studentId: student.id,
          studentEmail: student.email,
          group: student.group,
          date: unpaidClass.date,
          balance: unpaidClass.balance || 0
        });
      });
    }
  }
  
  console.log(`   Total students: ${totalStudents}`);
  console.log(`   Students with unpaid classes: ${studentsWithUnpaid}`);
  console.log(`   Total unpaid classes: ${unpaidClasses.length}\n`);
  
  if (unpaidClasses.length > 0) {
    console.log('   📋 UNPAID CLASSES LIST:');
    console.log('   ' + '═'.repeat(80));
    
    // Group by date
    const byDate = {};
    unpaidClasses.forEach(u => {
      if (!byDate[u.date]) byDate[u.date] = [];
      byDate[u.date].push(u);
    });
    
    // Sort dates (oldest first)
    const sortedDates = Object.keys(byDate).sort();
    
    sortedDates.forEach(date => {
      const isToday = date === todayStr;
      const isPast = date < todayStr;
      const isFuture = date > todayStr;
      
      let dateLabel = date;
      if (isToday) dateLabel += ' (TODAY)';
      else if (isPast) dateLabel += ' (PAST)';
      else dateLabel += ' (FUTURE)';
      
      console.log(`\n   📅 ${dateLabel}`);
      
      byDate[date].forEach(u => {
        console.log(`      • ${u.studentName} (${u.group}) - $${u.balance}`);
        console.log(`        Email: ${u.studentEmail}`);
        console.log(`        ID: ${u.studentId}`);
        
        // Check pause status
        if (window.PaymentReminderManager && window.PaymentReminderManager.isPaused) {
          const paused = window.PaymentReminderManager.isPaused(u.studentId);
          console.log(`        Auto-reminders: ${paused ? '⏸️  PAUSED' : '▶ ACTIVE'}`);
        }
      });
    });
    
    console.log('\n   ' + '═'.repeat(80));
  } else {
    console.log('   ✅ No unpaid classes found');
  }
}

// THE CRITICAL ISSUE
console.log('\n🔴 CRITICAL ISSUE IDENTIFIED:');
console.log('   ' + '═'.repeat(80));
console.log('   ❌ PaymentReminderManager ONLY checks for unpaid classes on TODAY\'s date');
console.log('   ❌ It does NOT check past unpaid classes');
console.log('   ');
console.log('   CODE ISSUE (line 15362 in index.html):');
console.log('   const todayClass = studentData.attendance.find(a => a.date === todayStr);');
console.log('   ');
console.log('   This means:');
console.log('   • Nov 16 unpaid classes will NEVER get reminders (date is in past)');
console.log('   • Only classes unpaid on TODAY get reminders');
console.log('   • Past unpaid classes are ignored');
console.log('   ');
console.log('   SOLUTION:');
console.log('   Change the logic to check ALL past unpaid classes, not just today');
console.log('   ' + '═'.repeat(80));

// Test manual trigger
console.log('\n🧪 MANUAL TRIGGER TEST:');
console.log('   You can manually trigger the check with:');
console.log('   window.PaymentReminderManager.checkAndSendReminders()');
console.log('   ');
console.log('   But it will still only check TODAY\'s unpaid classes');

console.log('\n🔍 ════════════════════════════════════════════════════════════════');
console.log('🔍 END DIAGNOSTIC');
console.log('🔍 ════════════════════════════════════════════════════════════════\n');
