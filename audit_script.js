const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const email = fs.readFileSync('email-system-complete.html', 'utf8');

console.log('=== ARNOMA SYSTEM AUDIT ===\n');

// 1. Function declarations
const funcMatches = index.match(/(?:async\s+)?function\s+(\w+)\s*\(/g) || [];
const arrowFuncMatches = index.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/g) || [];
console.log(`📊 FUNCTION COUNT:`);
console.log(`  - Function declarations: ${funcMatches.length}`);
console.log(`  - Arrow functions: ${arrowFuncMatches.length}`);
console.log(`  - Total functions: ${funcMatches.length + arrowFuncMatches.length}\n`);

// 2. Event handlers
const onclickMatches = index.match(/onclick="[^"]*"/g) || [];
const onchangeMatches = index.match(/onchange="[^"]*"/g) || [];
const onsubmitMatches = index.match(/onsubmit="[^"]*"/g) || [];
console.log(`🔘 EVENT HANDLERS:`);
console.log(`  - onclick: ${onclickMatches.length}`);
console.log(`  - onchange: ${onchangeMatches.length}`);
console.log(`  - onsubmit: ${onsubmitMatches.length}`);
console.log(`  - Total: ${onclickMatches.length + onchangeMatches.length + onsubmitMatches.length}\n`);

// 3. Supabase operations
const supabaseReads = (index.match(/supabase\.from\([^)]+\)\.select/g) || []).length;
const supabaseInserts = (index.match(/supabase\.from\([^)]+\)\.insert/g) || []).length;
const supabaseUpserts = (index.match(/supabase\.from\([^)]+\)\.upsert/g) || []).length;
const supabaseUpdates = (index.match(/supabase\.from\([^)]+\)\.update/g) || []).length;
const supabaseDeletes = (index.match(/supabase\.from\([^)]+\)\.delete/g) || []).length;
console.log(`💾 SUPABASE OPERATIONS:`);
console.log(`  - Reads (.select): ${supabaseReads}`);
console.log(`  - Inserts: ${supabaseInserts}`);
console.log(`  - Upserts: ${supabaseUpserts}`);
console.log(`  - Updates: ${supabaseUpdates}`);
console.log(`  - Deletes: ${supabaseDeletes}`);
console.log(`  - Total DB operations: ${supabaseReads + supabaseInserts + supabaseUpserts + supabaseUpdates + supabaseDeletes}\n`);

// 4. localStorage operations
const localStorageGets = (index.match(/localStorage\.getItem/g) || []).length;
const localStorageSets = (index.match(/localStorage\.setItem/g) || []).length;
const localStorageRemoves = (index.match(/localStorage\.removeItem/g) || []).length;
console.log(`🗄️  LOCALSTORAGE OPERATIONS:`);
console.log(`  - Gets: ${localStorageGets}`);
console.log(`  - Sets: ${localStorageSets}`);
console.log(`  - Removes: ${localStorageRemoves}\n`);

// 5. Console statements
const consoleLogs = (index.match(/console\.log\(/g) || []).length;
const consoleErrors = (index.match(/console\.error\(/g) || []).length;
const consoleWarns = (index.match(/console\.warn\(/g) || []).length;
console.log(`🔍 CONSOLE STATEMENTS:`);
console.log(`  - console.log: ${consoleLogs}`);
console.log(`  - console.error: ${consoleErrors}`);
console.log(`  - console.warn: ${consoleWarns}`);
console.log(`  - Total: ${consoleLogs + consoleErrors + consoleWarns}\n`);

// 6. Potential issues
console.log(`⚠️  POTENTIAL ISSUES:`);
const debuggerStatements = (index.match(/debugger;/g) || []).length;
if (debuggerStatements > 0) console.log(`  - ${debuggerStatements} debugger statements found`);

const alertStatements = (index.match(/\balert\(/g) || []).length;
if (alertStatements > 0) console.log(`  - ${alertStatements} alert() statements found`);

const todoComments = (index.match(/\/\/ ?TODO|\/\* ?TODO/gi) || []).length;
if (todoComments > 0) console.log(`  - ${todoComments} TODO comments found`);

const fixmeComments = (index.match(/\/\/ ?FIXME|\/\* ?FIXME/gi) || []).length;
if (fixmeComments > 0) console.log(`  - ${fixmeComments} FIXME comments found`);

console.log(`\n✅ Audit complete!`);
