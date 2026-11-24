export const OFFLINE_CACHE_PREFIX = "javahub-roadmap-offline-";
export const OFFLINE_METADATA_CACHE = "javahub-roadmap-metadata-v1";
export const OFFLINE_ACTIVE_RECORD = "__javahub_offline_active__";
export const OFFLINE_PENDING_RECORD = "__javahub_offline_pending__";
export const OFFLINE_UPDATE_ERROR_RECORD = "__javahub_offline_update_error__";
export const OFFLINE_BUNDLE_MARKER = "__javahub_offline_complete__";
const MAX_OFFLINE_RESOURCES = 2000;

export function getAppScopedUrl(origin, basePath, relativePath) {
  const normalizedBasePath = basePath.replace(/\/+$/, "");
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");
  return new URL(
    normalizedRelativePath,
    `${origin}${normalizedBasePath}/`
  ).href;
}

export function getOfflineCacheName(version) {
  return `${OFFLINE_CACHE_PREFIX}${version}`;
}

export function parseOfflineRoadmapManifest(
  value,
  origin,
  basePath,
  expectedTopicCount = 116
) {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof value.version !== "string" ||
    !/^[a-f0-9]{16}$/.test(value.version) ||
    value.topicCount !== expectedTopicCount ||
    !Number.isSafeInteger(value.sizeBytes) ||
    value.sizeBytes < 0 ||
    value.sizeBytes > 200 * 1024 * 1024 ||
    !Array.isArray(value.resources) ||
    value.resources.length > MAX_OFFLINE_RESOURCES
  ) {
    throw new Error("Offline manifest has an invalid shape");
  }

  const normalizedBasePath = basePath.replace(/\/+$/, "");
  const urls = new Set();
  const topicPages = new Set();
  const topicPayloads = new Set();
  let totalSize = 0;

  for (const resource of value.resources) {
    if (
      typeof resource !== "object" ||
      resource === null ||
      typeof resource.url !== "string" ||
      !Number.isSafeInteger(resource.size) ||
      resource.size < 0 ||
      resource.size > 100 * 1024 * 1024
    ) {
      throw new Error("Offline manifest contains an invalid resource");
    }

    let url;
    try {
      url = new URL(resource.url, origin);
    } catch {
      throw new Error("Offline manifest contains an invalid resource URL");
    }

    if (
      url.origin !== origin ||
      !url.pathname.startsWith(`${normalizedBasePath}/`) ||
      url.search ||
      url.hash ||
      urls.has(url.href)
    ) {
      throw new Error("Offline manifest contains an out-of-scope resource");
    }
    urls.add(url.href);
    totalSize += resource.size;

    const appPath = url.pathname.slice(normalizedBasePath.length) || "/";
    if (
      /^\/roadmap\/level-\d+\/[^/]+$/.test(appPath) &&
      !appPath.endsWith(".txt")
    ) {
      topicPages.add(appPath);
    } else if (/^\/roadmap\/level-\d+\/[^/]+\.txt$/.test(appPath)) {
      topicPayloads.add(appPath.slice(0, -".txt".length));
    }
  }

  const rootUrl = new URL(`${normalizedBasePath}/`, origin).href;
  const roadmapUrl = new URL(`${normalizedBasePath}/roadmap`, origin).href;
  if (
    !urls.has(rootUrl) ||
    !urls.has(roadmapUrl) ||
    topicPages.size !== expectedTopicCount ||
    topicPayloads.size !== expectedTopicCount ||
    [...topicPages].some((topic) => !topicPayloads.has(topic)) ||
    totalSize !== value.sizeBytes
  ) {
    throw new Error("Offline manifest is incomplete or inconsistent");
  }

  return value;
}
