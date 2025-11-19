/**
 * ============================================================================
 * EMAIL HANDLER TESTING SCRIPT
 * ============================================================================
 * Run this in browser console to test all 12 remaining email handlers
 *
 * USAGE:
 * 1. Open www.richyfesta.com
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: await testAllEmailHandlers()
 *
 * WHAT IT DOES:
 * - Tests each email handler by sending test emails
 * - Logs results to console
 * - Checks Supabase for email records
 * - Generates test report
 * ============================================================================
 */

// Test Configuration
const TEST_CONFIG = {
  testEmail: 'test@example.com', // Change to your test email
  testStudentId: null, // Will auto-select first active student
  delayBetweenTests: 2000, // 2 seconds between tests
};

// Test Results Storage
const testResults = {
  passed: [],
  failed: [],
  skipped: [],
};

/**
 * Utility: Wait for specified milliseconds
 */
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility: Get test student
 */
async function getTestStudent() {
  // Try both window.students and global students variable
  const studentsList = window.students || students;

  if (!studentsList || studentsList.length === 0) {
    throw new Error('No students available for testing');
  }

  // Find an active student
  const activeStudent = studentsList.find(s => s.status === 'active');
  return activeStudent || studentsList[0];
}

/**
 * Utility: Check if email was sent to Supabase
 */
async function checkEmailInSupabase(templateName, sinceTime) {
  try {
    const { data, error } = await supabase
      .from('sent_emails')
      .select('*')
      .eq('template_name', templateName)
      .gte('sent_at', sinceTime)
      .order('sent_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error checking Supabase:', error);
    return null;
  }
}

/**
 * Utility: Send email via iframe
 */
async function sendEmailViaIframe(action, data) {
  return new Promise((resolve, reject) => {
    const emailFrame = document.querySelector('iframe[src*="email-system-complete.html"]');

    if (!emailFrame) {
      reject(new Error('Email system iframe not found'));
      return;
    }

    const messageHandler = event => {
      if (event.data.action === 'emailSent' || event.data.action === 'emailError') {
        window.removeEventListener('message', messageHandler);
        if (event.data.action === 'emailSent') {
          resolve(event.data);
        } else {
          reject(new Error(event.data.error || 'Email send failed'));
        }
      }
    };

    window.addEventListener('message', messageHandler);

    // Timeout after 10 seconds
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      reject(new Error('Email send timeout'));
    }, 10000);

    emailFrame.contentWindow.postMessage({ action, ...data }, '*');
  });
}

/**
 * ============================================================================
 * TEST 1: Profile Update Email
 * ============================================================================
 */
async function testProfileUpdateEmail() {
  console.log('\n📧 Testing: sendProfileUpdateEmail');
  const startTime = new Date().toISOString();

  try {
    const studentData = await getTestStudent();

    const emailData = {
      student: {
        name: studentData.name,
        email: TEST_CONFIG.testEmail,
      },
      changes: 'Phone number updated to (123) 456-7890',
      emailType: 'current',
    };

    await sendEmailViaIframe('sendProfileUpdateEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Profile Update', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Profile Update Email');
      testResults.passed.push('sendProfileUpdateEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendProfileUpdateEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Profile Update Email -', error.message);
    testResults.failed.push(`sendProfileUpdateEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 2: Alias Added Email
 * ============================================================================
 */
async function testAliasAddedEmail() {
  console.log('\n📧 Testing: sendAliasAddedEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      mainStudentName: student.name,
      mainStudentEmail: TEST_CONFIG.testEmail,
      aliasName: 'Test Alias Student',
      templateName: 'Alias Added',
    };

    await sendEmailViaIframe('sendAliasAddedEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Alias Added', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Alias Added Email');
      testResults.passed.push('sendAliasAddedEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendAliasAddedEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Alias Added Email -', error.message);
    testResults.failed.push(`sendAliasAddedEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 3: Schedule Update Email
 * ============================================================================
 */
async function testScheduleUpdateEmail() {
  console.log('\n📧 Testing: sendScheduleUpdateEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      oldSchedule: 'Monday 6:00 PM',
      newSchedule: 'Tuesday 7:00 PM',
      groupName: student.group || 'Test Group',
      templateName: 'Schedule Update',
    };

    await sendEmailViaIframe('sendScheduleUpdateEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Schedule Update', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Schedule Update Email');
      testResults.passed.push('sendScheduleUpdateEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendScheduleUpdateEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Schedule Update Email -', error.message);
    testResults.failed.push(`sendScheduleUpdateEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 4: Group Enrollment Email
 * ============================================================================
 */
async function testGroupEnrollmentEmail() {
  console.log('\n📧 Testing: sendGroupEnrollmentEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      groupName: student.group || 'Test Group',
      schedule: 'Monday 6:00 PM',
      templateName: 'Group Enrollment',
    };

    await sendEmailViaIframe('sendGroupEnrollmentEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Group Enrollment', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Group Enrollment Email');
      testResults.passed.push('sendGroupEnrollmentEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendGroupEnrollmentEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Group Enrollment Email -', error.message);
    testResults.failed.push(`sendGroupEnrollmentEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 5: Credit Added Email
 * ============================================================================
 */
async function testCreditAddedEmail() {
  console.log('\n📧 Testing: sendCreditAddedEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      creditAmount: 50,
      reason: 'Testing credit addition',
      newBalance: 150,
      templateName: 'Credit Added',
    };

    await sendEmailViaIframe('sendCreditAddedEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Credit Added', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Credit Added Email');
      testResults.passed.push('sendCreditAddedEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendCreditAddedEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Credit Added Email -', error.message);
    testResults.failed.push(`sendCreditAddedEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 6: Credit Applied Email
 * ============================================================================
 */
async function testCreditAppliedEmail() {
  console.log('\n📧 Testing: sendCreditAppliedEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      creditAmount: 50,
      classDate: '2025-11-20',
      remainingBalance: 100,
      templateName: 'Credit Applied',
    };

    await sendEmailViaIframe('sendCreditAppliedEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Credit Applied', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Credit Applied Email');
      testResults.passed.push('sendCreditAppliedEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendCreditAppliedEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Credit Applied Email -', error.message);
    testResults.failed.push(`sendCreditAppliedEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 7: Credit Manual Edit Email
 * ============================================================================
 */
async function testCreditManualEditEmail() {
  console.log('\n📧 Testing: sendCreditManualEditEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      oldBalance: 100,
      newBalance: 150,
      reason: 'Manual adjustment for testing',
      templateName: 'Credit Balance Updated',
    };

    await sendEmailViaIframe('sendCreditManualEditEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Credit Balance Updated', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Credit Manual Edit Email');
      testResults.passed.push('sendCreditManualEditEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendCreditManualEditEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Credit Manual Edit Email -', error.message);
    testResults.failed.push(`sendCreditManualEditEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 8: Status Change to Paused Email
 * ============================================================================
 */
async function testStatusChangeToPausedEmail() {
  console.log('\n📧 Testing: sendStatusChangeToPausedEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      reason: 'Testing pause status',
      templateName: 'Status Changed to Paused',
    };

    await sendEmailViaIframe('sendStatusChangeToPausedEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Status Changed to Paused', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Status Change to Paused Email');
      testResults.passed.push('sendStatusChangeToPausedEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendStatusChangeToPausedEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Status Change to Paused Email -', error.message);
    testResults.failed.push(`sendStatusChangeToPausedEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 9: Status Change to Active Email
 * ============================================================================
 */
async function testStatusChangeToActiveEmail() {
  console.log('\n📧 Testing: sendStatusChangeToActiveEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      templateName: 'Status Changed to Active',
    };

    await sendEmailViaIframe('sendStatusChangeToActiveEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Status Changed to Active', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Status Change to Active Email');
      testResults.passed.push('sendStatusChangeToActiveEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendStatusChangeToActiveEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Status Change to Active Email -', error.message);
    testResults.failed.push(`sendStatusChangeToActiveEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 10: Status Change to Graduated Email
 * ============================================================================
 */
async function testStatusChangeToGraduatedEmail() {
  console.log('\n📧 Testing: sendStatusChangeToGraduatedEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      graduationDate: '2025-11-19',
      templateName: 'Status Changed to Graduated',
    };

    await sendEmailViaIframe('sendStatusChangeToGraduatedEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Status Changed to Graduated', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Status Change to Graduated Email');
      testResults.passed.push('sendStatusChangeToGraduatedEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendStatusChangeToGraduatedEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Status Change to Graduated Email -', error.message);
    testResults.failed.push(`sendStatusChangeToGraduatedEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 11: Absence Notification Email
 * ============================================================================
 */
async function testAbsenceNotificationEmail() {
  console.log('\n📧 Testing: sendAbsenceNotificationEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      classDate: '2025-11-19',
      reason: 'Testing absence notification',
      templateName: 'Absence Notification',
    };

    await sendEmailViaIframe('sendAbsenceNotificationEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Absence Notification', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Absence Notification Email');
      testResults.passed.push('sendAbsenceNotificationEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendAbsenceNotificationEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Absence Notification Email -', error.message);
    testResults.failed.push(`sendAbsenceNotificationEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * TEST 12: Schedule Change Email
 * ============================================================================
 */
async function testScheduleChangeEmail() {
  console.log('\n📧 Testing: sendScheduleChangeEmail');
  const startTime = new Date().toISOString();

  try {
    const student = await getTestStudent();

    const emailData = {
      studentName: student.name,
      studentEmail: TEST_CONFIG.testEmail,
      groupName: student.group || 'Test Group',
      oldSchedule: 'Monday 6:00 PM',
      newSchedule: 'Tuesday 7:00 PM',
      effectiveDate: '2025-11-20',
      templateName: 'Schedule Change',
    };

    await sendEmailViaIframe('sendScheduleChangeEmail', emailData);

    await wait(1000);
    const dbRecord = await checkEmailInSupabase('Schedule Change', startTime);

    if (dbRecord) {
      console.log('✅ PASS: Schedule Change Email');
      testResults.passed.push('sendScheduleChangeEmail');
      return true;
    } else {
      console.log('⚠️ Email sent but not found in database');
      testResults.failed.push('sendScheduleChangeEmail - DB check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ FAIL: Schedule Change Email -', error.message);
    testResults.failed.push(`sendScheduleChangeEmail - ${error.message}`);
    return false;
  }
}

/**
 * ============================================================================
 * MAIN TEST RUNNER
 * ============================================================================
 */
async function testAllEmailHandlers() {
  console.log('🚀 Starting Email Handler Testing...\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Reset results
  testResults.passed = [];
  testResults.failed = [];
  testResults.skipped = [];

  const tests = [
    { name: 'Profile Update', fn: testProfileUpdateEmail },
    { name: 'Alias Added', fn: testAliasAddedEmail },
    { name: 'Schedule Update', fn: testScheduleUpdateEmail },
    { name: 'Group Enrollment', fn: testGroupEnrollmentEmail },
    { name: 'Credit Added', fn: testCreditAddedEmail },
    { name: 'Credit Applied', fn: testCreditAppliedEmail },
    { name: 'Credit Manual Edit', fn: testCreditManualEditEmail },
    { name: 'Status to Paused', fn: testStatusChangeToPausedEmail },
    { name: 'Status to Active', fn: testStatusChangeToActiveEmail },
    { name: 'Status to Graduated', fn: testStatusChangeToGraduatedEmail },
    { name: 'Absence Notification', fn: testAbsenceNotificationEmail },
    { name: 'Schedule Change', fn: testScheduleChangeEmail },
  ];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n[${i + 1}/${tests.length}] Testing: ${test.name}`);

    try {
      await test.fn();
    } catch (error) {
      console.error(`❌ Test failed: ${test.name}`, error);
      testResults.failed.push(`${test.name} - ${error.message}`);
    }

    // Wait between tests
    if (i < tests.length - 1) {
      await wait(TEST_CONFIG.delayBetweenTests);
    }
  }

  // Print summary
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`✅ PASSED: ${testResults.passed.length}/12`);
  console.log(`❌ FAILED: ${testResults.failed.length}/12`);
  console.log(`⏭️  SKIPPED: ${testResults.skipped.length}/12\n`);

  if (testResults.passed.length > 0) {
    console.log('✅ Passed Tests:');
    testResults.passed.forEach(test => console.log(`   - ${test}`));
    console.log('');
  }

  if (testResults.failed.length > 0) {
    console.log('❌ Failed Tests:');
    testResults.failed.forEach(test => console.log(`   - ${test}`));
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════\n');

  return testResults;
}

// Export for console use
console.log('📧 Email Testing Script Loaded!');
console.log('');
console.log('USAGE:');
console.log('1. Set your test email: TEST_CONFIG.testEmail = "your@email.com"');
console.log('2. Run: await testAllEmailHandlers()');
console.log('');
console.log('To test individual handlers:');
console.log('  await testProfileUpdateEmail()');
console.log('  await testCreditAddedEmail()');
console.log('  etc...');
console.log('');
