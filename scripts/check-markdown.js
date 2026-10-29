const fs = require('fs');
const file = process.argv[2] || 'content/roadmap/level-5/thread-safety-and-synchronization.md';
const content = fs.readFileSync(file, 'utf8');

const dollarMatches = [...content.matchAll(/\$[^$\n]+\$/g)];
if (dollarMatches.length > 0) {
  console.log('Found dollar math:', dollarMatches.map(m => m[0]));
} else {
  console.log('No dollar math found!');
}

const headingMatches = [...content.matchAll(/^#{1,6}\s+\d+[\.\)]\s+.*$/gm)];
if (headingMatches.length > 0) {
  console.log('Found numbered headings:', headingMatches.map(m => m[0]));
} else {
  console.log('No numbered headings found!');
}
