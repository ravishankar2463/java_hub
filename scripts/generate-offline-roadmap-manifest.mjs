import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOfflineRoadmapManifest } from "../lib/offline-roadmap-manifest.mjs";
import { getStaticBasePath } from "../lib/site-paths.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "out");

async function collectFiles(directory, relativeDirectory = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, relativePath)));
    } else if (entry.isFile()) {
      files.push({
        relativePath,
        content: await readFile(fullPath),
      });
    }
  }

  return files;
}

const entries = await collectFiles(outputDirectory);
const manifest = createOfflineRoadmapManifest(
  entries,
  getStaticBasePath(process.env)
);

await writeFile(
  path.join(outputDirectory, "offline-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);

console.info(
  `Generated offline manifest for ${manifest.topicCount} topics (${manifest.sizeBytes} bytes).`
);
