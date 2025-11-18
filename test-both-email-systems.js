// ============================================================================
// COMPREHENSIVE TEST: Email Automations + Payment Reminders
// ============================================================================
// This script tests BOTH email systems to verify they're working
// ============================================================================

console.log('\n🧪 ════════════════════════════════════════════════════════════════');
console.log('🧪 COMPREHENSIVE SYSTEM TEST');
console.log('🧪 Testing: Email Automations + Payment Reminders');
console.log('🧪 ════════════════════════════════════════════════════════════════\n');

// Helper functions
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
const currentTime = nowLA.toLocaleString('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

console.log('⏰ CURRENT TIME (LA Timezone):');
console.log(`   Date: ${todayStr}`);
console.log(`   Time: ${currentTime}`);
console.log(
  `   Day: ${nowLA.toLocaleString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'long' })}\n`
);

// ============================================================================
// TEST 1: Email Automation System (Before-Class Reminders)
// ============================================================================

console.log('📧 TEST 1: EMAIL AUTOMATION SYSTEM (Before-Class Reminders)');
console.log('   ' + '─'.repeat(76));

// Check if iframe exists
const emailIframe = document.querySelector('iframe[src*="email-system-complete.html"]');
if (!emailIframe) {
  console.error('   ❌ Email system iframe NOT FOUND');
  console.log('      Expected: <iframe src="email-system-complete.html">');
} else {
  console.log('   ✅ Email system iframe found');
}

// Check localStorage for automations
const automations = JSON.parse(localStorage.getItem('arnoma-automations-v3') || '[]');
console.log(`   ✅ Found ${automations.length} automations in localStorage`);

if (automations.length > 0) {
  console.log('\n   📋 AUTOMATION DETAILS:');
  automations.forEach((auto, i) => {
    const groups = auto.groups || auto.selectedGroups || [];
    console.log(`      ${i + 1}. ${auto.name}`);
    console.log(`         Status: ${auto.status === 'active' ? '✅ Active' : '⏸️  Inactive'}`);
    console.log(`         Groups: ${groups.length > 0 ? groups.join(', ') : '❌ NONE'}`);
    console.log(`         Trigger: ${auto.beforeClassTime} minutes before class`);
  });

  // Check for missing groups
  const missingGroups = automations.filter(a => {
    const groups = a.groups || a.selectedGroups || [];
    return groups.length === 0;
  });

  if (missingGroups.length > 0) {
    console.log('\n   ⚠️  WARNING: Found automations with NO groups selected:');
    missingGroups.forEach(a => {
      console.log(`      • ${a.name}`);
    });
    console.log('      These automations will NOT send any emails!');
  }
}

console.log('\n   📊 SYSTEM STATUS:');
console.log(`      Checking for classes in 30-minute trigger window...`);

// Find upcoming classes
if (window.groupsData) {
  console.log(`      Available groups: ${window.groupsData.length}`);

  let upcomingClasses = [];
  const currentMinutes = nowLA.getHours() * 60 + nowLA.getMinutes();
  const currentDay = nowLA.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
  });

  window.groupsData.forEach(group => {
    if (group.schedule && group.schedule.includes(currentDay)) {
      // Parse time from schedule
      const timeMatch = group.schedule.match(
        new RegExp(currentDay + '\\s+(\\d+:\\d+\\s+(?:AM|PM))', 'i')
      );
      if (timeMatch) {
        const classTime = timeMatch[1];
        // Calculate minutes until class
        const timeParts = classTime.match(/(\d+):(\d+)\s+(AM|PM)/);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const mins = parseInt(timeParts[2]);
          const period = timeParts[3];

          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          const classMinutes = hours * 60 + mins;
          const minutesUntil = classMinutes - currentMinutes;

          upcomingClasses.push({
            group: group.name,
            time: classTime,
            minutesUntil: minutesUntil,
          });
        }
      }
    }
  });

  if (upcomingClasses.length > 0) {
    console.log(`\n      📅 UPCOMING CLASSES TODAY:`);
    upcomingClasses.sort((a, b) => a.minutesUntil - b.minutesUntil);
    upcomingClasses.forEach(c => {
      const inWindow = Math.abs(c.minutesUntil - 30) <= 2;
      console.log(
        `         Group ${c.group}: ${c.time} (${c.minutesUntil} min) ${inWindow ? '🔥 IN TRIGGER WINDOW!' : ''}`
      );
    });
  } else {
    console.log(`      No more classes today (${currentDay})`);
  }
} else {
  console.error('      ❌ window.groupsData not available');
}

// ============================================================================
// TEST 2: Payment Reminder Manager (After-Class Reminders)
// ============================================================================

console.log('\n\n💰 TEST 2: PAYMENT REMINDER MANAGER (After-Class Reminders)');
console.log('   ' + '─'.repeat(76));

if (!window.PaymentReminderManager) {
  console.error('   ❌ PaymentReminderManager NOT FOUND');
} else {
  console.log('   ✅ PaymentReminderManager found');

  if (!window.currentCalendarData) {
    console.error('   ❌ Calendar data NOT initialized');
    console.log('      This means Payment Reminder Manager CANNOT run');
    console.log('      Solution: Reload the page (fix applied to render calendar on load)');
  } else {
    console.log('   ✅ Calendar data initialized');
    console.log(`      Students: ${window.currentCalendarData.students?.length || 0}`);

    // Scan for unpaid classes
    console.log('\n   🔍 SCANNING FOR UNPAID CLASSES...\n');

    let totalUnpaid = 0;
    let unpaidToday = 0;
    let unpaidPast = 0;
    let unpaidFuture = 0;

    const unpaidClasses = [];

    for (const studentData of window.currentCalendarData.students) {
      const student = studentData.student;

      for (const attendance of studentData.attendance) {
        if (attendance.status === 'unpaid') {
          totalUnpaid++;

          const classDate = attendance.date;
          const isPast = classDate < todayStr;
          const isToday = classDate === todayStr;
          const isFuture = classDate > todayStr;

          if (isToday) unpaidToday++;
          else if (isPast) unpaidPast++;
          else unpaidFuture++;

          unpaidClasses.push({
            student: student.name,
            studentId: student.id,
            group: student.group,
            date: classDate,
            balance: attendance.balance || 0,
            isPast,
            isToday,
            isFuture,
          });
        }
      }
    }

    console.log(`   📊 UNPAID CLASSES SUMMARY:`);
    console.log(`      Total unpaid: ${totalUnpaid}`);
    console.log(`      Past (overdue): ${unpaidPast} 🔴`);
    console.log(`      Today: ${unpaidToday}`);
    console.log(`      Future: ${unpaidFuture}\n`);

    if (unpaidPast > 0) {
      console.log(`   🔴 OVERDUE UNPAID CLASSES (${unpaidPast}):`);
      console.log('      These should have received payment reminders!\n');

      const pastUnpaid = unpaidClasses.filter(c => c.isPast).slice(0, 10); // Show max 10
      pastUnpaid.forEach(c => {
        console.log(`      📅 ${c.date} - ${c.student} (Group ${c.group})`);
        console.log(`         Balance: $${c.balance}`);

        // Check pause status
        if (window.PaymentReminderManager.isPaused) {
          const paused = window.PaymentReminderManager.isPaused(c.studentId);
          console.log(`         Auto-reminders: ${paused ? '⏸️  PAUSED' : '▶ ACTIVE'}`);
        }
      });

      if (unpaidPast > 10) {
        console.log(`      ... and ${unpaidPast - 10} more`);
      }
    }

    if (unpaidToday > 0) {
      console.log(`\n   📅 UNPAID CLASSES TODAY (${unpaidToday}):`);
      const todayUnpaid = unpaidClasses.filter(c => c.isToday).slice(0, 5);
      todayUnpaid.forEach(c => {
        console.log(`      • ${c.student} (Group ${c.group}) - $${c.balance}`);
      });
    }

    // Test manual trigger
    console.log('\n   🧪 MANUAL TRIGGER TEST:');
    console.log('      Running checkAndSendReminders() now...\n');

    window.PaymentReminderManager.checkAndSendReminders()
      .then(() => {
        console.log('\n   ✅ Payment reminder check complete');
        console.log('      Check logs above for detailed results');
      })
      .catch(err => {
        console.error('\n   ❌ Error during payment reminder check:', err);
      });
  }
}

console.log('\n🧪 ════════════════════════════════════════════════════════════════');
console.log('🧪 END COMPREHENSIVE TEST');
console.log('🧪 ════════════════════════════════════════════════════════════════\n');
