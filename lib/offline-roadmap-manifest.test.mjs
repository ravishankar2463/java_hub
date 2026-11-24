import assert from "node:assert/strict";
import { test } from "node:test";
import { createOfflineRoadmapManifest } from "./offline-roadmap-manifest.mjs";

const file = (relativePath, content) => ({
  relativePath,
  content: Buffer.from(content),
});

test("builds a base-path-safe bundle with topic pages, RSC payloads, and shared assets", () => {
  const manifest = createOfflineRoadmapManifest(
    [
      file("index.html", "roadmap home"),
      file("roadmap.html", "roadmap index"),
      file("roadmap/level-0/environment-setup.html", "topic html"),
      file("roadmap/level-0/environment-setup.txt", "topic rsc"),
      file(
        "roadmap/level-0/environment-setup/__next._full.txt",
        "nested topic payload"
      ),
      file("roadmap/__next._full.txt", "roadmap payload"),
      file("_next/static/chunks/app.js", "shared js"),
      file("icons/icon-192.png", "icon"),
      file("about.html", "online-only page"),
      file("general/article.html", "online-only article"),
    ],
    "/java_hub",
    1
  );

  assert.deepEqual(
    manifest.resources.map(({ url }) => url),
    [
      "/java_hub/",
      "/java_hub/about",
      "/java_hub/roadmap",
      "/java_hub/roadmap/__next._full.txt",
      "/java_hub/roadmap/level-0/environment-setup",
      "/java_hub/roadmap/level-0/environment-setup.txt",
      "/java_hub/roadmap/level-0/environment-setup/__next._full.txt",
      "/java_hub/_next/static/chunks/app.js",
      "/java_hub/icons/icon-192.png",
    ]
  );
  assert.equal(manifest.topicCount, 1);
  assert.equal(
    manifest.sizeBytes,
    Buffer.byteLength("roadmap home") +
      Buffer.byteLength("online-only page") +
      Buffer.byteLength("roadmap index") +
      Buffer.byteLength("topic html") +
      Buffer.byteLength("topic rsc") +
      Buffer.byteLength("nested topic payload") +
      Buffer.byteLength("roadmap payload") +
      Buffer.byteLength("shared js") +
      Buffer.byteLength("icon")
  );
});

test("changes the bundle version when an offline resource changes", () => {
  const before = createOfflineRoadmapManifest(
    [
      file("index.html", "home"),
      file("roadmap.html", "roadmap"),
      file("roadmap/level-0/topic.html", "old content"),
      file("roadmap/level-0/topic.txt", "old payload"),
    ],
    "",
    1
  );
  const after = createOfflineRoadmapManifest(
    [
      file("index.html", "home"),
      file("roadmap.html", "roadmap"),
      file("roadmap/level-0/topic.html", "new content"),
      file("roadmap/level-0/topic.txt", "new payload"),
    ],
    "",
    1
  );

  assert.notEqual(before.version, after.version);
});

test("includes the offline download and About pages with their route payloads", () => {
  const manifest = createOfflineRoadmapManifest(
    [
      file("index.html", "roadmap home"),
      file("roadmap.html", "roadmap index"),
      file("offline.html", "offline manager"),
      file("offline.txt", "offline manager payload"),
      file("offline/__next._full.txt", "offline route payload"),
      file("about.html", "about page"),
      file("about.txt", "about page payload"),
      file("about/__next._full.txt", "about route payload"),
      file("roadmap/level-0/topic.html", "topic html"),
      file("roadmap/level-0/topic.txt", "topic payload"),
    ],
    "/java_hub",
    1
  );

  assert.deepEqual(
    manifest.resources
      .map(({ url }) => url)
      .filter((url) => url.startsWith("/java_hub/offline")),
    [
      "/java_hub/offline",
      "/java_hub/offline.txt",
      "/java_hub/offline/__next._full.txt",
    ]
  );
  assert.deepEqual(
    manifest.resources
      .map(({ url }) => url)
      .filter((url) => url.startsWith("/java_hub/about")),
    [
      "/java_hub/about",
      "/java_hub/about.txt",
      "/java_hub/about/__next._full.txt",
    ]
  );
});

test("rejects a build whose topic page count differs from the expected roadmap", () => {
  assert.throws(
    () =>
      createOfflineRoadmapManifest(
        [
          file("index.html", "home"),
          file("roadmap.html", "roadmap"),
          file("roadmap/level-0/topic.html", "topic"),
        ],
        "",
        2
      ),
    /Expected 2 roadmap topics, found 1/
  );
});
