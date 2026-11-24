import { createHash } from "node:crypto";
import path from "node:path";

const MAX_OFFLINE_RESOURCES = 2000;

function normalizeBasePath(basePath) {
  const normalized = basePath.trim().replace(/\/+$/, "");
  if (!normalized || normalized === "/") {
    return "";
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function getPublicPath(relativePath) {
  if (relativePath === "index.html") {
    return "/";
  }
  if (relativePath === "roadmap.html" || relativePath === "roadmap/index.html") {
    return "/roadmap";
  }
  if (relativePath === "offline.html" || relativePath === "offline/index.html") {
    return "/offline";
  }
  if (relativePath.endsWith(".html")) {
    return `/${relativePath.slice(0, -".html".length)}`;
  }
  return `/${relativePath}`;
}

function getResourceGroup(relativePath) {
  if (relativePath === "index.html" || relativePath === "roadmap.html" ||
      relativePath === "roadmap/index.html" ||
      relativePath === "offline.html" ||
      relativePath === "offline/index.html" ||
      relativePath === "index.txt" ||
      relativePath === "roadmap.txt" ||
      relativePath === "offline.txt") {
    return 0;
  }
  if (/^(roadmap|offline)\/__next\..+\.txt$/.test(relativePath)) {
    return 1;
  }
  if (/^roadmap\/level-\d+\/.+\.html$/.test(relativePath)) {
    return 2;
  }
  if (/^roadmap\/level-\d+\/.+\.txt$/.test(relativePath)) {
    return 3;
  }
  return 4;
}

function isIncluded(relativePath) {
  return (
    relativePath === "index.html" ||
    relativePath === "roadmap.html" ||
    relativePath === "roadmap/index.html" ||
    relativePath === "offline.html" ||
    relativePath === "offline/index.html" ||
    relativePath === "index.txt" ||
    relativePath === "roadmap.txt" ||
    relativePath === "offline.txt" ||
    (/^roadmap\/level-\d+\/.+\.(html|txt)$/.test(relativePath)) ||
    (/^(roadmap|offline)\//.test(relativePath) &&
      relativePath.endsWith(".txt")) ||
    relativePath.startsWith("_next/static/") ||
    relativePath.startsWith("icons/") ||
    relativePath === "sw.js" ||
    relativePath === "manifest.webmanifest"
  );
}

export function createOfflineRoadmapManifest(
  entries,
  basePath = "",
  expectedTopicCount = 116
) {
  const normalizedBasePath = normalizeBasePath(basePath);
  const resourcesByUrl = new Map();
  const digest = createHash("sha256");

  const normalizedEntries = entries
    .map(({ relativePath, content }) => ({
      relativePath: path.posix.normalize(relativePath.replace(/\\/g, "/")),
      content: Buffer.from(content),
    }))
    .filter(({ relativePath }) => isIncluded(relativePath))
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  for (const { relativePath, content } of normalizedEntries) {
    const url = `${normalizedBasePath}${getPublicPath(relativePath)}` || "/";
    if (resourcesByUrl.has(url)) {
      continue;
    }

    resourcesByUrl.set(url, {
      url,
      size: content.byteLength,
      group: getResourceGroup(relativePath),
    });
    digest.update(url);
    digest.update("\0");
    digest.update(content);
  }

  const topicCount = normalizedEntries.filter(({ relativePath }) =>
    /^roadmap\/level-\d+\/.+\.html$/.test(relativePath)
  ).length;
  const topicPayloadCount = normalizedEntries.filter(({ relativePath }) =>
    /^roadmap\/level-\d+\/[^/]+\.txt$/.test(relativePath)
  ).length;

  if (topicCount !== expectedTopicCount) {
    throw new Error(
      `Expected ${expectedTopicCount} roadmap topics, found ${topicCount}`
    );
  }
  if (topicPayloadCount !== topicCount) {
    throw new Error(
      `Expected ${topicCount} roadmap topic payloads, found ${topicPayloadCount}`
    );
  }

  const resources = [...resourcesByUrl.values()]
    .sort((left, right) =>
      left.group - right.group || left.url.localeCompare(right.url)
    )
    .map(({ url, size }) => ({ url, size }));

  if (resources.length > MAX_OFFLINE_RESOURCES) {
    throw new Error(
      `Offline resource count exceeds the ${MAX_OFFLINE_RESOURCES}-file limit`
    );
  }

  if (
    !resources.some(({ url }) => url === `${normalizedBasePath}/`) ||
    !resources.some(({ url }) => url === `${normalizedBasePath}/roadmap`)
  ) {
    throw new Error("The offline bundle must include the home and roadmap pages");
  }

  return {
    version: digest.digest("hex").slice(0, 16),
    topicCount,
    sizeBytes: resources.reduce((total, resource) => total + resource.size, 0),
    resources,
  };
}
