import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAppScopedUrl,
  getOfflineCacheName,
  parseOfflineRoadmapManifest,
} from "./offline-roadmap-storage.mjs";

test("keeps app storage URLs inside the GitHub Pages base path", () => {
  assert.equal(
    getAppScopedUrl("https://example.test", "/java_hub", "offline-manifest.json"),
    "https://example.test/java_hub/offline-manifest.json"
  );
});

test("uses a versioned cache name for each complete offline bundle", () => {
  assert.equal(getOfflineCacheName("a1b2c3"), "javahub-roadmap-offline-a1b2c3");
});

test("rejects a manifest that points outside the current app origin and scope", () => {
  assert.throws(
    () =>
      parseOfflineRoadmapManifest(
        {
          version: "0123456789abcdef",
          topicCount: 1,
          sizeBytes: 0,
          resources: [
            { url: "https://example.test/java_hub/", size: 0 },
            { url: "https://example.test/java_hub/roadmap", size: 0 },
            {
              url: "https://example.test/java_hub/roadmap/level-0/topic",
              size: 0,
            },
            {
              url: "https://attacker.test/java_hub/roadmap/level-0/topic",
              size: 0,
            },
            {
              url: "https://example.test/java_hub/roadmap/level-0/topic.txt",
              size: 0,
            },
          ],
        },
        "https://example.test",
        "/java_hub",
        1
      ),
    /Offline manifest contains an out-of-scope resource/
  );
});

test("accepts nested Next.js payloads without counting them as extra topics", () => {
  const manifest = {
    version: "0123456789abcdef",
    topicCount: 1,
    sizeBytes: 0,
    resources: [
      { url: "https://example.test/java_hub/", size: 0 },
      { url: "https://example.test/java_hub/roadmap", size: 0 },
      {
        url: "https://example.test/java_hub/roadmap/level-0/topic",
        size: 0,
      },
      {
        url: "https://example.test/java_hub/roadmap/level-0/topic.txt",
        size: 0,
      },
      {
        url: "https://example.test/java_hub/roadmap/level-0/topic/__next._full.txt",
        size: 0,
      },
    ],
  };

  assert.equal(
    parseOfflineRoadmapManifest(
      manifest,
      "https://example.test",
      "/java_hub",
      1
    ),
    manifest
  );
});

test("accepts an offline bundle containing all generated static assets", () => {
  const resources = [
    { url: "https://example.test/", size: 0 },
    { url: "https://example.test/roadmap", size: 0 },
  ];
  for (let index = 0; index < 116; index += 1) {
    const topic = `/roadmap/level-0/topic-${index}`;
    resources.push(
      { url: `https://example.test${topic}`, size: 0 },
      { url: `https://example.test${topic}.txt`, size: 0 }
    );
  }
  for (let index = 0; index < 1001; index += 1) {
    resources.push({
      url: `https://example.test/_next/static/chunks/${index}.js`,
      size: 0,
    });
  }

  assert.equal(resources.length, 1235);
  assert.doesNotThrow(() =>
    parseOfflineRoadmapManifest(
      {
        version: "0123456789abcdef",
        topicCount: 116,
        sizeBytes: 0,
        resources,
      },
      "https://example.test",
      ""
    )
  );
});
