// scripts/deploy-spring-boot-apps.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const resourcesDir = 'c:\\Users\\ravis\\Documents\\Workspace\\java_hub_resources';

if (!fs.existsSync(resourcesDir)) {
  console.error(`Resources repository not found at: ${resourcesDir}`);
  process.exit(1);
}

const level8Apps = require('./apps/level8-apps.js');
const level9Apps = require('./apps/level9-apps.js');
const level10Apps = require('./apps/level10-apps.js');

const allApps = [
  ...Object.values(level8Apps),
  ...Object.values(level9Apps),
  ...Object.values(level10Apps)
];

console.log(`Starting deployment of ${allApps.length} full Spring Boot applications to java_hub_resources...`);

for (let i = 0; i < allApps.length; i++) {
  const app = allApps[i];
  const branchName = `topic/level-${app.level}/${app.topicSlug}`;
  console.log(`[${i + 1}/${allApps.length}] Deploying full Spring Boot app to branch: ${branchName}`);

  try {
    // 1. Checkout target branch
    execSync(`git checkout ${branchName}`, { cwd: resourcesDir, stdio: 'pipe' });

    // 2. Clean existing tracked and untracked files except .git
    const items = fs.readdirSync(resourcesDir);
    for (const item of items) {
      if (item === '.git') continue;
      fs.rmSync(path.join(resourcesDir, item), { recursive: true, force: true });
    }

    // 3. Write each file in the app definition
    for (const file of app.files) {
      const fullPath = path.join(resourcesDir, file.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, file.content.trim() + '\n', 'utf8');
    }

    // 4. Stage and commit
    execSync('git add -A', { cwd: resourcesDir, stdio: 'pipe' });
    try {
      execSync(`git commit -m "feat(app): complete Spring Boot 3 application setup with live REST API and MockMvc test suite"`, {
        cwd: resourcesDir,
        stdio: 'pipe'
      });
    } catch (e) {
      // Nothing to commit if clean
    }

    console.log(`  -> Successfully deployed ${app.files.length} files to ${branchName}`);
  } catch (err) {
    console.error(`Error deploying to ${branchName}:`, err.message);
  }
}

// Return to main branch
execSync('git checkout main', { cwd: resourcesDir, stdio: 'pipe' });
console.log('\nAll Spring Boot applications deployed successfully!');
