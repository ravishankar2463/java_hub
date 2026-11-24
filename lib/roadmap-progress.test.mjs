import assert from "node:assert/strict";
import { test } from "node:test";
import {
  markRoadmapTopicVisited,
  readRoadmapProgress,
} from "./roadmap-progress.ts";

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test("records the latest topic and keeps each visited topic once", () => {
  const storage = new MemoryStorage();

  markRoadmapTopicVisited(storage, "level-0/first-topic");
  markRoadmapTopicVisited(storage, "level-1/second-topic");
  markRoadmapTopicVisited(storage, "level-0/first-topic");

  assert.deepEqual(readRoadmapProgress(storage), {
    lastOpenedTopic: "level-0/first-topic",
    visitedTopics: ["level-0/first-topic", "level-1/second-topic"],
  });
});

test("returns empty progress when stored data is malformed", () => {
  const storage = new MemoryStorage();
  storage.setItem("javahub-roadmap-progress-v1", "{invalid");

  assert.deepEqual(readRoadmapProgress(storage), {
    lastOpenedTopic: null,
    visitedTopics: [],
  });
});

test("ignores an empty topic identifier", () => {
  const storage = new MemoryStorage();

  assert.deepEqual(markRoadmapTopicVisited(storage, "  "), {
    lastOpenedTopic: null,
    visitedTopics: [],
  });
});
