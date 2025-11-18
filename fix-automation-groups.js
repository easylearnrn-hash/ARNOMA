// FIX AUTOMATIONS - Add missing group selections
// Run this ONLY if debug shows "NONE SELECTED" for groups

console.log('🔧 FIXING AUTOMATION GROUP SELECTIONS\n' + '='.repeat(60));

// Load automations
const automations = JSON.parse(localStorage.getItem('arnoma-automations-v3') || '[]');

if (automations.length === 0) {
  console.error('❌ No automations found!');
  console.log('   Action: Create automations via Email System UI first');
} else {
  console.log(`Found ${automations.length} automations\n`);

  let fixed = 0;

  automations.forEach(auto => {
    console.log(`Checking: ${auto.name}`);

    // Check if selectedGroups is missing or empty
    if (!auto.selectedGroups || auto.selectedGroups.length === 0) {
      console.warn(`   ⚠️  No groups selected!`);

      // Extract group name from automation name
      // e.g., "Group A Starts in 30" → "A"
      const match = auto.name.match(/Group\s+([A-Z])/i);
      if (match) {
        const groupName = match[1].toUpperCase();
        auto.selectedGroups = [groupName];
        console.log(`   ✅ Fixed: Added group "${groupName}"`);
        fixed++;
      } else {
        console.error(`   ❌ Cannot auto-detect group from name: "${auto.name}"`);
        console.log(`      Manual fix: auto.selectedGroups = ['A'] // or ['C'], ['D'], etc.`);
      }
    } else {
      console.log(`   ✅ Groups: ${auto.selectedGroups.join(', ')}`);
    }
  });

  if (fixed > 0) {
    // Save back to localStorage
    localStorage.setItem('arnoma-automations-v3', JSON.stringify(automations));
    console.log(`\n✅ Fixed ${fixed} automation(s)`);
    console.log('⚠️  IMPORTANT: Reload the page to apply changes!');
  } else {
    console.log('\n✅ All automations have groups selected');
  }
}

console.log('\n' + '='.repeat(60));
