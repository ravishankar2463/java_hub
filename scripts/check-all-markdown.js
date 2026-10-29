const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('content');
let totalErrors = 0;

console.log(`Scanning ${files.length} markdown files in content/...`);

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const dollarMatches = [...content.matchAll(/\$[^$\n]+\$/g)];
  const headingMatches = [...content.matchAll(/^#{1,6}\s+\d+[\.\)]\s+.*$/gm)];

  if (dollarMatches.length > 0 || headingMatches.length > 0) {
    console.log(`\nIssues in ${f}:`);
    if (dollarMatches.length > 0) {
      console.log('  Dollar math:', dollarMatches.map(m => m[0]));
      totalErrors += dollarMatches.length;
    }
    if (headingMatches.length > 0) {
      console.log('  Numbered headings:', headingMatches.map(m => m[0]));
      totalErrors += headingMatches.length;
    }
  }
}

console.log(`\n========================================`);
console.log(`Scan Complete across ${files.length} files.`);
console.log(`Total Formatting Issues: ${totalErrors}`);
console.log(`========================================\n`);
