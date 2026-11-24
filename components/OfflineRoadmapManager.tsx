"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, HardDriveDownload, RefreshCw, Share } from "lucide-react";
import {
  OFFLINE_ACTIVE_RECORD,
  OFFLINE_BUNDLE_MARKER,
  OFFLINE_CACHE_PREFIX,
  OFFLINE_METADATA_CACHE,
  OFFLINE_UPDATE_ERROR_RECORD,
  getAppScopedUrl,
  getOfflineCacheName,
  parseOfflineRoadmapManifest,
} from "@/lib/offline-roadmap-storage.mjs";
import type { OfflineRoadmapManifest } from "@/lib/offline-roadmap-storage.mjs";
import { useOfflineRoadmap } from "@/components/OfflineRoadmapProvider";

type DownloadState =
  | "idle"
  | "confirm-download"
  | "downloading"
  | "cancelled"
  | "error"
  | "confirm-remove";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function subscribeToInstalledState(callback: () => void) {
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", callback);
  window.addEventListener("appinstalled", callback);
  return () => {
    displayMode.removeEventListener("change", callback);
    window.removeEventListener("appinstalled", callback);
  };
}

function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true)
  );
}

function isIOSDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function subscribeToNoChanges() {
  return () => {};
}

function formatBytes(bytes: number): string {
  if (bytes < 1_000_000) {
    return `${Math.ceil(bytes / 1_000)} KB`;
  }
  return `${(bytes / 1_000_000).toFixed(0)} MB`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

function InstallOptions() {
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);
  const isInstalled = useSyncExternalStore(
    subscribeToInstalledState,
    isStandaloneApp,
    () => false
  );
  const isIOS = useSyncExternalStore(
    subscribeToNoChanges,
    isIOSDevice,
    () => false
  );
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      if (!("prompt" in event) || typeof event.prompt !== "function") {
        return;
      }
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const promptToInstall = async () => {
    if (!installPrompt) {
      return;
    }

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch (error) {
      setInstallError(errorMessage(error));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
          Install JavaHub
        </h3>
        {isInstalled ? (
          <span className="text-sm text-emerald-800 dark:text-emerald-300">
            Already installed on this device
          </span>
        ) : installPrompt ? (
          <button
            type="button"
            onClick={promptToInstall}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-600/30 px-4 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-500/10 dark:text-emerald-300"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Install app
          </button>
        ) : null}
      </div>
      {!isInstalled && (
        <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {isIOS && <Share className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <span>
            {isIOS
              ? "On iPhone or iPad, tap Share, then Add to Home Screen. Open JavaHub from its new home-screen icon to read the saved roadmap like an app."
              : "Use your browser's Install app or Add to Home Screen menu to keep JavaHub one tap away. Installation availability depends on your browser."}
          </span>
        </p>
      )}
      {installError && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          The browser could not open its install prompt: {installError}
        </p>
      )}
    </div>
  );
}

export function OfflineRoadmapManager() {
  const {
    basePath,
    enabled,
    isOnline,
    offlineBundle,
    workerSupported,
    registrationError,
    cacheError,
    updateError,
    manifestVersion,
    setManifestVersion,
    refreshOfflineBundle,
  } = useOfflineRoadmap();
  const [manifest, setManifest] = useState<OfflineRoadmapManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [completedResources, setCompletedResources] = useState(0);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    const loadManifest = async () => {
      try {
        const url = getAppScopedUrl(
          window.location.origin,
          basePath,
          "offline-manifest.json"
        );
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`The offline file list could not be loaded (HTTP ${response.status}).`);
        }
        const parsed = parseOfflineRoadmapManifest(
          await response.json(),
          window.location.origin,
          basePath
        );
        setManifest(parsed);
        setManifestVersion(parsed.version);
        setManifestError(null);
      } catch (error) {
        if (!controller.signal.aborted) {
          setManifestError(errorMessage(error));
        }
      }
    };

    void loadManifest();
    return () => controller.abort();
  }, [basePath, enabled, setManifestVersion]);

  useEffect(() => {
    if (!manifest || !("caches" in window)) {
      return;
    }

    let active = true;
    const loadProgress = async () => {
      try {
        const cache = await caches.open(getOfflineCacheName(manifest.version));
        const keys = await cache.keys();
        if (active) {
          setCompletedResources(
            keys.filter((request) =>
              manifest.resources.some(({ url }) =>
                new URL(url, window.location.origin).href === request.url
              )
            ).length
          );
        }
      } catch (error) {
        if (active) {
          setDownloadError(errorMessage(error));
        }
      }
    };

    void loadProgress();
    return () => {
      active = false;
    };
  }, [manifest]);

  const currentBundle = Boolean(
    manifest && offlineBundle?.version === manifest.version
  );
  const hasOlderBundle = Boolean(
    manifest && offlineBundle && offlineBundle.version !== manifest.version
  );

  const confirmDownload = () => {
    if (!manifest || !isOnline || workerSupported !== true) {
      return;
    }
    setDownloadError(null);
    setDownloadState("confirm-download");
  };

  const startDownload = async () => {
    if (!manifest || !isOnline || workerSupported !== true) {
      return;
    }

    setDownloadState("downloading");
    setDownloadError(null);
    setCompletedResources(0);
    const controller = new AbortController();
    abortController.current = controller;

    try {
      if (navigator.storage?.persist) {
        const persistent = await navigator.storage.persist();
        setStorageMessage(
          persistent
            ? "The browser approved persistent storage, but may still manage its available space."
            : "The browser may remove saved files when storage is under pressure."
        );
      } else {
        setStorageMessage(
          "This browser cannot request persistent storage, so it may remove saved files later."
        );
      }
    } catch (error) {
      setStorageMessage(
        `The browser could not confirm persistent storage: ${errorMessage(error)}`
      );
    }

    try {
      if (controller.signal.aborted) {
        throw new DOMException("Download cancelled.", "AbortError");
      }

      const cache = await caches.open(getOfflineCacheName(manifest.version));
      let nextIndex = 0;
      let completed = 0;
      const downloadWorker = async () => {
        while (!controller.signal.aborted) {
          const index = nextIndex++;
          if (index >= manifest.resources.length) {
            return;
          }

          try {
            const resource = manifest.resources[index];
            const url = new URL(resource.url, window.location.origin);
            if (
              url.origin !== window.location.origin ||
              !url.pathname.startsWith(`${basePath}/`)
            ) {
              throw new Error("The offline file list contains a URL outside JavaHub.");
            }

            const existing = await cache.match(url.href, { ignoreSearch: true });
            if (!existing) {
              const response = await fetch(url, { signal: controller.signal });
              if (!response.ok) {
                throw new Error(
                  `A roadmap file could not be downloaded (HTTP ${response.status}).`
                );
              }
              await cache.put(url.href, response);
            }
            completed += 1;
            setCompletedResources(completed);
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
      const failedWorker = results.find(
        (result): result is PromiseRejectedResult => result.status === "rejected"
      );
      if (failedWorker) {
        throw failedWorker.reason;
      }
      if (controller.signal.aborted) {
        throw new DOMException("Download cancelled.", "AbortError");
      }

      const manifestUrl = getAppScopedUrl(
        window.location.origin,
        basePath,
        "offline-manifest.json"
      );
      await cache.put(
        manifestUrl,
        new Response(JSON.stringify(manifest), {
          headers: { "Content-Type": "application/json" },
        })
      );
      await cache.put(
        getAppScopedUrl(window.location.origin, basePath, OFFLINE_BUNDLE_MARKER),
        new Response(JSON.stringify({
          version: manifest.version,
          topicCount: manifest.topicCount,
          sizeBytes: manifest.sizeBytes,
        }))
      );

      const metadataCache = await caches.open(OFFLINE_METADATA_CACHE);
      await metadataCache.put(
        getAppScopedUrl(window.location.origin, basePath, OFFLINE_ACTIVE_RECORD),
        new Response(JSON.stringify({
          version: manifest.version,
          topicCount: manifest.topicCount,
          sizeBytes: manifest.sizeBytes,
        }))
      );
      await metadataCache.delete(
        getAppScopedUrl(
          window.location.origin,
          basePath,
          OFFLINE_UPDATE_ERROR_RECORD
        )
      );

      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith(OFFLINE_CACHE_PREFIX) &&
              name !== getOfflineCacheName(manifest.version)
          )
          .map((name) => caches.delete(name))
      );
      await refreshOfflineBundle();
      setDownloadState("idle");
    } catch (error) {
      if (controller.signal.aborted) {
        setDownloadState("cancelled");
      } else {
        controller.abort();
        setDownloadError(errorMessage(error));
        setDownloadState("error");
      }
    } finally {
      abortController.current = null;
    }
  };

  const removeOfflineContent = async () => {
    setDownloadState("idle");
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(OFFLINE_CACHE_PREFIX))
          .map((name) => caches.delete(name))
      );
      const metadataCache = await caches.open(OFFLINE_METADATA_CACHE);
      await Promise.all([
        metadataCache.delete(
          getAppScopedUrl(window.location.origin, basePath, OFFLINE_ACTIVE_RECORD)
        ),
        metadataCache.delete(
          getAppScopedUrl(
            window.location.origin,
            basePath,
            "__javahub_offline_pending__"
          )
        ),
        metadataCache.delete(
          getAppScopedUrl(
            window.location.origin,
            basePath,
            OFFLINE_UPDATE_ERROR_RECORD
          )
        ),
      ]);
      setCompletedResources(0);
      setStorageMessage("Offline files removed. Your roadmap progress is unchanged.");
      await refreshOfflineBundle();
      setDownloadState("idle");
    } catch (error) {
      setDownloadError(errorMessage(error));
      setDownloadState("error");
    }
  };

  const cancelDownload = () => {
    abortController.current?.abort();
  };

  return (
    <section
      aria-labelledby="offline-roadmap-title"
      className="rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <HardDriveDownload className="h-5 w-5" aria-hidden="true" />
            <h2
              id="offline-roadmap-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Read the roadmap offline
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Save all 116 Java topics and the files they need to this browser or
            installed JavaHub app. Your download is stored on this device and
            does not sync to other browsers.
          </p>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {manifest
              ? `Estimated download: ${formatBytes(manifest.sizeBytes)} before network compression.`
              : "Preparing the offline download size…"}{" "}
            Browser storage can still be cleared or evicted, even when persistent
            storage is granted.
          </p>
          <InstallOptions />
        </div>

        <div className="flex w-full flex-col gap-3 lg:max-w-sm">
          {currentBundle ? (
            <p
              role="status"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-900 dark:text-emerald-200"
            >
              All {offlineBundle?.topicCount} topics are saved for offline reading.
            </p>
          ) : hasOlderBundle ? (
            <p
              role="status"
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
            >
              An updated roadmap download is available. The current offline copy
              remains usable until the update finishes.
            </p>
          ) : null}

          {downloadState === "confirm-download" ? (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                This download is about{" "}
                <strong>{manifest ? formatBytes(manifest.sizeBytes) : "…"}</strong>{" "}
                before compression. Continue only if this data use is okay; Wi-Fi
                is recommended on mobile.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startDownload}
                  className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
                >
                  Confirm download
                </button>
                <button
                  type="button"
                  onClick={() => setDownloadState("idle")}
                  className="min-h-11 rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-slate-700 hover:bg-[var(--color-card-subtle)] dark:text-slate-200"
                >
                  Not now
                </button>
              </div>
            </div>
          ) : downloadState === "downloading" && manifest ? (
            <div className="flex flex-col gap-3">
              <label
                htmlFor="offline-download-progress"
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Saving files: {completedResources} of {manifest.resources.length}
              </label>
              <progress
                id="offline-download-progress"
                className="h-2 w-full accent-emerald-600"
                max={manifest.resources.length}
                value={completedResources}
              />
              <button
                type="button"
                onClick={cancelDownload}
                className="min-h-11 self-start rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-slate-700 hover:bg-[var(--color-card-subtle)] dark:text-slate-200"
              >
                Cancel download
              </button>
            </div>
          ) : downloadState === "confirm-remove" ? (
            <div className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Remove saved roadmap files from this browser? Your visited-topic
                progress will be kept.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={removeOfflineContent}
                  className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800"
                >
                  Remove offline files
                </button>
                <button
                  type="button"
                  onClick={() => setDownloadState("idle")}
                  className="min-h-11 rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-slate-700 hover:bg-[var(--color-card-subtle)] dark:text-slate-200"
                >
                  Keep files
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={confirmDownload}
                disabled={
                  !manifest ||
                  !isOnline ||
                  workerSupported !== true ||
                  (currentBundle && !hasOlderBundle)
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
              >
                {hasOlderBundle ? (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {currentBundle
                  ? "Offline copy is current"
                  : hasOlderBundle
                    ? "Update offline copy"
                    : "Download for offline"}
              </button>
              {(offlineBundle || downloadState === "cancelled" || downloadState === "error") && (
                <button
                  type="button"
                  onClick={() => setDownloadState("confirm-remove")}
                  className="min-h-11 rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium text-slate-700 hover:bg-[var(--color-card-subtle)] dark:text-slate-200"
                >
                  Remove offline files
                </button>
              )}
              {downloadState === "cancelled" && (
                <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
                  Download paused. Retry to continue; completed files will not be
                  downloaded again.
                </p>
              )}
              {downloadState === "error" && (
                <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                  {downloadError ?? "The download failed. Reconnect and retry."}
                </p>
              )}
            </div>
          )}

          {!enabled && (
            <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
              Offline downloads are available on the deployed JavaHub site.
            </p>
          )}
          {enabled && workerSupported === false && (
            <p role="status" className="text-sm text-amber-800 dark:text-amber-300">
              This browser cannot save the roadmap for offline use. The online
              site remains available.
            </p>
          )}
          {registrationError && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              Offline support could not start: {registrationError}
            </p>
          )}
          {manifestError && enabled && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              Offline download details could not load: {manifestError}
            </p>
          )}
          {(cacheError || downloadError) && downloadState !== "error" && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {cacheError ?? downloadError}
            </p>
          )}
          {updateError && (
            <p role="status" className="text-sm text-amber-800 dark:text-amber-300">
              The saved offline copy could not update automatically. You can retry
              by downloading the latest copy.
            </p>
          )}
          {storageMessage && (
            <p role="status" className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {storageMessage}
            </p>
          )}
          {manifestVersion && hasOlderBundle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New version {manifestVersion.slice(0, 8)} is ready.
            </p>
          )}
          {!isOnline && !offlineBundle && (
            <p role="status" className="text-sm text-amber-800 dark:text-amber-300">
              Connect to the internet before downloading the offline roadmap.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
