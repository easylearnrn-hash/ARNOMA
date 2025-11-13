// ============================================
// FULL SYNC DEBUG SCRIPT
// ============================================
// Copy and paste this entire script into the browser console
// to diagnose Full Sync date range issues

(function() {
  'use strict';

console.log('🔍 ========== FULL SYNC DEBUG TOOL ==========');

// Step 1: Check Gmail connection
console.log('\n📋 Step 1: Check Gmail Connection');
let gmailToken = null;

// Try to get token from window.gmailAccessToken (current session)
if (window.gmailAccessToken) {
  console.log('✅ Gmail token found in current session');
  gmailToken = window.gmailAccessToken;
} else {
  // Try localStorage
  const gmailData = localStorage.getItem('gmailConnection');
  if (gmailData) {
    const parsed = JSON.parse(gmailData);
    console.log('✅ Gmail connected (from storage)');
    console.log('Token expires:', new Date(parsed.expiresAt).toLocaleString());
    console.log('Token valid?', new Date(parsed.expiresAt) > new Date());
    if (new Date(parsed.expiresAt) > new Date()) {
      gmailToken = parsed.accessToken;
    }
  } else {
    console.error('❌ No Gmail connection - Connect Gmail first!');
  }
}

// Step 2: Test date formatting
console.log('\n📋 Step 2: Test Date Formatting');

function formatGmailDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

const testDates = [
  new Date('2025-07-01'),
  new Date('2025-07-31'),
  new Date('2025-11-01'),
  new Date('2025-11-12')
];

testDates.forEach(date => {
  console.log(`Date: ${date.toLocaleDateString()} → Gmail format: ${formatGmailDate(date)}`);
});

// Step 3: Test July 2025 range
console.log('\n📋 Step 3: Simulate July 2025 Full Sync Query');

const julyStart = new Date('2025-07-01');
const julyEnd = new Date('2025-07-31');

// Add 1 day to end date for Gmail's exclusive 'before:' parameter
const adjustedEnd = new Date(julyEnd);
adjustedEnd.setDate(adjustedEnd.getDate() + 1);

const startStr = formatGmailDate(julyStart);
const endStr = formatGmailDate(adjustedEnd);

console.log('User selected range:');
console.log('  Start: July 1, 2025 →', startStr);
console.log('  End: July 31, 2025 →', endStr, '(+1 day for Gmail)');

const query = `from:service@usbank.com subject:"money" after:${startStr} before:${endStr}`;
console.log('\n📧 Gmail API Query:');
console.log(query);

// Step 4: Actually test the Gmail API
console.log('\n📋 Step 4: Test Gmail API Call');

// Define function in global scope
window.testGmailQuery = async function(afterDate, beforeDate) {
  // Use the token we found earlier
  if (!gmailToken) {
    console.error('❌ No Gmail access token available');
    console.error('💡 Make sure Gmail is connected (green button) and try again');
    return;
  }
  
  const token = gmailToken;
  const query = `from:service@usbank.com subject:"money" after:${afterDate} before:${beforeDate}`;
  
  console.log('🔍 Testing query:', query);
  console.log('📅 Date range:', afterDate, 'to', beforeDate);
  
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=500`;
    console.log('🌐 API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', data);
    
    if (data.messages && data.messages.length > 0) {
      console.log(`✅ Found ${data.messages.length} messages!`);
      console.log('First 5 message IDs:', data.messages.slice(0, 5).map(m => m.id));
    } else {
      console.log('⚠️ No messages found for this date range');
      console.log('Possible reasons:');
      console.log('  1. No payments received in July 2025');
      console.log('  2. Emails archived/deleted from inbox');
      console.log('  3. Gmail query syntax issue');
      console.log('  4. Date format incorrect');
    }
    
    // Test a broader query
    console.log('\n🔍 Testing broader query (any date in 2025)...');
    const broadQuery = `from:service@usbank.com subject:"money" after:2025/01/01 before:2025/12/31`;
    const broadUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(broadQuery)}&maxResults=10`;
    
    const broadResponse = await fetch(broadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const broadData = await broadResponse.json();
    if (broadData.messages) {
      console.log(`✅ Found ${broadData.messages.length} payment emails in all of 2025`);
      console.log('This means the Gmail API is working!');
    } else {
      console.log('⚠️ No payment emails found in 2025 at all');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Step 5: Check current payments in database
console.log('\n📋 Step 5: Check Current Payments in Database');
try {
  const payments = PaymentStore.getAll();
  console.log(`✅ Total payments in database: ${payments.length}`);
  
  // Find July 2025 payments
  const julyPayments = payments.filter(p => {
    const date = new Date(p.date);
    return date.getFullYear() === 2025 && date.getMonth() === 6; // July = month 6
  });
  
  console.log(`📅 July 2025 payments: ${julyPayments.length}`);
  
  if (julyPayments.length > 0) {
    console.log('July payments:', julyPayments.map(p => ({
      date: new Date(p.date).toLocaleDateString(),
      amount: p.amount,
      payer: p.payerName || p.senderName,
      gmailId: p.gmailId
    })));
  }
  
  // Show date range of all payments
  const dates = payments.map(p => new Date(p.date)).sort((a, b) => a - b);
  if (dates.length > 0) {
    console.log(`\n📊 Payment date range in database:`);
    console.log(`   Oldest: ${dates[0].toLocaleDateString()}`);
    console.log(`   Newest: ${dates[dates.length - 1].toLocaleDateString()}`);
  }
} catch (error) {
  console.error('❌ Error accessing PaymentStore:', error);
}

// Step 6: Run the actual test
console.log('\n📋 Step 6: Run Gmail API Test');
console.log('Testing July 1-31, 2025...');

window.testGmailQuery(startStr, endStr).then(() => {
  console.log('\n🔍 ========== DEBUG TOOL COMPLETE ==========');
  console.log('📝 To test a different date range, run:');
  console.log('   testGmailQuery("2025/07/01", "2025/08/01")');
  console.log('📝 To test November 2025 (where you have payments), run:');
  console.log('   testGmailQuery("2025/11/01", "2025/12/01")');
});

})(); // End of wrapper function
