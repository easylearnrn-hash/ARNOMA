// ═══════════════════════════════════════════════════════════════════════════
// ARNOMA EMAIL AUTOMATION SYSTEM - COMPREHENSIVE DIAGNOSTIC TEST
// ═══════════════════════════════════════════════════════════════════════════
// Run this script in the browser console on https://www.richyfesta.com
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n\n');
console.log('═'.repeat(80));
console.log('🔬 ARNOMA EMAIL AUTOMATION SYSTEM - FULL DIAGNOSTIC TEST');
console.log('═'.repeat(80));

const results = {
  tests: [],
  passed: 0,
  failed: 0,
  warnings: 0
};

function test(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      console.log(`✅ PASS: ${name}`);
      results.tests.push({ name, status: 'PASS' });
      results.passed++;
    } else if (result === 'WARN') {
      console.warn(`⚠️  WARN: ${name}`);
      results.tests.push({ name, status: 'WARN' });
      results.warnings++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      results.tests.push({ name, status: 'FAIL', error: result });
      results.failed++;
    }
  } catch (error) {
    console.error(`❌ FAIL: ${name} - ${error.message}`);
    results.tests.push({ name, status: 'FAIL', error: error.message });
    results.failed++;
  }
}

console.log('\n📋 TEST CATEGORY 1: IFRAME INITIALIZATION');
console.log('─'.repeat(80));

test('Hidden email iframe exists', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found in DOM';
  console.log('   📍 Iframe found:', iframe.id || 'no-id');
  console.log('   📍 Iframe src:', iframe.src);
  return true;
});

test('Iframe is loaded', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  if (!iframe.contentWindow) return 'Iframe contentWindow not accessible';
  console.log('   📍 Content window accessible:', !!iframe.contentWindow);
  return true;
});

test('Iframe is properly hidden', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  const style = iframe.style;
  if (style.width !== '1px' || style.height !== '1px') return 'WARN';
  console.log('   📍 Iframe dimensions: 1px x 1px (hidden)');
  return true;
});

console.log('\n📋 TEST CATEGORY 2: DATA INJECTION');
console.log('─'.repeat(80));

test('Parent has groups data', () => {
  const groups = window.groupsCache || window.globalData?.groups || [];
  console.log(`   📊 Groups count: ${groups.length}`);
  if (groups.length === 0) return 'No groups found in parent window';
  console.log(`   📊 Sample groups:`, groups.slice(0, 2).map(g => g.name));
  return true;
});

test('Parent has students data', () => {
  const students = window.studentsCache || window.globalData?.students || [];
  console.log(`   👥 Students count: ${students.length}`);
  if (students.length === 0) return 'No students found in parent window';
  console.log(`   👥 Sample students:`, students.slice(0, 2).map(s => s.name));
  return true;
});

test('sendGroupsDataToEmailSystem function exists', () => {
  if (typeof window.sendGroupsDataToEmailSystem !== 'function') {
    return 'sendGroupsDataToEmailSystem function not found';
  }
  console.log('   ✓ Function defined');
  return true;
});

console.log('\n📋 TEST CATEGORY 3: POSTMESSAGE COMMUNICATION');
console.log('─'.repeat(80));

test('Can send data to iframe via postMessage', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  
  try {
    const groups = window.groupsCache || [];
    const students = window.studentsCache || [];
    
    iframe.contentWindow.postMessage({
      action: 'updateGroupsData',
      groups: groups,
      students: students
    }, '*');
    
    console.log(`   📤 Sent: ${groups.length} groups, ${students.length} students`);
    return true;
  } catch (error) {
    return `PostMessage failed: ${error.message}`;
  }
});

test('Iframe dataReceived flag (check after 2 seconds)', async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
      if (!iframe || !iframe.contentWindow) {
        console.error('   ❌ Cannot access iframe');
        resolve('Cannot access iframe');
        return;
      }
      
      try {
        const dataReceived = iframe.contentWindow.dataReceived;
        console.log(`   📊 dataReceived flag: ${dataReceived}`);
        
        if (dataReceived === true) {
          console.log('   ✅ Data successfully received by iframe');
          resolve(true);
        } else {
          console.error('   ❌ Data not received by iframe (flag still false)');
          resolve('Data not received by iframe');
        }
      } catch (error) {
        console.error(`   ❌ Error checking dataReceived: ${error.message}`);
        resolve(`Error: ${error.message}`);
      }
    }, 2000);
  });
});

console.log('\n📋 TEST CATEGORY 4: AUTOMATION ENGINE STATUS');
console.log('─'.repeat(80));

test('Automation system exists in iframe', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  
  try {
    const automationSystem = iframe.contentWindow.automationSystem;
    if (!automationSystem) return 'automationSystem not found in iframe';
    console.log('   ✓ automationSystem object exists');
    return true;
  } catch (error) {
    return `Cannot access automationSystem: ${error.message}`;
  }
});

test('Automations are loaded', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  
  try {
    const automations = iframe.contentWindow.automationSystem?._automations || [];
    console.log(`   📋 Total automations: ${automations.length}`);
    
    if (automations.length === 0) return 'WARN';
    
    const activeAutomations = automations.filter(a => a.active);
    console.log(`   ✅ Active automations: ${activeAutomations.length}`);
    
    activeAutomations.forEach(a => {
      console.log(`      • ${a.name} (${a.frequency}, trigger: ${a.beforeClassTime || 'N/A'})`);
    });
    
    return true;
  } catch (error) {
    return `Cannot access automations: ${error.message}`;
  }
});

test('Students data in iframe', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  
  try {
    const studentsData = iframe.contentWindow.studentsData;
    if (!studentsData) return 'studentsData not found in iframe';
    if (!Array.isArray(studentsData)) return 'studentsData is not an array';
    console.log(`   👥 Students in iframe: ${studentsData.length}`);
    if (studentsData.length > 0) {
      console.log(`   👥 Sample:`, studentsData.slice(0, 2).map(s => s.name));
    }
    return studentsData.length > 0 ? true : 'WARN';
  } catch (error) {
    return `Cannot access studentsData: ${error.message}`;
  }
});

test('Groups data in iframe', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  
  try {
    const groupsData = iframe.contentWindow.groupsData;
    if (!groupsData) return 'groupsData not found in iframe';
    if (!Array.isArray(groupsData)) return 'groupsData is not an array';
    console.log(`   📊 Groups in iframe: ${groupsData.length}`);
    if (groupsData.length > 0) {
      console.log(`   📊 Sample:`, groupsData.slice(0, 2).map(g => g.name));
    }
    return groupsData.length > 0 ? true : 'WARN';
  } catch (error) {
    return `Cannot access groupsData: ${error.message}`;
  }
});

console.log('\n📋 TEST CATEGORY 5: SUPABASE CONFIGURATION');
console.log('─'.repeat(80));

test('Supabase URL configured', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  
  try {
    const supabaseUrl = iframe.contentWindow.SUPABASE_URL;
    if (!supabaseUrl) return 'SUPABASE_URL not found';
    console.log(`   🔗 URL: ${supabaseUrl}`);
    return true;
  } catch (error) {
    return `Cannot access SUPABASE_URL: ${error.message}`;
  }
});

test('Supabase ANON_KEY configured', () => {
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) return 'Iframe not found';
  
  try {
    const supabaseKey = iframe.contentWindow.SUPABASE_ANON_KEY;
    if (!supabaseKey) return 'SUPABASE_ANON_KEY not found';
    console.log(`   🔑 Key: ${supabaseKey.substring(0, 20)}...`);
    return true;
  } catch (error) {
    return `Cannot access SUPABASE_ANON_KEY: ${error.message}`;
  }
});

console.log('\n📋 TEST CATEGORY 6: INTERVAL SCHEDULERS');
console.log('─'.repeat(80));

test('1-minute automation interval running', () => {
  console.log('   ⏰ Cannot directly verify setInterval, check console for:');
  console.log('      "[AutomationEngine] 🔄 Running automation check..."');
  console.log('      This should appear every 60 seconds');
  return 'WARN';
});

test('30-second data refresh interval running', () => {
  console.log('   ⏰ Cannot directly verify setInterval, check console for:');
  console.log('      "[AutomationEngine] 📡 Requested groups/students data from parent window"');
  console.log('      This should appear every 30 seconds');
  return 'WARN';
});

console.log('\n📋 TEST CATEGORY 7: MANUAL TRIGGER TEST');
console.log('─'.repeat(80));

console.log('⚠️  Manual trigger test requires user action:');
console.log('   1. Open browser console');
console.log('   2. Run: window.testAutomationManually()');
console.log('   3. Check for email send attempts in console');

// Export test function to window
window.testAutomationManually = async function() {
  console.log('\n🧪 MANUAL AUTOMATION TEST TRIGGERED');
  console.log('─'.repeat(80));
  
  const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
  if (!iframe) {
    console.error('❌ Iframe not found');
    return;
  }
  
  try {
    const checkAutomations = iframe.contentWindow.checkAutomations;
    if (typeof checkAutomations !== 'function') {
      console.error('❌ checkAutomations function not found in iframe');
      return;
    }
    
    console.log('✅ Calling checkAutomations() manually...');
    await checkAutomations();
    console.log('✅ Manual test complete - check console for automation logs');
  } catch (error) {
    console.error('❌ Error running manual test:', error);
  }
};

console.log('\n═'.repeat(80));
console.log('📊 TEST RESULTS SUMMARY');
console.log('═'.repeat(80));
console.log(`✅ Passed:   ${results.passed}`);
console.log(`❌ Failed:   ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📊 Total:    ${results.tests.length}`);

if (results.failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  results.tests.filter(t => t.status === 'FAIL').forEach(t => {
    console.log(`   • ${t.name}: ${t.error}`);
  });
}

if (results.warnings > 0) {
  console.log('\n⚠️  WARNINGS:');
  results.tests.filter(t => t.status === 'WARN').forEach(t => {
    console.log(`   • ${t.name}`);
  });
}

console.log('\n📝 RECOMMENDED ACTIONS:');
console.log('─'.repeat(80));

if (results.failed === 0 && results.warnings === 0) {
  console.log('✅ All tests passed! System appears healthy.');
  console.log('   Next: Monitor console for automation engine logs every 60 seconds');
} else {
  if (results.tests.find(t => t.name.includes('iframe exists') && t.status === 'FAIL')) {
    console.log('❌ CRITICAL: Email iframe not initialized');
    console.log('   Fix: Call initializeEmailSystemIframe() in index.html');
  }
  
  if (results.tests.find(t => t.name.includes('dataReceived') && t.status === 'FAIL')) {
    console.log('❌ CRITICAL: Data not reaching iframe');
    console.log('   Fix: Check postMessage communication and sendGroupsDataToEmailSystem()');
  }
  
  if (results.tests.find(t => t.name.includes('Students data in iframe') && t.status === 'WARN')) {
    console.log('⚠️  WARNING: No students in iframe');
    console.log('   Fix: Verify students are loaded in parent window first');
  }
  
  if (results.tests.find(t => t.name.includes('Automations are loaded') && t.status === 'WARN')) {
    console.log('⚠️  WARNING: No automations configured');
    console.log('   Fix: Create at least one active "before_class" automation in email system');
  }
}

console.log('\n🔍 LIVE MONITORING COMMANDS:');
console.log('─'.repeat(80));
console.log('   • window.testAutomationManually() - Trigger automation check now');
console.log('   • Run this script again to re-test all components');

console.log('\n═'.repeat(80));
console.log('🏁 DIAGNOSTIC COMPLETE');
console.log('═'.repeat(80));
console.log('\n\n');
