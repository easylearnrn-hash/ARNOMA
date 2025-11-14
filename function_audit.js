const fs = require('fs');
const index = fs.readFileSync('index.html', 'utf8');

console.log('=== FUNCTION AUDIT ===\n');

// Extract all function definitions
const functionDefs = new Set();
const asyncFunctionRegex = /(?:async\s+)?function\s+(\w+)\s*\(/g;
const arrowFunctionRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
const methodRegex = /(\w+):\s*(?:async\s+)?function\s*\(/g;

let match;
while ((match = asyncFunctionRegex.exec(index)) !== null) {
  functionDefs.add(match[1]);
}
while ((match = arrowFunctionRegex.exec(index)) !== null) {
  functionDefs.add(match[1]);
}
while ((match = methodRegex.exec(index)) !== null) {
  functionDefs.add(match[1]);
}

console.log(`📋 Total unique functions defined: ${functionDefs.size}`);

// Find all function calls
const functionCalls = new Set();
const callRegex = /(\w+)\(/g;
while ((match = callRegex.exec(index)) !== null) {
  functionCalls.add(match[1]);
}

// Find potentially orphaned functions (defined but never called)
const orphaned = [];
for (const func of functionDefs) {
  // Skip if it's a common built-in or appears in onclick/onchange attributes
  if (!functionCalls.has(func) && 
      !index.includes(`onclick="${func}`) &&
      !index.includes(`onchange="${func}`) &&
      !index.includes(`oninput="${func}`) &&
      !index.includes(`window.${func}`) &&
      !index.includes(`addEventListener`) &&
      func.length > 2) {  // Skip very short names likely to be false positives
    orphaned.push(func);
  }
}

console.log(`\n⚠️ Potentially orphaned functions (${orphaned.length}):`);
if (orphaned.length > 0) {
  orphaned.slice(0, 20).forEach(f => console.log(`  - ${f}`));
  if (orphaned.length > 20) console.log(`  ... and ${orphaned.length - 20} more`);
}

// Find duplicate function definitions
const duplicates = [];
const seen = new Map();
const defRegex = /(?:async\s+)?function\s+(\w+)\s*\(/g;
while ((match = defRegex.exec(index)) !== null) {
  const name = match[1];
  if (seen.has(name)) {
    duplicates.push(name);
  } else {
    seen.set(name, true);
  }
}

if (duplicates.length > 0) {
  console.log(`\n🔄 Duplicate function definitions (${duplicates.length}):`);
  [...new Set(duplicates)].forEach(f => console.log(`  - ${f}`));
} else {
  console.log(`\n✅ No duplicate function definitions found`);
}

