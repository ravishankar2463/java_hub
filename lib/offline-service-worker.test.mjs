import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { test } from "node:test";

const serviceWorkerSource = await readFile(
  fileURLToPath(new URL("../public/sw.js", import.meta.url)),
  "utf8"
);

async function getCachedOfflineResponse(requestPath, cachedPath) {
  const origin = "https://example.test";
  const scope = `${origin}/java_hub/`;
  const activeRecord = new Response(JSON.stringify({ version: "offline-test" }));
  const cachedPage = new Response("cached roadmap page");
  const cachedUrl = new URL(cachedPath, origin).href;
  const handlers = new Map();
  const contentCache = {
    async match(request) {
      const requestUrl = typeof request === "string" ? request : request.url;
      return requestUrl === cachedUrl ? cachedPage.clone() : null;
    },
  };
  const metadataCache = {
    async match() {
      return activeRecord.clone();
    },
  };

  vm.runInNewContext(serviceWorkerSource, {
    URL,
    Request,
    Response,
    caches: {
      open: async (name) =>
        name === "javahub-roadmap-metadata-v1"
          ? metadataCache
          : contentCache,
    },
    console,
    fetch: async () => {
      throw new TypeError("Network unavailable");
    },
    self: {
      location: new URL(origin),
      registration: { scope },
      addEventListener(type, handler) {
        handlers.set(type, handler);
      },
    },
  });

  let responsePromise;
  handlers.get("fetch")({
    request: new Request(new URL(requestPath, origin)),
    respondWith(response) {
      responsePromise = Promise.resolve(response);
    },
  });

  return responsePromise;
}

test("serves the cached roadmap when the base-path root URL omits its slash", async () => {
  const response = await getCachedOfflineResponse(
    "/java_hub",
    "/java_hub/"
  );

  assert.equal(await response.text(), "cached roadmap page");
});

test("serves cached route pages when a static host adds a trailing slash", async () => {
  const response = await getCachedOfflineResponse(
    "/java_hub/roadmap/",
    "/java_hub/roadmap"
  );

  assert.equal(await response.text(), "cached roadmap page");
});
