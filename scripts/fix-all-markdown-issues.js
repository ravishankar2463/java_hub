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

const files = walk('content/roadmap');
let fixedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Fix numbered headings: e.g. "### 1. Foo" -> "### Foo"
  // But be careful not to touch code comments like "# 1. Foo" if inside a code block,
  // or replace them safely so they don't look like markdown headings.
  content = content.replace(/^(#{1,6})\s+\d+[\.\)]\s+(.*)$/gm, (match, hashes, title) => {
    return `${hashes} ${title}`;
  });

  // 2. Specific file fixes
  if (file.includes('intro-to-oops.md')) {
    content = content.replace(/\$" \+ amount \+ "\. New balance: \$"/g, 'USD " + amount + ". New balance: USD "');
  }

  if (file.includes('advanced-class-design.md')) {
    content = content.replace(/this\$0/g, 'this_0');
  }

  if (file.includes('encapsulation-access-modifiers.md')) {
    content = content.replace(/Outer\$Inner/g, 'Outer_Inner');
    content = content.replace(/access\$000/g, 'access_000');
  }

  if (file.includes('lambdas-and-functional-interfaces.md')) {
    content = content.replace(/\$\$Lambda\$1/g, '__Lambda_1');
    content = content.replace(/lambda\$main\$0/g, 'lambda_main_0');
    content = content.replace(/lambda\$0/g, 'lambda_0');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    fixedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`\nFinished updating ${fixedFiles} files.`);
