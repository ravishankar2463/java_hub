// scripts/deploy-rich-resources.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const resourcesDir = 'c:\\Users\\ravis\\Documents\\Workspace\\java_hub_resources';

if (!fs.existsSync(resourcesDir)) {
  console.error(`Resources repository not found at: ${resourcesDir}`);
  process.exit(1);
}

console.log('Starting deployment of rich Java 21 implementations to java_hub_resources...');

let processedCount = 0;
let successCount = 0;

for (let lvl = 0; lvl <= 15; lvl++) {
  const levelModPath = path.join(__dirname, 'resources', `level${lvl}.js`);
  if (!fs.existsSync(levelModPath)) {
    console.error(`Missing level module: ${levelModPath}`);
    continue;
  }
  const levelMod = require(levelModPath);

  for (const [slug, topicData] of Object.entries(levelMod.topics)) {
    const branchName = `topic/level-${lvl}/${slug}`;
    console.log(`[${++processedCount}/116] Processing branch: ${branchName} (${topicData.className})`);

    const javaSource = topicData.code || topicData.source;
    const javaTest = topicData.testCode || topicData.test;
    const readme = topicData.readmeContent || `# ${topicData.className}

${topicData.description || 'Hands-on Java 21 Laboratory'}

## Architectural Overview
This companion laboratory provides an authentic, runnable Java 21 implementation and automated JUnit 5 / AssertJ test suite.

## Running Tests Locally
\`\`\`bash
mvn clean test
\`\`\`
`;

    if (!javaSource || !javaTest) {
      console.error(`Branch ${branchName} missing source or test code!`);
      continue;
    }

    try {
      // Checkout target branch
      execSync(`git checkout ${branchName}`, { cwd: resourcesDir, stdio: 'pipe' });

      // Clean src/main/java and src/test/java to remove stale placeholder classes
      const mainBase = path.join(resourcesDir, 'src', 'main', 'java');
      const testBase = path.join(resourcesDir, 'src', 'test', 'java');
      if (fs.existsSync(mainBase)) fs.rmSync(mainBase, { recursive: true, force: true });
      if (fs.existsSync(testBase)) fs.rmSync(testBase, { recursive: true, force: true });

      // Determine directory paths from package declarations
      const packageMatch = javaSource.match(/package\s+([a-zA-Z0-9_.]+);/);
      const pkgPath = packageMatch ? packageMatch[1].replace(/\./g, path.sep) : `io${path.sep}javahub${path.sep}level${lvl}`;

      const testPackageMatch = javaTest.match(/package\s+([a-zA-Z0-9_.]+);/);
      const testPkgPath = testPackageMatch ? testPackageMatch[1].replace(/\./g, path.sep) : pkgPath;

      const mainJavaDir = path.join(resourcesDir, 'src', 'main', 'java', pkgPath);
      const testJavaDir = path.join(resourcesDir, 'src', 'test', 'java', testPkgPath);
      fs.mkdirSync(mainJavaDir, { recursive: true });
      fs.mkdirSync(testJavaDir, { recursive: true });

      // Write domain Java class
      const mainFile = path.join(mainJavaDir, `${topicData.className}.java`);
      fs.writeFileSync(mainFile, javaSource.trim() + '\n', 'utf8');

      // Write test Java class
      const testFile = path.join(testJavaDir, `${topicData.className}Test.java`);
      fs.writeFileSync(testFile, javaTest.trim() + '\n', 'utf8');

      // Write README
      const readmeFile = path.join(resourcesDir, 'README.md');
      fs.writeFileSync(readmeFile, readme.trim() + '\n', 'utf8');

      // Stage and commit
      execSync('git add -A', { cwd: resourcesDir, stdio: 'pipe' });
      try {
        execSync(`git commit -m "feat(lab): implement authentic Java 21 ${topicData.className} and JUnit 5 test suite"`, {
          cwd: resourcesDir,
          stdio: 'pipe'
        });
      } catch (err) {
        // clean working tree, no diff
      }
      successCount++;
    } catch (err) {
      console.error(`Error processing branch ${branchName}:`, err.message);
    }
  }
}

// Return to main
execSync('git checkout main', { cwd: resourcesDir, stdio: 'pipe' });
console.log(`\nSuccessfully processed and committed ${successCount}/${processedCount} branches!`);
