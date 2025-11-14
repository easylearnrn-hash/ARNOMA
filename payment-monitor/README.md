# ARNOMA Payment Monitor

Automated email monitoring service that checks for payment confirmations and updates Supabase in real-time.

## Features

✅ **Real-time Monitoring** - Checks Gmail every 10 seconds  
✅ **No Token Expiration** - Uses Gmail App Password (never expires)  
✅ **Automatic Processing** - Extracts payment info and student names  
✅ **Attachment Support** - Downloads Zelle screenshots  
✅ **Supabase Integration** - Auto-updates database  
✅ **Auto-Reconnect** - Handles connection errors gracefully  

## Setup Instructions

### 1. Get Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. App Passwords → Generate new password
4. Select "Mail" and "Other (Custom name)" → Name it "ARNOMA Monitor"
5. Copy the 16-character password

### 2. Create Supabase Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create payment notifications table
CREATE TABLE payment_notifications (
  id BIGSERIAL PRIMARY KEY,
  from_email TEXT,
  subject TEXT,
  body TEXT,
  html_body TEXT,
  student_name TEXT,
  amount NUMERIC(10,2),
  received_at TIMESTAMPTZ,
  has_attachments BOOLEAN DEFAULT false,
  attachments_count INTEGER DEFAULT 0,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service to insert
CREATE POLICY "Allow service to insert" 
ON payment_notifications 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated to read" 
ON payment_notifications 
FOR SELECT 
TO authenticated 
USING (true);
```

### 3. Configure Environment

1. Copy `.env.example` to `.env`
2. Fill in your credentials:

```bash
cp .env.example .env
nano .env
```

Edit `.env`:
```
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
SUPABASE_URL=https://zlvnxvrzotamhpezqedr.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CHECK_INTERVAL=10000
PAYMENT_KEYWORDS=payment,zelle,paid,venmo,transfer
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Test Locally

```bash
npm start
```

You should see:
```
🚀 ARNOMA Payment Monitor Starting...
📧 Email: your@gmail.com
⏱️  Check interval: 10 seconds
🔍 Keywords: payment, zelle, paid, venmo, transfer
🔌 Connecting to Gmail IMAP...
✅ IMAP connection ready!
⏰ Checking for payment emails every 10 seconds
```

### 6. Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `ARNOMA/payment-monitor`
5. Add environment variables:
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `CHECK_INTERVAL`
   - `PAYMENT_KEYWORDS`
6. Deploy!

## How It Works

1. **Connects to Gmail** via IMAP using app password
2. **Checks every 10 seconds** for unread emails
3. **Searches for keywords** (payment, zelle, paid, etc.)
4. **Extracts information**:
   - Student name (from sender)
   - Payment amount (from email body)
   - Attachments (Zelle screenshots)
5. **Saves to Supabase** in `payment_notifications` table
6. **Marks email as read** to avoid duplicates

## Monitoring

Check logs in Railway dashboard to see:
- When emails are detected
- Payment information extracted
- Any errors or issues

## Customization

Edit `server.js` to:
- Change search criteria
- Add more extraction logic
- Upload attachments to Supabase Storage
- Send notifications to Slack/Discord
- Auto-match students and create payment records

## Cost

**FREE** to run on:
- Railway (Free $5/month credit - enough for this service)
- Render.com (Free tier)
- Fly.io (Free tier)

## Support

Contact: your@email.com

---

Built for ARNOMA NCLEX-RN Student Management System
