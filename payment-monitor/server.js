import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// IMAP Configuration
const imapConfig = {
  user: process.env.GMAIL_USER,
  password: process.env.GMAIL_APP_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 10000;
const PAYMENT_KEYWORDS = (process.env.PAYMENT_KEYWORDS || 'payment,zelle,paid').split(',');

let imap;
let isChecking = false;

// Initialize IMAP connection
function connectIMAP() {
  console.log('🔌 Connecting to Gmail IMAP...');
  
  imap = new Imap(imapConfig);

  imap.once('ready', () => {
    console.log('✅ IMAP connection ready!');
    console.log(`⏰ Checking for payment emails every ${CHECK_INTERVAL / 1000} seconds`);
    
    // Start checking emails
    startMonitoring();
  });

  imap.once('error', (err) => {
    console.error('❌ IMAP connection error:', err.message);
    setTimeout(connectIMAP, 5000); // Reconnect after 5 seconds
  });

  imap.once('end', () => {
    console.log('🔌 IMAP connection ended. Reconnecting...');
    setTimeout(connectIMAP, 5000);
  });

  imap.connect();
}

// Start monitoring for new payment emails
function startMonitoring() {
  setInterval(() => {
    if (!isChecking) {
      checkNewEmails();
    }
  }, CHECK_INTERVAL);
  
  // Run first check immediately
  checkNewEmails();
}

// Check for new unread emails
function checkNewEmails() {
  if (!imap || imap.state !== 'authenticated') {
    console.log('⚠️  IMAP not ready, skipping check');
    return;
  }

  isChecking = true;

  imap.openBox('INBOX', false, (err, box) => {
    if (err) {
      console.error('❌ Error opening inbox:', err.message);
      isChecking = false;
      return;
    }

    // Search for unread emails containing payment keywords
    const searchCriteria = ['UNSEEN'];
    
    imap.search(searchCriteria, (err, results) => {
      if (err) {
        console.error('❌ Search error:', err.message);
        isChecking = false;
        return;
      }

      if (results.length === 0) {
        console.log('📭 No new emails');
        isChecking = false;
        return;
      }

      console.log(`📬 Found ${results.length} new email(s)`);
      
      const fetch = imap.fetch(results, { bodies: '' });

      fetch.on('message', (msg, seqno) => {
        msg.on('body', (stream) => {
          simpleParser(stream, async (err, parsed) => {
            if (err) {
              console.error('❌ Parse error:', err.message);
              return;
            }

            // Check if email contains payment keywords
            const subject = parsed.subject?.toLowerCase() || '';
            const text = parsed.text?.toLowerCase() || '';
            const hasPaymentKeyword = PAYMENT_KEYWORDS.some(keyword => 
              subject.includes(keyword.toLowerCase()) || text.includes(keyword.toLowerCase())
            );

            if (hasPaymentKeyword) {
              console.log('💰 Payment email detected!');
              await processPaymentEmail(parsed);
            }
          });
        });

        msg.once('attributes', (attrs) => {
          // Mark as read
          imap.addFlags(attrs.uid, ['\\Seen'], (err) => {
            if (err) console.error('❌ Error marking as read:', err.message);
          });
        });
      });

      fetch.once('end', () => {
        console.log('✅ Email check complete');
        isChecking = false;
      });

      fetch.once('error', (err) => {
        console.error('❌ Fetch error:', err.message);
        isChecking = false;
      });
    });
  });
}

// Process payment email and update Supabase
async function processPaymentEmail(email) {
  try {
    console.log('📧 Processing email from:', email.from?.text);
    console.log('📝 Subject:', email.subject);
    
    // Extract payment information
    const paymentInfo = {
      from_email: email.from?.text || '',
      subject: email.subject || '',
      body: email.text || '',
      html_body: email.html || '',
      received_at: email.date || new Date(),
      has_attachments: email.attachments?.length > 0,
      attachments_count: email.attachments?.length || 0
    };

    // Try to extract student name from email
    const studentName = extractStudentName(email);
    if (studentName) {
      paymentInfo.student_name = studentName;
    }

    // Try to extract payment amount
    const amount = extractPaymentAmount(email.text || '');
    if (amount) {
      paymentInfo.amount = amount;
    }

    // Log to Supabase (you can create a payment_emails table)
    const { data, error } = await supabase
      .from('payment_notifications')
      .insert([paymentInfo])
      .select();

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
    } else {
      console.log('✅ Payment notification saved to database');
      
      // TODO: You can add logic here to:
      // 1. Match student by email/name
      // 2. Auto-create payment record
      // 3. Send confirmation email
      // 4. Update student payment status
    }

    // Download attachments if any (Zelle screenshots)
    if (email.attachments && email.attachments.length > 0) {
      console.log(`📎 ${email.attachments.length} attachment(s) detected`);
      
      for (const attachment of email.attachments) {
        if (attachment.contentType?.startsWith('image/')) {
          console.log(`🖼️  Image attachment: ${attachment.filename}`);
          // TODO: Upload to Supabase Storage
          // const imageBuffer = attachment.content;
        }
      }
    }

  } catch (error) {
    console.error('❌ Error processing payment email:', error.message);
  }
}

// Extract student name from email
function extractStudentName(email) {
  // Try to extract name from sender
  const fromName = email.from?.text?.split('<')[0]?.trim();
  if (fromName && fromName.length > 0) {
    return fromName;
  }
  return null;
}

// Extract payment amount from email text
function extractPaymentAmount(text) {
  // Look for patterns like: $120, $120.00, 120.00, etc.
  const amountRegex = /\$?\s*(\d+(?:\.\d{2})?)/g;
  const matches = text.match(amountRegex);
  
  if (matches && matches.length > 0) {
    // Return first match, cleaned
    return parseFloat(matches[0].replace('$', '').trim());
  }
  
  return null;
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  if (imap) {
    imap.end();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  if (imap) {
    imap.end();
  }
  process.exit(0);
});

// Start the service
console.log('🚀 ARNOMA Payment Monitor Starting...');
console.log('📧 Email:', process.env.GMAIL_USER);
console.log('⏱️  Check interval:', CHECK_INTERVAL / 1000, 'seconds');
console.log('🔍 Keywords:', PAYMENT_KEYWORDS.join(', '));

connectIMAP();
