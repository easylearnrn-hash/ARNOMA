#!/bin/bash
# ============================================================================
# MIGRATION SCRIPT: Move skipped classes from localStorage to Supabase
# Run this ONCE after setting up the skipped_classes table
# ============================================================================

echo "📦 ARNOMA Calendar - Migrate Skipped Classes to Supabase"
echo "=========================================================="
echo ""
echo "This script will help you migrate existing skipped classes"
echo "from localStorage to your Supabase database."
echo ""
echo "⚠️  IMPORTANT: Make sure you have:"
echo "   1. Created the 'skipped_classes' table in Supabase"
echo "   2. Run the SQL script: supabase-skipped-classes-table.sql"
echo "   3. Verified the table exists in Supabase Table Editor"
echo ""
echo "Press ENTER to continue or Ctrl+C to cancel..."
read

echo ""
echo "🔧 Migration Steps:"
echo "==================="
echo ""
echo "Step 1: Open ARNOMA in your browser"
echo "Step 2: Press F12 to open Developer Tools"
echo "Step 3: Go to 'Console' tab"
echo "Step 4: Copy and paste this JavaScript code:"
echo ""
echo "-------------------------------------------"
cat << 'EOF'
// Migration Script - Run in Browser Console
(async function migrateSkippedClasses() {
  console.log('🚀 Starting migration of skipped classes to Supabase...');
  
  // Load from localStorage
  const localData = localStorage.getItem('skipped-classes:v1');
  if (!localData) {
    console.log('ℹ️  No skipped classes found in localStorage');
    return;
  }
  
  const skippedClasses = JSON.parse(localData);
  console.log('📦 Found skipped classes:', skippedClasses);
  
  // Convert to Supabase format
  const records = [];
  Object.keys(skippedClasses).forEach(groupName => {
    Object.keys(skippedClasses[groupName]).forEach(classDate => {
      records.push({
        group_name: groupName,
        class_date: classDate,
        skipped_at: new Date().toISOString()
      });
    });
  });
  
  if (records.length === 0) {
    console.log('ℹ️  No records to migrate');
    return;
  }
  
  console.log(`📊 Found ${records.length} skipped classes to migrate`);
  
  // Insert into Supabase
  const { data, error } = await supabase
    .from('skipped_classes')
    .insert(records);
  
  if (error) {
    console.error('❌ Migration failed:', error);
    console.error('📋 Error details:', error.message);
    return;
  }
  
  console.log('✅ Migration successful!');
  console.log(`✅ Migrated ${records.length} skipped classes to Supabase`);
  console.log('');
  console.log('🎉 Done! Your skipped classes are now synced to the cloud.');
  console.log('🔄 Reload the page to verify the migration.');
})();
EOF
echo "-------------------------------------------"
echo ""
echo "Step 5: Press ENTER in the console"
echo "Step 6: Wait for '✅ Migration successful!' message"
echo "Step 7: Reload the page (Cmd+R or Ctrl+R)"
echo ""
echo "🔍 Verification:"
echo "================"
echo ""
echo "To verify the migration worked:"
echo "1. Open Supabase dashboard"
echo "2. Go to Table Editor → skipped_classes"
echo "3. You should see your migrated records"
echo ""
echo "Or run this in the browser console:"
echo ""
echo "-------------------------------------------"
cat << 'EOF'
// Verify Migration
(async function verifyMigration() {
  const { data, error } = await supabase
    .from('skipped_classes')
    .select('*');
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('✅ Found', data.length, 'skipped classes in Supabase:');
  console.table(data);
})();
EOF
echo "-------------------------------------------"
echo ""
echo "📚 For more help, see: CALENDAR-CLOUD-SYNC.md"
echo ""
