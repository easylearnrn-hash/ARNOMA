# Verify arnoma.us Domain in Resend

This will let you send emails from any address: info@arnoma.us, support@arnoma.us, etc.

## Steps:

### 1. Add Domain in Resend

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter: **arnoma.us** (without subdomain or www)
4. Click "Add"

### 2. Get DNS Records

Resend will show you 3 DNS records to add:

**Example (yours will be different):**
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCS... (long string)

Type: TXT  
Name: @
Value: v=spf1 include:amazonses...

Type: MX
Name: @
Value: feedback-smtp.us-east-1...
Priority: 10
```

### 3. Add DNS Records to Your Domain

Go to your domain registrar (where you bought arnoma.us):
- GoDaddy
- Namecheap  
- Cloudflare
- etc.

**Add each record:**

1. **First TXT Record (DKIM):**
   - Type: TXT
   - Name: resend._domainkey
   - Value: (paste the long p=MIG... value)

2. **Second TXT Record (SPF):**
   - Type: TXT
   - Name: @ (or leave blank)
   - Value: (paste the v=spf1... value)

3. **MX Record:**
   - Type: MX
   - Name: @ (or leave blank)
   - Value: (paste the feedback-smtp... value)
   - Priority: 10

### 4. Wait for Verification (5-30 minutes)

DNS changes take time to propagate. Resend will automatically check and verify.

### 5. Update Your Code

Once verified, I'll update the code to use:
```javascript
from: 'ARNOMA <info@arnoma.us>'
```

---

## Quick Access

**Resend Dashboard:** https://resend.com/domains
**Your Domain Registrar:** (where you manage arnoma.us DNS)

Once you've added the DNS records, let me know and I'll check if it's verified!
