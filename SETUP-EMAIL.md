# 📧 ARNOMA Email System Setup

## Overview
You now have a Supabase Edge Function ready to send emails via Resend API!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link to your project
```bash
cd "Library/Mobile Documents/com~apple~CloudDocs/GitHUB"
supabase link --project-ref zlvnxvrzotamhpezqedr
```

### Step 4: Set up Resend (Free - 100 emails/day)

1. Go to **https://resend.com**
2. Create account (free)
3. Add domain: **arnoma.us**
4. Follow DNS verification steps
5. Get your API key

### Step 5: Set Resend API key in Supabase
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Step 6: Deploy the function
```bash
supabase functions deploy send-email
```

### Step 7: Test it!
```bash
curl -X POST https://zlvnxvrzotamhpezqedr.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsdm54dnJ6b3RhbWhwZXpxZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTEzMTcsImV4cCI6MjA3ODM4NzMxN30.-IoSqKhDrA9NuG4j3GufIbfmodWqCoppEklE1nTmw38" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test from ARNOMA",
    "html": "<h1>Success!</h1><p>Email system is working!</p>"
  }'
```

## ✅ What's Already Done

- ✅ Edge Function created (`supabase/functions/send-email/index.ts`)
- ✅ CORS configured for browser access
- ✅ Error handling implemented
- ✅ Documentation created

## 🔧 Next: Update Your App

Once deployed, I'll update `index.html` to use this email system instead of Gmail API!

## 💰 Costs

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- No credit card required
- Never expires

Perfect for your student management system!

## 📝 Files Created

1. `supabase/functions/send-email/index.ts` - Edge Function code
2. `supabase/functions/send-email/README.md` - Detailed docs
3. `SETUP-EMAIL.md` - This setup guide

## ❓ Need Help?

See detailed instructions in:
`supabase/functions/send-email/README.md`
