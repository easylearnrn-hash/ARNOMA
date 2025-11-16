# Deploy Supabase Edge Function - URGENT FIX

## The Problem
Your emails aren't sending because the Edge Function uses `info@arnoma.us` but only `mail.arnoma.us` is verified in Resend.

## The Solution
Deploy the updated Edge Function that uses `info@mail.arnoma.us`

## Steps to Deploy (Choose One Method)

### Method 1: Supabase Dashboard (EASIEST - 2 minutes)

1. **Open Supabase Functions**:
   - Go to: https://supabase.com/dashboard/project/zlvnxvrzotamhpezqedr/functions

2. **Find or Create the Function**:
   - If `send-email` exists: Click on it → Click "Edit"
   - If not: Click "New Function" → Name it `send-email`

3. **Paste the Code**:
   Copy the entire code from `supabase/functions/send-email/index.ts` in this repo

4. **Deploy**:
   - Click "Deploy" button
   - Wait 10-30 seconds for deployment

5. **Test**:
   - Go to your app: www.richyfesta.com
   - Create a new student with an email
   - Check your inbox (and spam)

---

### Method 2: Using npm/npx (If you have Node.js)

```bash
# Install Supabase CLI via npm
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref zlvnxvrzotamhpezqedr

# Deploy the function
supabase functions deploy send-email
```

---

## Quick Copy-Paste Code for Dashboard

If you need to copy the function code, here it is:

```typescript
// Supabase Edge Function for sending emails via Resend
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Resend API key from environment variable
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const resend = new Resend(resendApiKey)

    // Parse request body
    const { to, subject, html, from = 'ARNOMA <info@mail.arnoma.us>' } = await req.json()

    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send email via Resend
    const data = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

---

## After Deployment

1. **Clear browser cache** or hard refresh (Cmd + Shift + R)
2. **Create a test student** with your email
3. **Check console logs** - should see `📬 Supabase response: {success: true, data: {...}}`
4. **Check email inbox** (and spam folder)

## The Key Change

**Line 26 changed from:**
```typescript
from = 'ARNOMA <info@arnoma.us>'  // ❌ Not verified
```

**To:**
```typescript
from = 'ARNOMA <info@mail.arnoma.us>'  // ✅ Verified domain
```

---

**Status**: Ready to deploy ✅
**File location**: `supabase/functions/send-email/index.ts`
**Deployed to Git**: Yes (commit 708be52)
**Deployed to Supabase**: ⚠️ PENDING - YOU NEED TO DO THIS NOW
