import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let basePath = '';

if (isGithubActions) {
  // Dynamically extract the repository name from "owner/repo"
  const repo = process.env.GITHUB_REPOSITORY?.replace(/.*?\//, '') || '';
  basePath = `/${repo}`;
}

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: basePath,
};

export default nextConfig;
