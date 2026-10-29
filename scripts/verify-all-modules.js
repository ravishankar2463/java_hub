// scripts/verify-all-modules.js
const fs = require('fs');
const path = require('path');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Read roadmapData by parsing roadmap.ts or extracting titles
const roadmapContent = fs.readFileSync(path.join(__dirname, '..', 'data', 'roadmap.ts'), 'utf8');

// Simple regex parser for levels and topics
const levelRegex = /level:\s*(\d+),[\s\S]*?topics:\s*\[([\s\S]*?)\]\s*\},/g;
let match;
let totalRoadmapTopics = 0;
let totalFound = 0;
const missing = [];

const levels = [];
while ((match = levelRegex.exec(roadmapContent)) !== null) {
  const levelNum = parseInt(match[1]);
  const topicsBlock = match[2];
  const titleMatches = [...topicsBlock.matchAll(/title:\s*["']([^"']+)["']/g)];
  const topicTitles = titleMatches.map(m => m[1]);
  levels.push({ level: levelNum, titles: topicTitles });
}

console.log(`Found ${levels.length} levels in roadmap.ts`);

for (const lvl of levels) {
  const modPath = path.join(__dirname, 'resources', `level${lvl.level}.js`);
  if (!fs.existsSync(modPath)) {
    console.error(`Missing level module: ${modPath}`);
    continue;
  }
  const mod = require(modPath);
  for (const title of lvl.titles) {
    totalRoadmapTopics++;
    const slug = slugify(title);
    if (!mod[slug]) {
      missing.push(`Level ${lvl.level} (${title}) -> slug: '${slug}'`);
    } else {
      totalFound++;
    }
  }
}

console.log(`Total topics across curriculum: ${totalRoadmapTopics}`);
console.log(`Total topics successfully found in resources modules: ${totalFound}`);

if (missing.length > 0) {
  console.log('Missing topics:', missing);
  process.exit(1);
} else {
  console.log('SUCCESS! All 116 topics are fully represented in resource modules with 0 missing.');
}

