# Timer and Quick View Logic Documentation

## Overview
The timer has two separate calculation paths based on timezone mode (EVN/LA). Each mode reads from different data sources to ensure accuracy.

---

## Quick View Logic

### Quick View Yerevan Tab
Located at lines ~9965-10020 in index.html

```javascript
// BY WEEKDAY (YEREVAN) VIEW
// Calculate next weekday helper
function getNextWeekday(weekday, offset) {
  const weekdayIndex = {
    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
    'Friday': 4, 'Saturday': 5, 'Sunday': 6
  };
  const indexToDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const currentIndex = weekdayIndex[weekday];
  if (currentIndex === undefined) return weekday;
  
  const newIndex = (currentIndex + offset + 7) % 7;
  return indexToDay[newIndex];
}

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayMap = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
const daySchedule = {};

// Parse all schedules and organize by ACTUAL Yerevan day (not LA day)
groupsData.forEach(group => {
  const scheduleText = (group.schedule || '').trim();
  if (!scheduleText) return;
  
  const parts = scheduleText.split(',').map(p => p.trim()).filter(p => p);
  parts.forEach(part => {
    const match = part.match(/^([\w/]+)\s+(.+)$/);
    if (!match) return;
    
    const daysStr = match[1].toLowerCase();
    const laTime = match[2];
    const laTimeAMPM = ensureAMPMFormat(laTime);
    const conversionResult = convertLATimeToYerevan(laTimeAMPM, true); // Get day shift info
    
    // Handle slash-separated days: "mon/wed"
    const dayTokens = daysStr.split('/').map(d => d.trim());
    dayTokens.forEach(token => {
      const laWeekday = dayMap[token]; // Original LA weekday
      if (!laWeekday) return;
      
      // Calculate actual Yerevan weekday based on day shift
      const yerevanWeekday = getNextWeekday(laWeekday, conversionResult.dayShift);
      
      if (!daySchedule[yerevanWeekday]) daySchedule[yerevanWeekday] = [];
      daySchedule[yerevanWeekday].push({ 
        group: escapeHtml(group.name), 
        yerevanTime: escapeHtml(conversionResult.time),
        laTime: escapeHtml(laTimeAMPM)
      });
    });
  });
});

// Then renders daySchedule by weekday
weekdays.forEach(day => {
  if (daySchedule[day]) {
    html += `<div class="qv-day-section">`;
    html += `<h3 class="qv-day-title">${day}</h3>`;
    
    daySchedule[day].forEach(entry => {
      html += `
        <div class="qv-class-badge">
          <strong>${entry.group}</strong> — ${entry.yerevanTime} (Yerevan)
          <span class="qv-la-time">(${entry.laTime} Los Angeles Time)</span>
        </div>
      `;
    });
    
    html += `</div>`;
  }
});
```

### Key Points:
- **Input**: Calendar schedule string (e.g., "Wed 8:00 PM")
- **Process**: 
  1. Parse LA day and time
  2. Convert LA time to Yerevan time
  3. Calculate day shift (e.g., Wed 8PM LA → Thu 8AM Yerevan = +1 day)
  4. Store in `daySchedule[yerevanDay]`
- **Output**: Organized by Yerevan weekday with both Yerevan and LA times

---

## Timer Logic

### Architecture Split (lines ~10945-10965)

```javascript
// Get all classes for the next 7 days
function getAllUpcomingClasses() {
  try {
    // CRITICAL FORK: Different data sources based on timezone mode
    if (timerTimeZone === 'EVN') {
      return getAllUpcomingClassesYerevan();
    } else {
      return getAllUpcomingClassesLA();
    }
  } catch (error) {
    console.error('[ClassCountdownTimer] Error getting all classes:', error);
    return [];
  }
}
```

---

## EVN Mode Timer Logic

### 1. Get Classes from Quick View Yerevan (lines ~10530-10600)

```javascript
// Helper function to get classes from Quick View Yerevan tab data
function getClassesFromQuickViewYerevan() {
  const classes = [];
  const groups = getAllGroups();
  if (!groups || groups.length === 0) return classes;
  
  const dayMap = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  const daySchedule = {};
  
  // Parse schedules exactly like Quick View does
  groups.forEach(group => {
    const scheduleText = (group.schedule || '').trim();
    if (!scheduleText) return;
    
    const parts = scheduleText.split(',').map(p => p.trim()).filter(p => p);
    parts.forEach(part => {
      const match = part.match(/^([\w/]+)\s+(.+)$/);
      if (!match) return;
      
      const daysStr = match[1].toLowerCase();
      const laTime = match[2];
      const laTimeAMPM = ensureAMPMFormatLocal(laTime);
      const conversionResult = TimezoneUtils.convertLATimeToYerevan(laTimeAMPM);
      
      // Handle slash-separated days
      const dayTokens = daysStr.split('/').map(d => d.trim());
      dayTokens.forEach(token => {
        const laWeekday = dayMap[token];
        if (!laWeekday) return;
        
        // Calculate Yerevan weekday with day shift
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayIndex = dayNames.indexOf(laWeekday);
        const yerevanDayIndex = (dayIndex + conversionResult.dayShift + 7) % 7;
        const yerevanWeekday = dayNames[yerevanDayIndex];
        
        if (!daySchedule[yerevanWeekday]) daySchedule[yerevanWeekday] = [];
        daySchedule[yerevanWeekday].push({
          group: group.name,
          yerevanTime: conversionResult.time,
          laTime: laTimeAMPM,
          day: yerevanWeekday
        });
      });
    });
  });
  
  // Convert to array format
  Object.keys(daySchedule).forEach(day => {
    daySchedule[day].forEach(session => {
      classes.push({
        groupName: session.group,
        dayName: day,
        time: session.yerevanTime,
        laTime: session.laTime
      });
    });
  });
  
  return classes;
}
```

### 2. Calculate Countdown in Yerevan Time (lines ~10967-11045)

```javascript
// Get classes using Yerevan timezone (reads from Quick View Yerevan data)
function getAllUpcomingClassesYerevan() {
  const allClasses = [];
  
  // Get current time in Yerevan
  const timezone = 'Asia/Yerevan';
  const nowTime = TimezoneUtils.getCurrentTimeInZone(timezone);
  if (!nowTime) return [];
  
  const currentTimeInSeconds = nowTime.hours * 3600 + nowTime.minutes * 60 + nowTime.seconds;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Get classes from Quick View Yerevan structure
  const yerevanClasses = getClassesFromQuickViewYerevan();
  
  // Check each day for the next 7 days
  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + daysAhead);
    const checkDayName = checkDate.toLocaleString('en-US', { 
      timeZone: timezone, 
      weekday: 'long' 
    });
    
    yerevanClasses.forEach(classData => {
      if (classData.dayName !== checkDayName) return;
      
      // Parse time
      const match = classData.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) return;
      
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const classTimeInSeconds = hours * 3600 + minutes * 60;
      
      let totalDiffSeconds;
      if (daysAhead === 0) {
        totalDiffSeconds = classTimeInSeconds - currentTimeInSeconds;
      } else {
        totalDiffSeconds = (daysAhead * 86400) - currentTimeInSeconds + classTimeInSeconds;
      }
      
      // Skip if more than 2 hours past
      if (totalDiffSeconds >= -7200 && totalDiffSeconds <= 604800) {
        allClasses.push({
          groupName: classData.groupName,
          dayName: classData.dayName,
          laTime: classData.laTime,
          yerevanTime: classData.time,
          secondsRemaining: totalDiffSeconds
        });
      }
    });
  }
  
  // Sort by time remaining and remove duplicates
  allClasses.sort((a, b) => a.secondsRemaining - b.secondsRemaining);
  
  const uniqueClasses = [];
  const seen = new Set();
  allClasses.forEach(c => {
    const key = `${c.groupName}-${c.dayName}-${c.yerevanTime}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueClasses.push(c);
    }
  });
  
  return uniqueClasses.slice(0, 10);
}
```

### EVN Mode Flow:
1. **Get Yerevan Classes**: `getClassesFromQuickViewYerevan()` parses schedules like Quick View
2. **Get Current Yerevan Time**: `TimezoneUtils.getCurrentTimeInZone('Asia/Yerevan')`
3. **Loop Next 7 Days**: For each day, check if it matches class day
4. **Calculate Countdown**: Compare class time vs current time (both in Yerevan timezone)
5. **Return**: Classes with `yerevanTime` already set

### Example (EVN Mode):
```
Calendar: "Wed 8:00 PM"
↓ (getClassesFromQuickViewYerevan)
Yerevan Schedule: Thursday 8:00 AM
↓
Current Yerevan Time: Thursday 4:00 AM
Class Yerevan Time: Thursday 8:00 AM
↓
Countdown: 4h 0m ✅
```

---

## LA Mode Timer Logic

### Get Classes in LA Time (lines ~11047+)

```javascript
// Get classes using LA timezone (original calendar data)
function getAllUpcomingClassesLA() {
  try {
    const allClasses = [];
    
    // Load groups from Supabase cache or global groups variable
    const groups = window.groupsCache || window.globalData?.groups || [];
    
    if (!groups || groups.length === 0) {
      debug('[ClassCountdownTimer] No groups found in cache');
      return [];
    }

    debug('[ClassCountdownTimer] Found', groups.length, 'groups');

    // CRITICAL: Calendar times are ALWAYS stored in LA timezone
    const timezone = 'America/Los_Angeles';
    const nowTime = TimezoneUtils.getCurrentTimeInZone(timezone);
    const timezoneOffset = TimezoneUtils.getTimezoneOffset(timezone);
    
    debug('[ClassCountdownTimer] Current time (' + timezone + '):', nowTime.toLocaleString(), '(UTC offset:', timezoneOffset, 'hours)');
    
    // Get current time in seconds since midnight
    const currentTimeInSeconds = nowTime.hours * 3600 + nowTime.minutes * 60 + nowTime.seconds;
    
    // Check each day for the next 7 days
    for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
      const checkDayIndex = (nowTime.getDay() + daysAhead) % 7;
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const checkDayName = dayNames[checkDayIndex];

      groups.forEach(group => {
        let sessions = [];

        // Parse schedule string: "Mon/Wed 8:00 AM, Fri 9:00 AM"
        if (typeof group.schedule === 'string') {
          // Calendar stores LA times, so just parse directly - NO CONVERSION
          sessions = parseScheduleString(group.schedule);
        } else if (Array.isArray(group.sessions)) {
          sessions = group.sessions
            .filter(s => s && s.day && s.time)
            .map(s => ({
              day: s.day,
              time: ensureAMPMFormatLocal(s.time)
            }));
        }

        if (!sessions.length) return;
        
        sessions.forEach(session => {
          if (session.day !== checkDayName) return;

          // Parse time
          const match = session.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (!match) return;

          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const period = match[3].toUpperCase();

          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          const classTimeInSeconds = hours * 3600 + minutes * 60;
          
          let totalDiffSeconds;
          if (daysAhead === 0) {
            totalDiffSeconds = classTimeInSeconds - currentTimeInSeconds;
          } else {
            totalDiffSeconds = (daysAhead * 86400) - currentTimeInSeconds + classTimeInSeconds;
          }

          // Skip if more than 2 hours past
          if (totalDiffSeconds >= -7200 && totalDiffSeconds <= 604800) {
            allClasses.push({
              groupName: group.name,
              dayName: session.day,
              laTime: session.time,
              secondsRemaining: totalDiffSeconds
            });
          }
        });
      });
    }

    // Sort and deduplicate
    allClasses.sort((a, b) => a.secondsRemaining - b.secondsRemaining);
    
    const uniqueClasses = [];
    const seen = new Set();
    allClasses.forEach(c => {
      const key = `${c.groupName}-${c.dayName}-${c.laTime}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueClasses.push(c);
      }
    });

    return uniqueClasses.slice(0, 10);
  } catch (error) {
    console.error('[ClassCountdownTimer] Error getting all classes:', error);
    return [];
  }
}
```

### LA Mode Flow:
1. **Get Current LA Time**: `TimezoneUtils.getCurrentTimeInZone('America/Los_Angeles')`
2. **Parse Calendar Schedule**: Read "Wed 8:00 PM" directly (no conversion)
3. **Loop Next 7 Days**: For each day, check if it matches class day
4. **Calculate Countdown**: Compare class time vs current time (both in LA timezone)
5. **Return**: Classes with `laTime` set

### Example (LA Mode):
```
Calendar: "Wed 8:00 PM"
↓ (no conversion)
LA Schedule: Wednesday 8:00 PM
↓
Current LA Time: Wednesday 4:00 PM
Class LA Time: Wednesday 8:00 PM
↓
Countdown: 4h 0m ✅
```

---

## Display Logic (lines ~11150+)

```javascript
let html = '';
allClasses.forEach((classData, index) => {
  // For EVN mode, yerevanTime is already in classData
  // For LA mode, convert it
  let yerevanData;
  if (timerTimeZone === 'EVN') {
    yerevanData = {
      time: classData.yerevanTime || classData.laTime,
      day: classData.dayName
    };
  } else {
    yerevanData = convertLAToYerevanTime(classData.laTime, classData.dayName);
  }
  
  const countdown = formatCountdown(classData.secondsRemaining);
  
  // ... (build HTML card) ...
  
  html += `
    <div class="timer-class-item">
      <div class="timer-class-header">
        <span class="timer-class-group">${classData.groupName}</span>
        <span class="timer-class-countdown">${countdown}</span>
      </div>
      <div class="timer-class-details">
        ${timerTimeZone === 'EVN' ? `
        <span class="timer-class-day">${yerevanData.day}</span>
        <span class="timer-class-separator">•</span>
        <span class="timer-class-time">${yerevanData.time} Yerevan</span>
        <span class="timer-class-separator">•</span>
        <span class="timer-class-time-secondary">${classData.laTime} LA</span>
        ` : `
        <span class="timer-class-day">${classData.dayName}</span>
        <span class="timer-class-separator">•</span>
        <span class="timer-class-time">${classData.laTime} LA</span>
        <span class="timer-class-separator">•</span>
        <span class="timer-class-time-secondary">${yerevanData.time} Yerevan</span>
        `}
      </div>
    </div>
  `;
});
```

### Display Format:
- **EVN Mode**: `Thursday • 8:00 AM Yerevan • 8:00 PM LA`
- **LA Mode**: `Wednesday • 8:00 PM LA • 8:00 AM Yerevan`

---

## Timezone Utilities (lines ~10387-10430)

```javascript
getCurrentTimeInZone(timezone) {
  // USE NATIVE BROWSER TIMEZONE - Simple and reliable
  const timeStr = new Date().toLocaleString("en-US", { 
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Parse: "MM/DD/YYYY, HH:mm:ss"
  const match = timeStr.match(/(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/);
  if (!match) {
    console.error('[TimezoneUtils] Parse failed:', timeStr);
    return null;
  }
  
  const [_, month, day, year, hours, minutes, seconds] = match.map(n => parseInt(n));
  
  // Get day of week
  const dayOfWeek = new Date().toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long'
  });
  
  return {
    hours,
    minutes,
    seconds,
    day,
    month,
    year,
    dayOfWeek,
    getDay() { 
      const date = new Date(this.year, this.month - 1, this.day);
      return date.getDay();
    },
    toLocaleString() {
      return `${this.month}/${this.day}/${this.year}, ${String(this.hours).padStart(2, '0')}:${String(this.minutes).padStart(2, '0')}:${String(this.seconds).padStart(2, '0')}`;
    }
  };
}

convertLATimeToYerevan(laTimeStr) {
  if (!laTimeStr) return { time: '', dayShift: 0 };
  
  const match = laTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return { time: laTimeStr, dayShift: 0 };
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  // Convert to 24-hour
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  // DST detection
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const isDST = now.getTimezoneOffset() < stdOffset;
  
  // LA: UTC-8 (PST) or UTC-7 (PDT)
  // Yerevan: UTC+4 (year-round, no DST)
  // Difference: 12 hours (PST) or 11 hours (PDT)
  const offsetHours = isDST ? 11 : 12;
  
  let yerevanHours = hours + offsetHours;
  let dayShift = 0;
  
  if (yerevanHours >= 24) {
    yerevanHours -= 24;
    dayShift = 1;
  }
  
  // Convert back to 12-hour
  let yerevanPeriod = 'AM';
  let displayHours = yerevanHours;
  
  if (yerevanHours >= 12) {
    yerevanPeriod = 'PM';
    if (yerevanHours > 12) displayHours = yerevanHours - 12;
  }
  if (yerevanHours === 0) displayHours = 12;
  
  return {
    time: `${displayHours}:${minutes} ${yerevanPeriod}`,
    dayShift: dayShift
  };
}
```

---

## 🚨 CRITICAL RULE - MANDATORY FOR DEVELOPERS

### THE TIMER MUST NEVER RE-CONVERT TIMES THAT QUICK VIEW ALREADY CONVERTED

**This is the root cause of the "wrong day, wrong time, inverted values" bug.**

### ❌ What MUST NEVER Happen in EVN Mode:

1. **Do not shift the EVN day again** - Quick View already calculated Thursday from Wednesday
2. **Do not recalculate the offset (11/12 hours)** - Quick View already applied it
3. **Do not convert EVN back to LA then back to EVN** - This causes double conversion
4. **Do not rebuild the timestamp manually** - Use Quick View's processed data
5. **Do not apply dayShift a second time** - It was already applied once

### ✔️ What MUST Happen in EVN Mode:

1. Timer reads the **exact Yerevan day and time** from `getClassesFromQuickViewYerevan()`
2. Timer gets **current time in Asia/Yerevan** only once
3. Timer calculates: `secondsRemaining = EVN_Class_Time - EVN_Current_Time`
4. **Nothing more.**

### 🔴 Real Example from Bug Report:

**Calendar Data:**
```
Group A: Wednesday 8:00 PM LA
```

**Quick View Yerevan (CORRECT):**
```
Thursday • 8:00 AM Yerevan • (8:00 PM Los Angeles Time)
```
✅ Correctly shows next day (Thursday) because 8 PM Wed LA becomes 8 AM Thu Yerevan

**Timer BEFORE Fix (WRONG - Double Conversion Bug):**
```
Tomorrow • 8:00 AM LA • 8:00 PM Yerevan
```
❌ Shows "8:00 AM LA" (wrong - should be 8:00 PM LA)
❌ Shows "8:00 PM Yerevan" (wrong - should be 8:00 AM Yerevan)
❌ Shows "Tomorrow" when current EVN time is Thursday 4:00 AM and class is Thursday 8:00 AM (should show "Today, 4h 0m")

**What Caused the Bug:**
```
Step 1: Calendar stores "Wed 8:00 PM LA"
Step 2: Quick View converts → "Thu 8:00 AM EVN" ✅ (correct)
Step 3: Timer takes "Thu 8:00 AM EVN" and converts AGAIN ❌ (wrong!)
Step 4: Timer shifts day again → "Fri" instead of "Thu"
Step 5: Timer inverts LA/EVN times → wrong display
Result: Countdown shows 16h instead of 4h
```

**Timer AFTER Fix (CORRECT):**
```
Thursday • 8:00 AM Yerevan • 8:00 PM LA
```
✅ Shows correct Yerevan day (Thursday)
✅ Shows correct Yerevan time (8:00 AM)
✅ Shows correct LA reference time (8:00 PM)
✅ Shows correct countdown (4h 0m when current time is Thursday 4:00 AM EVN)

**How the Fix Works:**
```javascript
// EVN Mode - NO CONVERSION, just read and compare
const yerevanClasses = getClassesFromQuickViewYerevan(); // Already has Thu 8:00 AM
const currentYerevanTime = getCurrentTimeInZone('Asia/Yerevan'); // Thu 4:00 AM
const countdown = classTime - currentTime; // 8:00 - 4:00 = 4h ✅
```

---

## 🚨 FINAL MANDATORY DEVELOPER NOTE

**The Quick View Yerevan already contains the final, correct schedule for Yerevan.**

When the timer is in EVN mode, it must:
- ✅ Use Quick View Yerevan data directly, without changing it
- ✅ Compare EVN current time to EVN class time
- ❌ NEVER recalculate LA↔EVN
- ❌ NEVER apply dayShift again
- ❌ NEVER re-convert times
- ❌ NEVER rebuild timestamps

**Think of it this way:**
- **Quick View Yerevan = The Single Source of Truth**
- **Timer EVN Mode = A countdown display for that truth**
- **Timer only needs:** Current time, Class time, Subtract

**No conversion. No processing. No day shifts. Just compare and countdown.**

---

## Summary

### Data Flow Comparison

**Quick View Yerevan Tab:**
```
Calendar Data → Parse Schedule → Convert LA→Yerevan → Apply Day Shift → Render by Yerevan Day
```

**Timer EVN Mode:**
```
Calendar Data → getClassesFromQuickViewYerevan() → Parse Schedule → Convert LA→Yerevan → Apply Day Shift
→ getAllUpcomingClassesYerevan() → Get Current Yerevan Time → Compare → Calculate Countdown
```

**Timer LA Mode:**
```
Calendar Data → getAllUpcomingClassesLA() → Parse Schedule (no conversion) → Get Current LA Time 
→ Compare → Calculate Countdown
```

### Key Principle:
- **Quick View = Source of Truth for schedule data**
- **Timer EVN Mode = Replicates Quick View Yerevan logic + adds countdown**
- **Timer LA Mode = Uses calendar LA data directly + adds countdown**
- **No double conversion** - Timer in EVN mode reads from the same processed data that Quick View Yerevan displays
