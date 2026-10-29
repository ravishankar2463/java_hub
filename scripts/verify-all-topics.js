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

// Convert roadmap.ts into JSON by stripping interfaces and exporting
const content = fs.readFileSync('data/roadmap.ts', 'utf8');
const lines = content.split('\n');
let inRoadmapData = false;
let currentLevel = null;
let currentTopic = null;

const allTopics = [];

for (const line of lines) {
  const levelMatch = line.match(/^\s*level:\s*(\d+)/);
  if (levelMatch) {
    currentLevel = parseInt(levelMatch[1]);
  }
  const titleMatch = line.match(/^\s*title:\s*"([^"]+)"/);
  if (titleMatch && !line.includes('Level ' + currentLevel)) {
    // This is a topic title
    allTopics.push({
      level: currentLevel,
      title: titleMatch[1],
      slug: slugify(titleMatch[1])
    });
  }
}

let missing = 0;
let placeholderCount = 0;

for (const t of allTopics) {
  const filePath = path.join('content', 'roadmap', `level-${t.level}`, `${t.slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.log(`[MISSING] Level ${t.level}: ${t.title} -> ${filePath}`);
    missing++;
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    if (fileContent.includes('Content for this topic is currently being developed')) {
      console.log(`[PLACEHOLDER] Level ${t.level}: ${t.title} -> ${filePath}`);
      placeholderCount++;
    }
  }
}

console.log(`\n========================================`);
console.log(`Total Topics in roadmap: ${allTopics.length}`);
console.log(`Missing Files: ${missing}`);
console.log(`Placeholder Files: ${placeholderCount}`);
console.log(`Complete Topics: ${allTopics.length - missing - placeholderCount}`);
console.log(`========================================\n`);
