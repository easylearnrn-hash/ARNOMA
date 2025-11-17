// ============================================================================
// IMMEDIATE DEBUG: Why no reminders for class 2 hours ago?
// ============================================================================

console.log('\n🚨 ════════════════════════════════════════════════════════════════');
console.log('🚨 IMMEDIATE DEBUG: Class 2 hours ago - no reminders sent');
console.log('🚨 ════════════════════════════════════════════════════════════════\n');

// Get LA timezone functions
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

const nowLA = getLADate();
const todayStr = formatDateYYYYMMDD(nowLA);

console.log('⏰ CURRENT TIME:');
console.log(`   LA Date: ${todayStr}`);
console.log(`   LA Time: ${nowLA.toLocaleString('en-US', {
  timeZone: 'America/Los_Angeles',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
})}`);

// Calculate 2 hours ago
const twoHoursAgo = new Date(nowLA.getTime() - (2 * 60 * 60 * 1000));
const twoHoursAgoStr = twoHoursAgo.toLocaleString('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

console.log(`   2 hours ago: ${twoHoursAgoStr}`);

// Check calendar data
console.log('\n📅 CALENDAR DATA CHECK:');
if (!window.currentCalendarData) {
  console.error('   ❌ window.currentCalendarData is NOT SET');
  console.log('   ');
  console.log('   WHY: Calendar might not have rendered yet');
  console.log('   FIX: Click on calendar to render it, then run this again');
  console.log('   OR: Wait a few seconds and try again');
} else {
  console.log('   ✅ window.currentCalendarData is available');
  console.log(`   Students: ${window.currentCalendarData.students?.length || 0}`);
  
  // Find classes from 2 hours ago (8:00 AM if current time is 10:00 AM)
  console.log('\n🔍 LOOKING FOR CLASSES AROUND 2 HOURS AGO:');
  console.log(`   Looking for classes around ${twoHoursAgoStr} today (${todayStr})`);
  
  let found = false;
  
  for (const studentData of window.currentCalendarData.students) {
    const student = studentData.student;
    
    // Find today's class
    const todayClass = studentData.attendance.find(a => a.date === todayStr);
    
    if (todayClass) {
      // Get group schedule to find class time
      const group = window.groupsData?.find(g => g.name === student.group);
      if (group && group.schedule) {
        // Parse schedule
        const scheduleMatch = group.schedule.match(/Mon\s+(\d+:\d+\s+(?:AM|PM))|Tue\s+(\d+:\d+\s+(?:AM|PM))|Wed\s+(\d+:\d+\s+(?:AM|PM))|Thu\s+(\d+:\d+\s+(?:AM|PM))|Fri\s+(\d+:\d+\s+(?:AM|PM))|Sat\s+(\d+:\d+\s+(?:AM|PM))|Sun\s+(\d+:\d+\s+(?:AM|PM))/gi);
        
        if (scheduleMatch) {
          const currentDay = nowLA.toLocaleString('en-US', { 
            timeZone: 'America/Los_Angeles', 
            weekday: 'short' 
          });
          
          // Check if this group has class today
          const todaySchedule = group.schedule.toLowerCase().includes(currentDay.toLowerCase());
          
          if (todaySchedule) {
            found = true;
            console.log(`\n   👤 ${student.name} (Group ${student.group})`);
            console.log(`      Class Status: ${todayClass.status}`);
            console.log(`      Balance: $${todayClass.balance || 0}`);
            console.log(`      Group Schedule: ${group.schedule}`);
            
            // Check pause status
            if (window.PaymentReminderManager && window.PaymentReminderManager.isPaused) {
              const paused = window.PaymentReminderManager.isPaused(student.id);
              console.log(`      Auto-reminders: ${paused ? '⏸️  PAUSED' : '▶ ACTIVE'}`);
            }
          }
        }
      }
    }
  }
  
  if (!found) {
    console.log('   ℹ️  No classes found for today around that time');
    console.log('   This might mean:');
    console.log('   1. No classes scheduled at that time today');
    console.log('   2. All students in that class are not active');
    console.log('   3. Calendar data is stale (click calendar to refresh)');
  }
}

// Check Payment Reminder Manager
console.log('\n🔧 PAYMENT REMINDER MANAGER CHECK:');
if (!window.PaymentReminderManager) {
  console.error('   ❌ PaymentReminderManager NOT FOUND');
} else {
  console.log('   ✅ PaymentReminderManager found');
  
  if (typeof window.PaymentReminderManager.checkAndSendReminders !== 'function') {
    console.error('   ❌ checkAndSendReminders function NOT FOUND');
  } else {
    console.log('   ✅ checkAndSendReminders function available');
    
    // Check if calendar is ready
    if (!window.currentCalendarData) {
      console.log('\n❌ CANNOT RUN CHECK - Calendar not initialized');
      console.log('   Solution:');
      console.log('   1. Click on the calendar in your app');
      console.log('   2. Wait 2 seconds');
      console.log('   3. Run this script again');
    } else {
      console.log('\n🔄 FORCING PAYMENT REMINDER CHECK NOW...');
      console.log('   This will check ALL past unpaid classes');
      console.log('   Watch for detailed logs below...\n');
      
      window.PaymentReminderManager.checkAndSendReminders()
        .then(() => {
          console.log('\n✅ Check complete - see logs above for results');
        })
        .catch(err => {
          console.error('\n❌ Error during check:', err);
        });
    }
  }
}

console.log('\n🚨 ════════════════════════════════════════════════════════════════');
console.log('🚨 END IMMEDIATE DEBUG');
console.log('🚨 ════════════════════════════════════════════════════════════════\n');
