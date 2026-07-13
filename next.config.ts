import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let basePath = '';

if (isGithubActions) {
  // Dynamically extract the repository name from "owner/repo"
  const repo = process.env.GITHUB_REPOSITORY?.replace(/.*?\//, '') || '';
  basePath = `/${repo}`;
}

// Watch for changes in the content directory in development
if (process.env.NODE_ENV !== 'production') {
  try {
    const fs = require('fs');
    const path = require('path');
    let timeout: NodeJS.Timeout;
    
    fs.watch(path.join(process.cwd(), 'content'), { recursive: true }, (eventType: string, filename: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log(`[Content Watcher] Detected change in ${filename}, triggering fast refresh...`);
        // Touch lib/markdown.ts to trigger Next.js to recompile routes that depend on it
        const depPath = path.join(process.cwd(), 'lib', 'markdown.ts');
        if (fs.existsSync(depPath)) {
          const now = new Date();
          fs.utimesSync(depPath, now, now);
        }
      }, 100); // Debounce to prevent multiple triggers
    });
  } catch (e) {
    console.error('Failed to initialize content watcher:', e);
  }
}


const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: basePath,
};

export default nextConfig;
