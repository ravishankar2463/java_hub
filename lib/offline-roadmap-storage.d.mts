export const OFFLINE_CACHE_PREFIX: string;
export const OFFLINE_METADATA_CACHE: string;
export const OFFLINE_ACTIVE_RECORD: string;
export const OFFLINE_PENDING_RECORD: string;
export const OFFLINE_UPDATE_ERROR_RECORD: string;
export const OFFLINE_BUNDLE_MARKER: string;

export function getAppScopedUrl(
  origin: string,
  basePath: string,
  relativePath: string
): string;

export function getOfflineCacheName(version: string): string;

export type OfflineRoadmapResource = {
  url: string;
  size: number;
};

export type OfflineRoadmapManifest = {
  version: string;
  topicCount: number;
  sizeBytes: number;
  resources: OfflineRoadmapResource[];
};

export function parseOfflineRoadmapManifest(
  value: unknown,
  origin: string,
  basePath: string,
  expectedTopicCount?: number
): OfflineRoadmapManifest;
