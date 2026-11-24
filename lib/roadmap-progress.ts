export type RoadmapProgress = {
  lastOpenedTopic: string | null;
  visitedTopics: string[];
};

export const ROADMAP_PROGRESS_STORAGE_KEY = "javahub-roadmap-progress-v1";

const EMPTY_PROGRESS: RoadmapProgress = {
  lastOpenedTopic: null,
  visitedTopics: [],
};

function isRoadmapProgress(value: unknown): value is RoadmapProgress {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const progress = value as Record<string, unknown>;
  return (
    (typeof progress.lastOpenedTopic === "string" ||
      progress.lastOpenedTopic === null) &&
    Array.isArray(progress.visitedTopics) &&
    progress.visitedTopics.every((topic) => typeof topic === "string")
  );
}

export function parseRoadmapProgress(
  storedProgress: string | null
): RoadmapProgress {
  if (!storedProgress) {
    return { ...EMPTY_PROGRESS };
  }

  let parsedProgress: unknown;
  try {
    parsedProgress = JSON.parse(storedProgress);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ...EMPTY_PROGRESS };
    }
    throw error;
  }

  if (!isRoadmapProgress(parsedProgress)) {
    return { ...EMPTY_PROGRESS };
  }

  return {
    lastOpenedTopic: parsedProgress.lastOpenedTopic,
    visitedTopics: [...new Set(parsedProgress.visitedTopics.filter(Boolean))],
  };
}

export function readRoadmapProgress(
  storage: Pick<Storage, "getItem">
): RoadmapProgress {
  return parseRoadmapProgress(storage.getItem(ROADMAP_PROGRESS_STORAGE_KEY));
}

export function markRoadmapTopicVisited(
  storage: Pick<Storage, "getItem" | "setItem">,
  topicId: string
): RoadmapProgress {
  const normalizedTopicId = topicId.trim();
  const progress = readRoadmapProgress(storage);

  if (!normalizedTopicId) {
    return progress;
  }

  const updatedProgress = {
    lastOpenedTopic: normalizedTopicId,
    visitedTopics: progress.visitedTopics.includes(normalizedTopicId)
      ? progress.visitedTopics
      : [...progress.visitedTopics, normalizedTopicId],
  };
  storage.setItem(ROADMAP_PROGRESS_STORAGE_KEY, JSON.stringify(updatedProgress));

  return updatedProgress;
}
