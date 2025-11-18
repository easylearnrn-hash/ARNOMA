// QUICK AUTOMATION DEBUG - Run this in browser console
// This will show you exactly why emails aren't being sent

console.log('\n🔍 AUTOMATION EMAIL DEBUG\n' + '='.repeat(60));

// Check iframe exists
const iframe = document.querySelector('iframe[src*="email-system-complete.html"]');
if (!iframe) {
  console.error('❌ Email iframe not found!');
  console.log('   Action: Reload the page');
} else {
  console.log('✅ Email iframe found');

  // Check data received
  const dataReceived = iframe.contentWindow.dataReceived;
  console.log(`\n📊 Data Status: ${dataReceived ? '✅ Received' : '❌ Not received'}`);

  if (dataReceived) {
    const groups = iframe.contentWindow.groupsData?.length || 0;
    const students = iframe.contentWindow.studentsData?.length || 0;
    console.log(`   Groups: ${groups}`);
    console.log(`   Students: ${students}`);
  }

  // Check automations
  const automations = JSON.parse(localStorage.getItem('arnoma-automations-v3') || '[]');
  const activeAutomations = automations.filter(a => a.active && a.frequency === 'before_class');

  console.log(
    `\n⚙️  Automations: ${automations.length} total, ${activeAutomations.length} active "before_class"`
  );

  if (activeAutomations.length === 0) {
    console.error('❌ NO ACTIVE "BEFORE_CLASS" AUTOMATIONS!');
    console.log('   Action: Go to Email System and create/activate automations');
  } else {
    console.log('✅ Active automations found:');
    activeAutomations.forEach(a => {
      console.log(`   • ${a.name} - ${a.beforeClassTime} min before`);
      console.log(`     Template: ${a.templateName}`);
      console.log(`     Groups: ${a.selectedGroups?.join(', ') || 'NONE SELECTED!'}`);
    });
  }

  // Get current LA time
  const now = new Date();
  const laTimeStr = now.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  console.log(`\n🕐 Current LA Time: ${laTimeStr}`);

  // Check upcoming classes
  const groups = window.groupsCache || [];
  console.log(`\n📅 Checking upcoming classes...`);

  let foundClassInWindow = false;

  groups.forEach(group => {
    if (!group.schedule) return;

    const sessions = group.schedule.split(',').map(s => s.trim());
    sessions.forEach(session => {
      // Parse "Mon/Wed 8:00 AM"
      const match = session.match(/([A-Za-z/]+)\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return;

      const [, days, hour, minute, ampm] = match;
      const daysList = days.split('/').map(d => d.trim());

      // Convert to 24-hour
      let hour24 = parseInt(hour);
      if (ampm.toUpperCase() === 'PM' && hour24 !== 12) hour24 += 12;
      if (ampm.toUpperCase() === 'AM' && hour24 === 12) hour24 = 0;

      // Check if today matches
      const currentDay = now.toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        weekday: 'short',
      });
      const dayMap = {
        Mon: 'Mon',
        Tue: 'Tue',
        Wed: 'Wed',
        Thu: 'Thu',
        Fri: 'Fri',
        Sat: 'Sat',
        Sun: 'Sun',
      };

      daysList.forEach(day => {
        if (currentDay.startsWith(day)) {
          // Calculate minutes until class
          const classMinutes = hour24 * 60 + parseInt(minute);
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          const minutesUntil = classMinutes - currentMinutes;

          console.log(`   ${group.name}: ${session}`);
          console.log(`      Minutes until class: ${minutesUntil}`);

          // Check if any automation should trigger
          activeAutomations.forEach(auto => {
            const triggerTime = auto.beforeClassTime || 30;
            const diff = Math.abs(minutesUntil - triggerTime);

            if (diff <= 2) {
              console.log(`      🎯 IN TRIGGER WINDOW! (${triggerTime} min before, diff: ${diff})`);
              foundClassInWindow = true;

              // Check if this group is selected
              if (!auto.selectedGroups || !auto.selectedGroups.includes(group.name)) {
                console.warn(
                  `      ⚠️  But group "${group.name}" NOT selected in automation "${auto.name}"`
                );
              } else {
                console.log(`      ✅ Group selected in automation "${auto.name}"`);
              }
            } else if (minutesUntil > 0 && minutesUntil < 120) {
              console.log(
                `      ⏰ Coming up: ${minutesUntil} min (trigger: ${triggerTime} min before)`
              );
            }
          });
        }
      });
    });
  });

  if (!foundClassInWindow) {
    console.log('\n⚠️  NO CLASSES IN TRIGGER WINDOW');
    console.log("   This is why emails aren't being sent right now.");
    console.log('   Emails will send automatically when a class enters the trigger window.');
  }

  // Check Supabase config
  console.log(`\n🔑 Supabase Config:`);
  try {
    const supabaseUrl = iframe.contentWindow.SUPABASE_URL;
    const supabaseKey = iframe.contentWindow.SUPABASE_ANON_KEY;

    if (supabaseUrl) {
      console.log(`   ✅ URL: ${supabaseUrl}`);
    } else {
      console.error('   ❌ SUPABASE_URL not found');
    }

    if (supabaseKey) {
      console.log(`   ✅ Key: ${supabaseKey.substring(0, 30)}...`);
    } else {
      console.error('   ❌ SUPABASE_ANON_KEY not found');
    }
  } catch (e) {
    console.error('   ❌ Cannot access Supabase config:', e.message);
  }

  // Final diagnosis
  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSIS:');
  console.log('='.repeat(60));

  if (!dataReceived) {
    console.error('❌ ISSUE: Data not received by iframe');
    console.log('   FIX: Reload the page');
  } else if (activeAutomations.length === 0) {
    console.error('❌ ISSUE: No active "before_class" automations');
    console.log('   FIX: Go to Email System → Create automation');
  } else if (!foundClassInWindow) {
    console.log('✅ System working correctly');
    console.log('⏰ Waiting for classes to enter trigger window');
    console.log('   Emails will send automatically when time comes');
  } else {
    console.log('🎯 Classes IN trigger window but no emails sent!');
    console.log('   Check:');
    console.log('   1. Are groups selected in automations?');
    console.log('   2. Are students "active" status?');
    console.log('   3. Check browser console for send errors');
  }
}

console.log('\n');
