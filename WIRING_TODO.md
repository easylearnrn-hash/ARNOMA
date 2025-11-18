# 🔌 Email Wiring TODO

## ⚠️ EMAILS THAT NEED TO BE WIRED TO TRIGGERS

### 1. 💳 Payment Receipt Email
**Status:** ⚠️ NOT WIRED  
**Function:** `sendPaymentReceiptEmail(student, paymentAmount, paymentDate, newBalance)`  
**Location:** index.html line ~12557

**Where to wire:**
- **Option A:** In `addPayment()` function (line 5977) after successful insert
- **Option B:** After Gmail sync completes (processOverpayments area)
- **Option C:** In `quickAddPayment()` function (line 19418) after payment added

**Recommended:** Option A + B (both manual and Gmail payments)

```javascript
// In addPayment() after line 5983:
if (data && data[0]) {
  const payment = data[0];
  
  // Find the student
  const students = getCachedStudents();
  const student = students.find(s => s.id === payment.derivedStudentId);
  
  if (student && student.email) {
    // Send receipt email
    await sendPaymentReceiptEmail(
      student,
      payment.amount,
      payment.date,
      student.balance
    );
  }
  
  return payment;
}
```

---

### 2. 🚫 Absence Notification Email
**Status:** ⚠️ NOT WIRED  
**Function:** `sendAbsenceNotificationEmail(student, groupName, classDate)`  
**Location:** index.html line ~12447

**Where to wire:**
Search for absence marking logic in calendar. Likely:
- Click handler for absence emoji
- `markAbsent()` function
- Student grid absence button

**Look for:**
```javascript
grep_search: "markAbsent|setAbsent|click.*absent"
```

**Example wiring:**
```javascript
async function markStudentAbsent(studentId, classDate, groupName) {
  // ... existing absence marking code ...
  
  // After marking absent in database
  const student = studentsCache.find(s => s.id === studentId);
  if (student && student.email) {
    await sendAbsenceNotificationEmail(student, groupName, classDate);
  }
}
```

---

### 3. 📅 Schedule Change Email
**Status:** ⚠️ NOT WIRED  
**Function:** `sendScheduleChangeEmail(student, groupName, oldSchedule, newSchedule)`  
**Location:** index.html line ~12478

**Where to wire:**
- Group schedule save function
- Group edit modal save button
- `updateGroup()` or `saveGroup()` function

**Look for:**
```javascript
grep_search: "saveGroup|updateGroup|group.*schedule.*save"
```

**Example wiring:**
```javascript
async function saveGroupSchedule(groupId, newSchedule) {
  const oldSchedule = // ... get old schedule ...
  
  // Save to database
  await updateGroup(groupId, { schedule: newSchedule });
  
  // Get all active students in this group
  const groupStudents = studentsCache.filter(s => 
    s.group && s.group.includes(groupName) && s.status === 'active'
  );
  
  // Send email to each student
  for (const student of groupStudents) {
    if (student.email) {
      await sendScheduleChangeEmail(student, groupName, oldSchedule, newSchedule);
    }
  }
}
```

---

### 4. 🎓 Group Enrollment Email
**Status:** ⚠️ NOT WIRED  
**Function:** `sendGroupEnrollmentEmail(student, groupName, groupSchedule)`  
**Location:** index.html line ~12509

**Where to wire:**
- Student save function when group changes
- Group assignment in Student Manager
- `saveStudent()` function when `group` field changes

**Look for:**
```javascript
grep_search: "saveStudent|student.*group.*save"
```

**Example wiring:**
```javascript
async function saveStudent(studentData) {
  const isUpdate = studentData.id && typeof studentData.id === 'number';
  
  if (isUpdate) {
    // Get old student data
    const oldStudent = studentsCache.find(s => s.id === studentData.id);
    const oldGroups = oldStudent?.group?.split(',').map(g => g.trim()) || [];
    const newGroups = studentData.group?.split(',').map(g => g.trim()) || [];
    
    // Find newly added groups
    const addedGroups = newGroups.filter(g => !oldGroups.includes(g));
    
    // Save to database
    const savedStudent = await // ... save logic ...
    
    // Send enrollment email for each new group
    for (const groupName of addedGroups) {
      if (savedStudent.email) {
        const group = window.groupsCache?.find(g => g.name === groupName);
        const groupSchedule = group?.schedule || 'TBD';
        
        await sendGroupEnrollmentEmail(savedStudent, groupName, groupSchedule);
      }
    }
  }
}
```

---

## ✅ ALREADY WIRED (NO ACTION NEEDED)

### 1. ✅ Class Reminder
**Status:** ✅ WORKING  
**Location:** email-system-complete.html automation engine (line ~5106)  
**Trigger:** Automatic based on group schedules

### 2. ✅ Unpaid Payment Reminder
**Status:** ✅ WORKING  
**Location:** PaymentReminderManager in index.html  
**Trigger:** Daily check for unpaid classes

### 3. ✅ Welcome Email
**Status:** ✅ WIRED  
**Location:** Called at line 12125 when new student added  
**Trigger:** `sendWelcomeEmail(savedRecord)` after first save

### 4. ✅ Credit Applied Email
**Status:** ✅ WIRED  
**Location:** Called at line 19543 when credit used  
**Trigger:** `sendCreditAppliedEmail()` when payment made with credit

---

## 🔍 HOW TO FIND TRIGGER LOCATIONS

### For Payment Receipt:
```bash
grep -n "addPayment\|insert.*payments\|quickAddPayment" index.html
```

### For Absence:
```bash
grep -n "markAbsent\|setAbsent\|absence.*click" index.html
```

### For Schedule Change:
```bash
grep -n "saveGroup\|updateGroup\|schedule.*save" index.html
```

### For Group Enrollment:
```bash
grep -n "saveStudent\|group.*assignment\|addStudent" index.html
```

---

## 🧪 TESTING CHECKLIST

After wiring, test each email:

### Payment Receipt:
- [ ] Add payment via Gmail sync → Email sent?
- [ ] Add payment manually → Email sent?
- [ ] Quick add payment → Email sent?
- [ ] Check sent_emails table has entry
- [ ] Check notification appears

### Absence:
- [ ] Click absence emoji → Email sent?
- [ ] Mark absent from student grid → Email sent?
- [ ] No confirmation popup shown?

### Schedule Change:
- [ ] Change group schedule → Emails sent to all students?
- [ ] Only active students receive email?
- [ ] Old vs new schedule correct?

### Group Enrollment:
- [ ] Add new student to group → Email sent?
- [ ] Move student to different group → Email sent?
- [ ] Add student to multiple groups → Multiple emails sent?

---

## 📋 PRIORITY ORDER

1. **HIGH PRIORITY:** Payment Receipt (most common)
2. **MEDIUM PRIORITY:** Absence Notification (daily use)
3. **LOW PRIORITY:** Schedule Change (rare)
4. **LOW PRIORITY:** Group Enrollment (occasional)

---

**Last Updated:** November 18, 2025  
**Commit:** bae386a
