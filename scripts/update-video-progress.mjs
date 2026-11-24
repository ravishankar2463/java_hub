import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { roadmapData } from "../data/roadmap.ts";
import { slugify } from "../utils/slugify.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(REPO_ROOT, "data", "chapter-videos.json");
const OUTPUT_PATH = path.join(REPO_ROOT, "VIDEO_PROGRESS.md");
const BLOB_BASE =
  "https://github.com/ravishankar2463/java_hub_resources/blob/main/videos";

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
const videos = Array.isArray(manifest.videos) ? manifest.videos : [];

const videosByChapter = new Map();
for (const video of videos) {
  const list = videosByChapter.get(video.chapterId) ?? [];
  list.push(video);
  videosByChapter.set(video.chapterId, list);
}
for (const list of videosByChapter.values()) {
  list.sort((a, b) => a.partNumber - b.partNumber);
}

let totalChapters = 0;
let completedChapters = 0;

const sections = [];

for (const level of roadmapData) {
  const levelSlug = `level-${level.level}`;
  let levelCompleted = 0;
  const topicLines = [];

  for (const topic of level.topics) {
    totalChapters++;
    const topicSlug = slugify(topic.title);
    const chapterId = `${levelSlug}/${topicSlug}`;
    const chapterVideos = videosByChapter.get(chapterId);

    if (chapterVideos && chapterVideos.length > 0) {
      completedChapters++;
      levelCompleted++;
      const links = chapterVideos
        .map((v) => {
          const url = v.videoUrl || `${BLOB_BASE}/${v.file}`;
          const secs = Math.round(v.durationSec);
          return `[Part ${v.partNumber} (${secs}s)](${url})`;
        })
        .join(" · ");
      const unit = chapterVideos.length === 1 ? "Short" : "Shorts";
      topicLines.push(
        `- [x] **${topic.title}** (${chapterId}) — ${chapterVideos.length} ${unit}: ${links}`
      );
    } else {
      topicLines.push(`- [ ] **${topic.title}** (${chapterId})`);
    }
  }

  sections.push(
    `## ${level.title} (${levelCompleted}/${level.topics.length})\n\n${topicLines.join("\n")}`
  );
}

const pct =
  totalChapters > 0
    ? ((completedChapters / totalChapters) * 100).toFixed(1)
    : "0.0";
const lastUpdated = (manifest.updatedAt || new Date().toISOString()).slice(0, 10);

const markdown = [
  "# JavaHub Short Summary Videos — Progress Tracker",
  "",
  `Tracks progress of converting all **${totalChapters} JavaHub chapters** into multi-part **9:16 vertical YouTube Shorts** hosted on [java_hub_resources GitHub Releases](https://github.com/ravishankar2463/java_hub_resources/releases) and embedded on each chapter page.`,
  "",
  "See [VIDEO_GUIDE.md](./VIDEO_GUIDE.md) for the exact workflow, beat types, and rendering commands.",
  "",
  "## Overall Progress",
  "",
  `- **Chapters Completed:** ${completedChapters} / ${totalChapters} (${pct}%)`,
  `- **Total Shorts Rendered:** ${videos.length}`,
  `- **Last Updated:** ${lastUpdated}`,
  "",
  "---",
  "",
  sections.join("\n\n"),
  "",
].join("\n");

fs.writeFileSync(OUTPUT_PATH, markdown, "utf-8");
console.log(
  `Updated VIDEO_PROGRESS.md: ${completedChapters}/${totalChapters} chapters (${pct}%), ${videos.length} Shorts.`
);
