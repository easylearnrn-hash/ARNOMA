# Automated Class Reminder System

## Overview
The system automatically sends class reminders to students **12 hours before their scheduled class time**.

## Features

### ⏰ Timing Logic
- **Morning Classes (7 AM, 8 AM, 9 AM, 10 AM)**: Reminder sent night before → Email says "**tomorrow**"
- **Evening Classes (7 PM, 8 PM, 9 PM, 10 PM)**: Reminder sent morning of same day → Email says "**today**"
- Checks run **every hour** automatically
- 1-hour window (11.5-12.5 hours before class) to catch the right timing

### 📧 Email Content
The reminder email includes:
- **Student name**
- **Group name** (e.g., "Group A")
- **Class time** (e.g., "8:00 PM")
- **Class date** (formatted as "Monday, November 18, 2025")
- **"today" or "tomorrow"** dynamically based on timing

### 💳 Smart Payment Status Logic

#### ✅ If Student PAID
```
✅ Your payment for this class is confirmed!
```
Simple reminder only, no payment mention beyond confirmation.

#### ⚠️ If Student UNPAID (No Credit)
```
⚠️ Payment Reminder: Please make your payment before class starts 
to avoid delays in notes being uploaded to Google Classroom.

[Zelle QR Code and payment instructions shown]
```

#### 💳 If Student UNPAID (Has Credit Balance)
```
💳 Credit Available: Your credit balance of $150 will be applied to this class.
Remaining Credit: $50 after this class
```

## Technical Implementation

### Components Added

1. **ClassReminderManager** (index.html)
   - Location: After PaymentReminderManager (~line 20586)
   - Manages timing, tracking, and sending logic
   - Stores sent reminders in localStorage to avoid duplicates

2. **Email Template** (email-system-complete.html)
   - Updated existing "Class Reminder" template
   - Now automated (was manual before)
   - Uses placeholders: `{{StudentName}}`, `{{GroupName}}`, `{{ClassTime}}`, `{{TimeOfDay}}`, `{{PaymentMessage}}`

3. **Message Handler** (email-system-complete.html)
   - Action: `sendClassReminder`
   - Processes template variables
   - Sends via Supabase Edge Function
   - Returns success/error to parent window

4. **Initialization** (index.html ~line 14396)
   - Starts with app initialization
   - Runs first check 10 seconds after calendar loads
   - Sets up hourly interval checks

### How It Works

```
1. Every hour, ClassReminderManager checks calendar data
2. For each upcoming class (today/tomorrow):
   - Calculate hours until class starts
   - If between 11.5-12.5 hours: SEND REMINDER
3. Check if reminder already sent (localStorage tracking)
4. Determine payment status and credit balance
5. Build appropriate payment message
6. Send to email system iframe via postMessage
7. Email system processes template and sends via Supabase
8. Create notification with email preview
9. Mark as sent in localStorage
```

### Calendar Data Structure
```javascript
{
  days: [
    {
      date: Date object,
      studentsWithClass: [
        {
          student: { id, name, email, group, creditBalance, ... },
          status: 'paid' | 'unpaid' | 'absent' | 'future',
          balance: 100,
          ...
        }
      ]
    }
  ]
}
```

## Monitoring & Debugging

### Console Logs (when reminders run)
```
═══════════════════════════════════════════════════════
[ClassReminderManager] 🔍 STARTING CLASS REMINDER CHECK
[ClassReminderManager] 📅 LA Date: 2025-11-18
[ClassReminderManager] 🕐 LA Time: 08:30:00 PM
...
[ClassReminderManager] 📧 Sending class reminder to [Student Name]
[ClassReminderManager]    Class: Group A on 2025-11-19 at 8:00 PM
[ClassReminderManager]    Hours until class: 11.7
[ClassReminderManager] ✅ Reminder sent to [Student Name]
...
[ClassReminderManager] 📊 SUMMARY
  Classes checked: 15
  Reminders sent: 3
═══════════════════════════════════════════════════════
```

### Notifications
- **Title**: "Class Reminder Sent: [Subject]"
- **Body**: "Sent to [Name] ([Email]) for class on [Date]"
- **Click notification** to see full email preview (like payment reminders)

### LocalStorage Tracking
```javascript
// Key: 'class_reminders_sent'
// Value: { studentId: { "2025-11-18": timestamp, ... }, ... }
```

## Testing

### Manual Test
Open browser console and run:
```javascript
window.ClassReminderManager.checkAndSendReminders()
```

### Check What Would Be Sent
```javascript
// See calendar data
console.log(window.currentCalendarData)

// See upcoming classes
window.currentCalendarData.days.forEach(day => {
  console.log(day.date, day.studentsWithClass.length, 'students')
})
```

## Important Notes

1. **Timezone**: All calculations use `America/Los_Angeles` timezone
2. **Deduplication**: Uses localStorage to prevent duplicate sends
3. **Calendar Dependency**: Requires `window.currentCalendarData` to be loaded
4. **Email System**: Sends via iframe postMessage to email-system-complete.html
5. **Supabase**: Uses Edge Function for actual email sending
6. **Hourly Checks**: Not minute-precise, but catches within 1-hour window

## Future Enhancements (Optional)

- [ ] Add "hours until class" countdown in email
- [ ] Configurable reminder timing (not just 12 hours)
- [ ] Multiple reminders (24h + 12h before)
- [ ] SMS option in addition to email
- [ ] Student preference settings (opt-out)
- [ ] Different templates for first-time vs recurring students

## Files Modified

- `index.html` - Added ClassReminderManager, initialization
- `email-system-complete.html` - Updated template, added sendClassReminder handler
- `VERSION_TRACKING.md` - Documented v2.1.6 changes

## Version
- **Added in**: v2.1.6 (2025-11-18)
- **Status**: ✅ Active and running
- **Next Review**: After first week of operation to verify timing and delivery
