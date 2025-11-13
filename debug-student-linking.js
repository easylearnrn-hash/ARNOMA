// ============================================
// STUDENT LINKING DEBUG SCRIPT
// ============================================
// Copy and paste this entire script into the browser console
// to diagnose student linking issues

console.log('🔍 ========== STUDENT LINKING DEBUG TOOL ==========');

// Step 1: Check if currentPaymentPopupData exists
console.log('\n📋 Step 1: Check Payment Popup Data');
console.log('currentPaymentPopupData:', currentPaymentPopupData);
console.log('Type:', typeof currentPaymentPopupData);
console.log('Is null?', currentPaymentPopupData === null);
console.log('Is undefined?', currentPaymentPopupData === undefined);

if (currentPaymentPopupData) {
  console.log('✅ Payment data exists!');
  console.log('Payment ID:', currentPaymentPopupData.paymentId);
  console.log('Payment Data:', JSON.stringify(currentPaymentPopupData, null, 2));
} else {
  console.log('❌ No payment data - You need to double-click a payment first!');
}

// Step 2: Check students in cache
console.log('\n📋 Step 2: Check Students Cache');
try {
  const students = getCachedStudents();
  console.log('✅ Students loaded:', students.length);
  console.log('Student IDs (first 10):', students.slice(0, 10).map(s => ({ id: s.id, name: s.name, type: typeof s.id })));
  
  // Check if ID 13 exists
  const student13 = students.find(s => s.id === 13);
  if (student13) {
    console.log('✅ Student ID 13 found:', student13);
  } else {
    console.log('❌ Student ID 13 NOT found');
  }
} catch (error) {
  console.error('❌ Error loading students:', error);
}

// Step 3: Check PaymentStore
console.log('\n📋 Step 3: Check Payment Store');
try {
  const allPayments = PaymentStore.getAll();
  console.log('✅ Total payments in store:', allPayments.length);
  console.log('First 3 payments:', allPayments.slice(0, 3).map(p => ({
    id: p.id,
    amount: p.amount,
    studentId: p.studentId,
    linkedStudentId: p.linkedStudentId,
    manuallyLinked: p.manuallyLinked
  })));
} catch (error) {
  console.error('❌ Error accessing PaymentStore:', error);
}

// Step 4: Test student ID conversion
console.log('\n📋 Step 4: Test Student ID Conversion');
const testStringId = "13";
const testNumberId = parseInt(testStringId, 10);
console.log('String ID:', testStringId, '(type:', typeof testStringId, ')');
console.log('Converted to number:', testNumberId, '(type:', typeof testNumberId, ')');
console.log('String === Number?', testStringId === 13); // Should be false
console.log('Parsed === Number?', testNumberId === 13); // Should be true

// Step 5: Simulate confirmLinkStudent with student ID 13
console.log('\n📋 Step 5: Simulate Student Linking (ID: 13)');

async function debugConfirmLinkStudent(studentId) {
  console.log('▶️ Starting confirmLinkStudent simulation...');
  console.log('Input studentId:', studentId, '(type:', typeof studentId, ')');
  
  if (!studentId) {
    console.error('❌ FAIL: No student ID provided');
    return;
  }
  
  // Check 1: Payment data snapshot
  console.log('\n🔍 Check 1: Creating payment data snapshot...');
  const paymentDataSnapshot = currentPaymentPopupData ? { ...currentPaymentPopupData } : null;
  console.log('Snapshot created:', paymentDataSnapshot);
  
  if (!paymentDataSnapshot) {
    console.error('❌ FAIL: No payment data snapshot - currentPaymentPopupData is null/undefined');
    return;
  }
  console.log('✅ PASS: Payment data snapshot created');
  
  // Check 2: Load students
  console.log('\n🔍 Check 2: Loading students...');
  const students = getCachedStudents();
  console.log('Students loaded:', students.length);
  console.log('Available student IDs:', students.map(s => s.id));
  
  // Check 3: Convert student ID
  console.log('\n🔍 Check 3: Converting student ID...');
  const studentIdNum = parseInt(studentId, 10);
  console.log('Original ID:', studentId, '(type:', typeof studentId, ')');
  console.log('Converted ID:', studentIdNum, '(type:', typeof studentIdNum, ')');
  
  // Check 4: Find student
  console.log('\n🔍 Check 4: Finding student...');
  const student = students.find(s => s.id === studentIdNum);
  
  if (!student) {
    console.error('❌ FAIL: Student not found with ID:', studentIdNum);
    console.error('Available students:', students.map(s => ({ id: s.id, name: s.name })));
    return;
  }
  console.log('✅ PASS: Student found:', student.name);
  
  // Check 5: Find payment in store
  console.log('\n🔍 Check 5: Finding payment in store...');
  const payments = PaymentStore.getAll();
  const payment = payments.find(p => p.id === paymentDataSnapshot.paymentId);
  
  if (!payment) {
    console.error('❌ FAIL: Payment not found with ID:', paymentDataSnapshot.paymentId);
    return;
  }
  console.log('✅ PASS: Payment found:', payment.id);
  
  console.log('\n✅ ========== ALL CHECKS PASSED ==========');
  console.log('Student linking should work! If it still fails, there may be an async timing issue.');
}

// Run the simulation if payment data exists
if (currentPaymentPopupData) {
  console.log('\n🚀 Running simulation with student ID 13...');
  debugConfirmLinkStudent("13");
} else {
  console.log('\n⚠️ Cannot run simulation - no payment selected');
  console.log('👉 To test: Double-click a payment, then run this script again');
}

console.log('\n🔍 ========== DEBUG TOOL COMPLETE ==========');
console.log('📝 To manually test linking, run: debugConfirmLinkStudent("13")');
