const OFFLINE_CACHE_PREFIX = "javahub-roadmap-offline-";
const METADATA_CACHE = "javahub-roadmap-metadata-v1";
const ACTIVE_KEY = "__javahub_offline_active__";
const PENDING_KEY = "__javahub_offline_pending__";
const UPDATE_ERROR_KEY = "__javahub_offline_update_error__";
const BUNDLE_MARKER = "__javahub_offline_complete__";

function metadataUrl(key) {
  return new URL(key, self.registration.scope);
}

async function readRecord(cache, key) {
  const response = await cache.match(metadataUrl(key));
  return response ? response.json() : null;
}

async function prepareOfflineUpdate() {
  const metadataCache = await caches.open(METADATA_CACHE);
  const active = await readRecord(metadataCache, ACTIVE_KEY);
  if (!active) {
    return;
  }

  await metadataCache.delete(metadataUrl(PENDING_KEY));

  try {
    const manifestUrl = new URL("offline-manifest.json", self.registration.scope);
    const manifestResponse = await fetch(manifestUrl);
    if (!manifestResponse.ok) {
      throw new Error(`Offline manifest request failed: ${manifestResponse.status}`);
    }

    const manifest = await manifestResponse.json();
    if (manifest.version === active.version) {
      await metadataCache.delete(metadataUrl(UPDATE_ERROR_KEY));
      return;
    }

    const cacheName = `${OFFLINE_CACHE_PREFIX}${manifest.version}`;
    const contentCache = await caches.open(cacheName);
    const controller = new AbortController();

    try {
      let nextIndex = 0;
      const downloadWorker = async () => {
        while (!controller.signal.aborted) {
          const index = nextIndex++;
          if (index >= manifest.resources.length) {
            return;
          }

          try {
            const resource = manifest.resources[index];
            const url = new URL(resource.url, self.location.origin);
            if (
              url.origin !== self.location.origin ||
              !url.href.startsWith(self.registration.scope)
            ) {
              throw new Error(`Offline resource is outside the app scope: ${url.href}`);
            }

            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
              throw new Error(`Offline resource request failed: ${url.pathname}`);
            }
            await contentCache.put(url, response);
          } catch (error) {
            controller.abort();
            throw error;
          }
        }
      };
      const results = await Promise.allSettled(
        Array.from(
          { length: Math.min(6, manifest.resources.length) },
          downloadWorker
        )
      );
      const failedWorker = results.find((result) => result.status === "rejected");
      if (failedWorker) {
        throw failedWorker.reason;
      }

      await contentCache.put(manifestUrl, manifestResponse.clone());
      await contentCache.put(
        metadataUrl(BUNDLE_MARKER),
        new Response(JSON.stringify(manifest))
      );
      await metadataCache.put(
        metadataUrl(PENDING_KEY),
        new Response(JSON.stringify({
          version: manifest.version,
          topicCount: manifest.topicCount,
          sizeBytes: manifest.sizeBytes,
        }))
      );
      await metadataCache.delete(metadataUrl(UPDATE_ERROR_KEY));
    } catch (error) {
      controller.abort();
      await caches.delete(cacheName);
      throw error;
    }
  } catch (error) {
    await metadataCache.put(
      metadataUrl(UPDATE_ERROR_KEY),
      new Response(JSON.stringify({
        message: error instanceof Error ? error.message : "Offline update failed",
      }))
    );
    console.error("JavaHub could not update the offline roadmap cache.", error);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(prepareOfflineUpdate());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const metadataCache = await caches.open(METADATA_CACHE);
    const pending = await metadataCache.match(metadataUrl(PENDING_KEY));
    if (pending) {
      await metadataCache.put(metadataUrl(ACTIVE_KEY), pending);
      await metadataCache.delete(metadataUrl(PENDING_KEY));
    }

    const active = await readRecord(metadataCache, ACTIVE_KEY);
    const activeCacheName = active
      ? `${OFFLINE_CACHE_PREFIX}${active.version}`
      : null;
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) =>
          name.startsWith(OFFLINE_CACHE_PREFIX) && name !== activeCacheName
        )
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith((async () => {
    try {
      if (request.mode === "navigate") {
        return await fetch(request, { cache: "no-cache" });
      }
      return await fetch(request);
    } catch (networkError) {
      const metadataCache = await caches.open(METADATA_CACHE);
      const active = await readRecord(metadataCache, ACTIVE_KEY);
      if (!active) {
        throw networkError;
      }

      const contentCache = await caches.open(
        `${OFFLINE_CACHE_PREFIX}${active.version}`
      );
      const cachedResponse = await contentCache.match(request, {
        ignoreSearch: true,
      });
      if (cachedResponse) {
        return cachedResponse;
      }

      const requestUrl = new URL(request.url);
      const scopePath = new URL(self.registration.scope).pathname;
      let alternatePath = null;
      if (requestUrl.pathname === scopePath) {
        alternatePath = scopePath.slice(0, -1);
      } else if (requestUrl.pathname === scopePath.slice(0, -1)) {
        alternatePath = scopePath;
      } else if (requestUrl.pathname.startsWith(scopePath)) {
        alternatePath = requestUrl.pathname.endsWith("/")
          ? requestUrl.pathname.slice(0, -1)
          : `${requestUrl.pathname}/`;
      }

      if (alternatePath) {
        requestUrl.pathname = alternatePath;
        const alternateResponse = await contentCache.match(requestUrl.href, {
          ignoreSearch: true,
        });
        if (alternateResponse) {
          return alternateResponse;
        }
      }

      throw networkError;
    }
  })());
});
