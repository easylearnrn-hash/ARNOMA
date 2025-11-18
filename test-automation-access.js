// Quick test to verify automationSystem is accessible
// Run this in browser console after reloading the page

console.log('\n🔍 Testing Automation System Access\n' + '─'.repeat(50));

const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');

if (!iframe) {
  console.error('❌ FAIL: Email iframe not found');
  console.log("   Action: Make sure you're on https://www.richyfesta.com");
} else {
  console.log('✅ PASS: Email iframe found');

  if (!iframe.contentWindow) {
    console.error('❌ FAIL: Cannot access iframe contentWindow');
  } else {
    console.log('✅ PASS: Iframe contentWindow accessible');

    if (!iframe.contentWindow.automationSystem) {
      console.error('❌ FAIL: automationSystem not found in iframe');
      console.log('   Action: Hard reload the page (Cmd+Shift+R)');
    } else {
      console.log('✅ PASS: automationSystem accessible');

      const automations = iframe.contentWindow.automationSystem._automations || [];
      console.log('\n📊 Automation System Status:');
      console.log('   Total automations:', automations.length);
      console.log('   Active automations:', automations.filter(a => a.active).length);

      if (automations.length === 0) {
        console.log('\n⚠️  NO AUTOMATIONS CONFIGURED');
        console.log('   Next Step: Create an automation via Email System UI');
        console.log('   1. Click hamburger menu (☰)');
        console.log('   2. Click "Email System"');
        console.log('   3. Click "Create First Automation"');
      } else {
        console.log('\n✅ Automations configured:');
        console.table(
          automations.map(a => ({
            Name: a.name,
            Active: a.active ? '✅' : '❌',
            Type: a.frequency,
            Trigger: a.beforeClassTime ? `${a.beforeClassTime} min before` : 'N/A',
            Template: a.templateName,
            Groups: a.selectedGroups?.length || 0,
          }))
        );
      }

      // Check Supabase config too
      console.log('\n🔑 Supabase Configuration:');
      if (iframe.contentWindow.SUPABASE_URL) {
        console.log('   ✅ SUPABASE_URL:', iframe.contentWindow.SUPABASE_URL);
      } else {
        console.error('   ❌ SUPABASE_URL not found');
      }

      if (iframe.contentWindow.SUPABASE_ANON_KEY) {
        console.log(
          '   ✅ SUPABASE_ANON_KEY:',
          iframe.contentWindow.SUPABASE_ANON_KEY.substring(0, 30) + '...'
        );
      } else {
        console.error('   ❌ SUPABASE_ANON_KEY not found');
      }

      // Check data
      console.log('\n📊 Data Status:');
      console.log('   Groups:', iframe.contentWindow.groupsData?.length || 0);
      console.log('   Students:', iframe.contentWindow.studentsData?.length || 0);
      console.log('   Data received:', iframe.contentWindow.dataReceived ? '✅' : '❌');
    }
  }
}

console.log('\n' + '─'.repeat(50));
console.log('🏁 Test Complete\n');
