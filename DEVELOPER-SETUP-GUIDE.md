# 🚀 ARNOMA Developer Setup Guide

**Complete Professional Development Environment** Last Updated: November 17,
2025

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Installed Extensions](#installed-extensions)
3. [Tool Usage Guide](#tool-usage-guide)
4. [Testing Workflows](#testing-workflows)
5. [Code Quality Checks](#code-quality-checks)
6. [API Testing](#api-testing)
7. [Debugging Techniques](#debugging-techniques)
8. [Best Practices](#best-practices)

---

## ⚡ Quick Start

### Prerequisites Installed

- ✅ Node.js & npm
- ✅ ESLint (configured)
- ✅ Prettier (configured)
- ✅ Cypress (installed)
- ✅ Lighthouse (installed globally)

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Verify installations
npx eslint --version
npx prettier --version
npx cypress verify

# 3. Open Cypress Test Runner
npx cypress open

# 4. Run Lighthouse audit
lighthouse https://arnoma.us --view
```

---

## 🔧 Installed Extensions

### ✅ Code Quality & Formatting

| Extension      | Purpose                                             | Keyboard Shortcut     |
| -------------- | --------------------------------------------------- | --------------------- |
| **ESLint**     | Detects errors, undefined variables, duplicates     | Auto-runs on save     |
| **Prettier**   | Auto-formats code (indentation, spacing, quotes)    | ⌘+S (format on save)  |
| **Error Lens** | Shows errors inline in code (red/yellow highlights) | Always visible        |
| **SonarLint**  | Deep bug detection, security issues, performance    | Auto-analyzes on save |

### 🎨 UI & Design Tools

| Extension            | Purpose                             | Usage                                  |
| -------------------- | ----------------------------------- | -------------------------------------- |
| **Color Highlight**  | Shows color previews inline         | Automatic                              |
| **CSS Peek**         | Jump to CSS definition              | Right-click class → "Go to Definition" |
| **HTML CSS Support** | Better autocomplete for CSS classes | Type in HTML                           |

### 🧪 Testing & Debugging

| Extension          | Purpose                              | Command                                    |
| ------------------ | ------------------------------------ | ------------------------------------------ |
| **Cypress Helper** | Cypress test autocomplete            | Open `.cy.js` files                        |
| **Live Server**    | Auto-reload on code changes          | Right-click HTML → "Open with Live Server" |
| **Thunder Client** | API testing (Postman inside VS Code) | Click ⚡ icon in sidebar                   |
| **REST Client**    | Test APIs with `.http` files         | Create `.http` file                        |

### 🔍 Development Helpers

| Extension              | Purpose                           | Keyboard Shortcut            |
| ---------------------- | --------------------------------- | ---------------------------- |
| **Path Intellisense**  | Autocomplete file paths           | Type `./` or `../`           |
| **Turbo Console Log**  | Auto-generate console.logs        | Select variable → Ctrl+Alt+L |
| **Code Spell Checker** | Catches typos in variable names   | Underlines misspelled words  |
| **GitLens**            | See who changed each line of code | Hover over line              |

---

## 📚 Tool Usage Guide

### 1️⃣ ESLint - Catch Errors Before They Break

**What it does:** Finds undefined variables, duplicates, broken logic

**How to use:**

```bash
# Check all JavaScript files
npx eslint .

# Fix auto-fixable issues
npx eslint . --fix
```

**Common errors it catches:**

- `'supabase' is not defined` → Add to globals in `eslint.config.js`
- `'students' is assigned but never used` → Remove or use the variable
- `Duplicate key 'id' in object` → Fix duplicate keys

---

### 2️⃣ Prettier - Auto-Format Code

**What it does:** Fixes indentation, spacing, quotes automatically

**How to use:**

```bash
# Format all files
npx prettier --write .

# Check formatting without changing files
npx prettier --check .
```

**Auto-formatting triggers:**

- Press `⌘+S` (Mac) or `Ctrl+S` (Windows) → Prettier runs automatically
- Paste code → Auto-formats on paste (enabled in settings)

**Configuration:** `.prettierrc.json`

- Single quotes for strings
- 2-space indentation
- Max line length: 100 characters (120 for HTML)

---

### 3️⃣ Cypress - End-to-End Testing

**What it does:** Tests your app like a real user (click buttons, fill forms,
verify results)

**How to use:**

```bash
# Open interactive test runner (recommended for development)
npx cypress open

# Run tests in headless mode (for CI/CD)
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/01-app-loads.cy.js"
```

**Test Files Created:**

1. `01-app-loads.cy.js` → Tests app initialization, Supabase connection, data
   loading
2. `02-student-management.cy.js` → Tests student CRUD operations, modals
3. `03-calendar.cy.js` → Tests calendar display, navigation, dots
4. `04-payment-system.cy.js` → Tests credit payments, balance tracking
5. `05-email-system.cy.js` → Tests email templates, sending
6. `06-class-management.cy.js` → Tests skip/cancel classes, payment forwarding

**Custom Commands:** `cypress/support/commands.js`

```javascript
cy.waitForApp(); // Wait for Supabase + data to load
cy.navigateTo('Students'); // Navigate to any view
cy.openStudentModal('John'); // Open student edit modal
cy.clickCalendarDate(15); // Click on calendar date
```

---

### 4️⃣ Lighthouse - Performance & Accessibility

**What it does:** Audits layout stability, load times, mobile responsiveness,
accessibility

**How to use:**

```bash
# Audit production site with report
lighthouse https://arnoma.us --view

# Audit with mobile emulation
lighthouse https://www.richyfesta.com --preset=mobile --view

# Save report as HTML
lighthouse https://arnoma.us --output html --output-path ./lighthouse-report.html
```

**What to check:**

- **Performance Score** → Target: 90+ (green)
- **Cumulative Layout Shift (CLS)** → Should be < 0.1
- **First Contentful Paint (FCP)** → Should be < 2 seconds
- **Accessibility Score** → Target: 95+ (check for missing alt tags, color
  contrast)

---

### 5️⃣ Thunder Client - API Testing

**What it does:** Test Supabase APIs, email endpoints, cloud functions

**How to use:**

1. Click ⚡ icon in VS Code sidebar
2. Click "New Request"
3. Enter URL: `https://[your-supabase-url].supabase.co/rest/v1/students`
4. Add headers:
   - `apikey`: Your Supabase anon key
   - `Authorization`: `Bearer [your-supabase-key]`
5. Click "Send"

**Common ARNOMA API tests:**

```http
# Get all students
GET https://[project].supabase.co/rest/v1/students?select=*

# Get student by ID
GET https://[project].supabase.co/rest/v1/students?id=eq.123

# Update student
PATCH https://[project].supabase.co/rest/v1/students?id=eq.123
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "new@email.com"
}

# Test email endpoint
POST https://[project].supabase.co/functions/v1/send-email
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "html": "<p>Test</p>"
}
```

---

### 6️⃣ Live Server - Auto-Reload Development

**What it does:** Opens your app in browser and auto-reloads when you save files

**How to use:**

1. Right-click `index.html`
2. Select "Open with Live Server"
3. Browser opens at `http://127.0.0.1:5500`
4. Edit code → Save → Page auto-reloads

**Benefits:**

- No manual refresh needed
- Instant feedback on changes
- Mobile view testing with responsive design mode

---

### 7️⃣ Turbo Console Log - Fast Debugging

**What it does:** Auto-generates console.log statements for selected variables

**How to use:**

1. Select a variable (e.g., `students`)
2. Press `Ctrl+Alt+L` (Windows) or `Ctrl+Option+L` (Mac)
3. Auto-generates: `console.log('students:', students)`

**Remove all logs:**

```javascript
// Press Ctrl+Alt+D to delete all Turbo Console Logs
```

---

### 8️⃣ Error Lens - Inline Error Display

**What it does:** Shows ESLint errors directly in your code (red/yellow text)

**Configuration:**

- **Red text** = Errors (will break your code)
- **Yellow text** = Warnings (should fix but won't break)
- **Delay:** 500ms (shows errors 0.5 seconds after you stop typing)

**How to disable temporarily:** Press `⌘+Shift+P` → Type "Error Lens: Toggle" →
Enter

---

### 9️⃣ GitLens - Git History Explorer

**What it does:** Shows who changed each line, when, and why

**How to use:**

- **Hover over any line** → See last commit that changed it
- **Click "GitLens" in sidebar** → Browse full commit history
- **Right-click file** → "Open File History" → See all changes over time

**Use cases:**

- "Who added this bug?" → GitLens shows the commit
- "Why was this changed?" → See commit message
- "When did payment forwarding logic change?" → File history

---

### 🔟 Code Spell Checker - Typo Prevention

**What it does:** Underlines misspelled words (variables, comments, strings)

**Custom dictionary:** `.vscode/settings.json`

```json
"cSpell.words": [
  "Supabase", "ARNOMA", "richyfesta", "arnoma",
  "timestamptz", "sweetalert", "dbsync"
]
```

**Ignore HTML attributes:**

```json
"cSpell.ignoreWords": ["onclick", "onerror", "onload"]
```

---

## 🧪 Testing Workflows

### Daily Development Testing

```bash
# 1. Check for ESLint errors
npx eslint .

# 2. Fix auto-fixable issues
npx eslint . --fix

# 3. Format code
npx prettier --write .

# 4. Run Cypress tests
npx cypress run

# 5. Check performance
lighthouse https://arnoma.us --view
```

### Before Committing Code

```bash
# 1. Lint and format
npx eslint . --fix && npx prettier --write .

# 2. Run all tests
npx cypress run

# 3. Check for errors
npx eslint .
```

### Before Deploying to Production

```bash
# 1. Full lint check
npx eslint .

# 2. Full Cypress test suite
npx cypress run

# 3. Lighthouse performance audit
lighthouse https://arnoma.us --view

# 4. Check for console errors in production
# Open browser DevTools → Console → Check for red errors
```

---

## ✅ Code Quality Checks

### ESLint Rules (Configured)

| Rule                | Level   | Description                    |
| ------------------- | ------- | ------------------------------ |
| `no-unused-vars`    | Warning | Unused variables detected      |
| `no-undef`          | Warning | Undefined variables detected   |
| `no-console`        | Off     | Console.log allowed            |
| `no-duplicate-case` | Error   | Duplicate switch cases blocked |
| `no-dupe-keys`      | Error   | Duplicate object keys blocked  |
| `no-empty`          | Warning | Empty blocks warned            |

### SonarLint Checks (Auto-enabled)

- Security vulnerabilities (SQL injection, XSS)
- Code smells (complex functions, duplicate code)
- Bugs (null pointer errors, type mismatches)
- Performance issues (inefficient loops, memory leaks)

---

## 🔌 API Testing Examples

### Test Supabase Connection

Create `tests/supabase-test.http`:

```http
### Get all students
GET https://[your-project].supabase.co/rest/v1/students?select=*
apikey: [your-anon-key]
Authorization: Bearer [your-anon-key]

### Get student by ID
GET https://[your-project].supabase.co/rest/v1/students?id=eq.1
apikey: [your-anon-key]
Authorization: Bearer [your-anon-key]

### Update student
PATCH https://[your-project].supabase.co/rest/v1/students?id=eq.1
Content-Type: application/json
apikey: [your-anon-key]
Authorization: Bearer [your-anon-key]

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}

### Test email function
POST https://[your-project].supabase.co/functions/v1/send-email
Content-Type: application/json
Authorization: Bearer [your-anon-key]

{
  "to": "test@example.com",
  "subject": "Test Email",
  "html": "<h1>Test</h1>"
}
```

**How to run:** Click "Send Request" above each `###` section

---

## 🐛 Debugging Techniques

### 1. Use Turbo Console Log

```javascript
// Select variable → Ctrl+Alt+L
const result = calculateTotal(students);
console.log('result:', result); // Auto-generated
```

### 2. Use Browser DevTools

```javascript
// Add debugger statement
function processPayment(student) {
  debugger; // Code pauses here
  const amount = student.credits * 10;
  return amount;
}
```

### 3. Use Cypress for Reproducible Bugs

```javascript
// Reproduce bug with automated test
it('should reproduce payment forwarding bug', () => {
  cy.visit('/');
  cy.clickCalendarDate(15);
  cy.contains('Cancel Class').click();
  cy.get('.payment-status').should('contain', 'Forwarded');
});
```

### 4. Use Thunder Client for API Errors

Test each Supabase endpoint independently to isolate issues.

---

## 🎯 Best Practices

### ✅ DO

- ✅ Format on save (Prettier auto-runs)
- ✅ Fix ESLint errors before committing
- ✅ Write Cypress tests for new features
- ✅ Use descriptive variable names (no `x`, `y`, `temp`)
- ✅ Add comments for complex logic
- ✅ Test on mobile + desktop (use Live Server + DevTools)
- ✅ Run Lighthouse before deploying

### ❌ DON'T

- ❌ Commit code with ESLint errors
- ❌ Push without running tests
- ❌ Use `var` (use `const` or `let`)
- ❌ Leave unused variables
- ❌ Hardcode API keys (use environment variables)
- ❌ Skip code reviews (use GitLens to track changes)

---

## 🚀 Quick Reference Commands

```bash
# Linting & Formatting
npx eslint .                    # Check for errors
npx eslint . --fix              # Auto-fix errors
npx prettier --write .          # Format all files
npx prettier --check .          # Check formatting

# Testing
npx cypress open                # Open Cypress UI
npx cypress run                 # Run tests headless
npx cypress run --spec "cypress/e2e/01-app-loads.cy.js"

# Performance
lighthouse https://arnoma.us --view
lighthouse https://arnoma.us --preset=mobile --view

# Development
# Right-click index.html → Open with Live Server
```

---

## 📞 Support

**Issues with tools?**

1. Check VS Code Output panel → Select extension from dropdown
2. Check Terminal for error messages
3. Restart VS Code: `⌘+Shift+P` → "Reload Window"
4. Check extension logs: View → Output → Select extension

**Need to update tools?**

```bash
npm update                      # Update npm packages
npm install -g lighthouse@latest  # Update Lighthouse
npx cypress verify              # Verify Cypress installation
```

---

## 🎓 Learning Resources

- **ESLint Rules:** https://eslint.org/docs/rules/
- **Prettier Options:** https://prettier.io/docs/en/options.html
- **Cypress Docs:** https://docs.cypress.io/
- **Lighthouse Scoring:** https://developer.chrome.com/docs/lighthouse/
- **Supabase API:** https://supabase.com/docs/reference/javascript/

---

**🎉 Your ARNOMA development environment is now fully configured!**

All tools are installed, configured, and ready to use. Happy coding! 🚀
