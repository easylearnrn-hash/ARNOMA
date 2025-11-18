/**
 * DIAGNOSTIC: Check if students marked absent are getting unpaid emails
 * 
 * This will show which students are marked absent but have status='unpaid'
 */

(function() {
  console.log('\n🔍 ════════════════════════════════════════════════════════════════');
  console.log('   DIAGNOSTIC: Absent Students with Unpaid Status');
  console.log('   ════════════════════════════════════════════════════════════════\n');

  if (!window.currentCalendarData || !window.currentCalendarData.students) {
    console.log('❌ ERROR: Calendar not loaded. Click CALENDAR tab first.');
    console.log('\n   ════════════════════════════════════════════════════════════════\n');
    return;
  }

  const students = window.currentCalendarData.students;
  const today = new Date().toISOString().split('T')[0];
  
  console.log('📊 Checking', students.length, 'students...\n');
  
  let absentWithUnpaid = [];
  
  students.forEach(studentData => {
    const student = studentData.student;
    const attendance = studentData.attendance;
    
    // Check each attendance record
    attendance.forEach(a => {
      // Only check past/present classes
      if (a.date > today) return;
      
      // Check if marked absent in AbsentManager
      const isMarkedAbsent = window.AbsentManager && 
                            window.AbsentManager.isAbsent(student.id, a.date);
      
      // If marked absent but status is unpaid, that's a bug
      if (isMarkedAbsent && a.status === 'unpaid') {
        absentWithUnpaid.push({
          student: student.name,
          date: a.date,
          status: a.status,
          balance: a.balance
        });
      }
      
      // Also check opposite: status='absent' but not in AbsentManager
      if (a.status === 'absent' && !isMarkedAbsent) {
        console.log(`⚠️  ${student.name} - ${a.date}: status='absent' but NOT in AbsentManager`);
      }
    });
  });
  
  if (absentWithUnpaid.length > 0) {
    console.log('🚨 BUG FOUND! Students marked ABSENT but have status=UNPAID:');
    console.log('   ' + '═'.repeat(80));
    
    absentWithUnpaid.forEach(item => {
      console.log(`\n   Student: ${item.student}`);
      console.log(`   Date: ${item.date}`);
      console.log(`   Status: ${item.status} (should be 'absent')`);
      console.log(`   Balance: $${item.balance}`);
    });
    
    console.log('\n   ' + '═'.repeat(80));
    console.log(`\n   TOTAL: ${absentWithUnpaid.length} classes with incorrect status`);
    console.log('\n   ⚠️  THIS IS WHY ABSENT STUDENTS ARE GETTING PAYMENT EMAILS!');
    console.log('   The attendance status is not matching the AbsentManager records.');
  } else {
    console.log('✅ No issues found. All absent students have correct status.');
    console.log('\n   If absent students are still getting emails, the problem is elsewhere.');
    console.log('   Possible causes:');
    console.log('   1. Student was marked absent AFTER email was sent');
    console.log('   2. AbsentManager data not loaded when calendar was rendered');
    console.log('   3. Calendar needs to be refreshed after marking absent');
  }
  
  console.log('\n🔍 ════════════════════════════════════════════════════════════════');
  console.log('   END DIAGNOSTIC');
  console.log('   ════════════════════════════════════════════════════════════════\n');
})();
