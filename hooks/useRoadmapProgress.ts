"use client";

import { useSyncExternalStore } from "react";
import {
  parseRoadmapProgress,
  ROADMAP_PROGRESS_STORAGE_KEY,
} from "@/lib/roadmap-progress";

export const ROADMAP_PROGRESS_CHANGE_EVENT = "javahub-roadmap-progress-change";

const EMPTY_PROGRESS_SNAPSHOT = JSON.stringify({
  lastOpenedTopic: null,
  visitedTopics: [],
});

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ROADMAP_PROGRESS_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ROADMAP_PROGRESS_CHANGE_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(ROADMAP_PROGRESS_STORAGE_KEY) ??
      EMPTY_PROGRESS_SNAPSHOT;
  } catch {
    return undefined;
  }
}

function getServerSnapshot() {
  return EMPTY_PROGRESS_SNAPSHOT;
}

export function useRoadmapProgress() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    progress: snapshot === undefined ? null : parseRoadmapProgress(snapshot),
    storageAvailable: snapshot !== undefined,
  };
}
