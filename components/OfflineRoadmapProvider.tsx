"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  OFFLINE_ACTIVE_RECORD,
  OFFLINE_METADATA_CACHE,
  OFFLINE_UPDATE_ERROR_RECORD,
  getAppScopedUrl,
  getOfflineCacheName,
} from "@/lib/offline-roadmap-storage.mjs";
import type { OfflineRoadmapManifest } from "@/lib/offline-roadmap-storage.mjs";
import {
  shouldShowOfflineUpdate,
  watchServiceWorkerUpdates,
} from "@/lib/service-worker-updates";

type OfflineBundle = Pick<
  OfflineRoadmapManifest,
  "version" | "topicCount" | "sizeBytes"
>;

type OfflineRoadmapContextValue = {
  basePath: string;
  enabled: boolean;
  isOnline: boolean;
  offlineBundle: OfflineBundle | null;
  manifestVersion: string | null;
  workerSupported: boolean | null;
  registrationError: string | null;
  cacheError: string | null;
  updateError: string | null;
  updateReady: boolean;
  setManifestVersion: (version: string | null) => void;
  refreshOfflineBundle: () => Promise<void>;
  activateUpdate: () => void;
};

const OfflineRoadmapContext =
  createContext<OfflineRoadmapContextValue | null>(null);

function subscribeToOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineStatus() {
  return navigator.onLine;
}

function subscribeToWorkerCapability(callback: () => void) {
  window.addEventListener("focus", callback);
  window.addEventListener("pageshow", callback);
  return () => {
    window.removeEventListener("focus", callback);
    window.removeEventListener("pageshow", callback);
  };
}

function getWorkerCapability() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "caches" in window
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

export function OfflineRoadmapProvider({
  basePath,
  enabled,
  children,
}: {
  basePath: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatus,
    () => true
  );
  const workerSupported = useSyncExternalStore(
    subscribeToWorkerCapability,
    getWorkerCapability,
    () => false
  );
  const [offlineBundle, setOfflineBundle] = useState<OfflineBundle | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [cacheError, setCacheError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [manifestVersion, setManifestVersion] = useState<string | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const reloadAfterUpdate = useRef(false);

  const refreshOfflineBundle = useCallback(async () => {
    if (!("caches" in window)) {
      setOfflineBundle(null);
      return;
    }

    try {
      const metadataCache = await caches.open(OFFLINE_METADATA_CACHE);
      const activeResponse = await metadataCache.match(
        getAppScopedUrl(window.location.origin, basePath, OFFLINE_ACTIVE_RECORD)
      );
      if (!activeResponse) {
        setOfflineBundle(null);
        setUpdateError(null);
        return;
      }

      const record: unknown = await activeResponse.json();
      if (
        typeof record !== "object" ||
        record === null ||
        !("version" in record) ||
        !("topicCount" in record) ||
        !("sizeBytes" in record) ||
        typeof record.version !== "string" ||
        !/^[a-f0-9]{16}$/.test(record.version) ||
        typeof record.topicCount !== "number" ||
        !Number.isSafeInteger(record.topicCount) ||
        record.topicCount !== 116 ||
        typeof record.sizeBytes !== "number" ||
        !Number.isSafeInteger(record.sizeBytes)
      ) {
        throw new Error("The saved offline roadmap record is invalid.");
      }
      const bundle: OfflineBundle = {
        version: record.version,
        topicCount: record.topicCount,
        sizeBytes: record.sizeBytes,
      };
      const bundleCache = await caches.open(getOfflineCacheName(bundle.version));
      const completeResponse = await bundleCache.match(
        getAppScopedUrl(window.location.origin, basePath, "__javahub_offline_complete__")
      );
      if (!completeResponse) {
        throw new Error("The saved offline roadmap is incomplete.");
      }

      setOfflineBundle(bundle);
      const updateErrorResponse = await metadataCache.match(
        getAppScopedUrl(
          window.location.origin,
          basePath,
          OFFLINE_UPDATE_ERROR_RECORD
        )
      );
      if (updateErrorResponse) {
        const detail: { message?: string } = await updateErrorResponse.json();
        setUpdateError(detail.message ?? "The saved roadmap could not be updated.");
      } else {
        setUpdateError(null);
      }
      setCacheError(null);
    } catch (error) {
      setOfflineBundle(null);
      setCacheError(getErrorMessage(error));
    }
  }, [basePath]);

  useEffect(() => {
    if (!enabled || !workerSupported) {
      return;
    }

    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;
    let stopWatchingUpdates: (() => void) | null = null;

    const handleControllerChange = () => {
      void refreshOfflineBundle();
      if (reloadAfterUpdate.current) {
        reloadAfterUpdate.current = false;
        window.location.reload();
      }
    };

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register(
          getAppScopedUrl(window.location.origin, basePath, "sw.js"),
          {
            scope: getAppScopedUrl(window.location.origin, basePath, ""),
          }
        );
        if (disposed) {
          return;
        }

        setRegistrationError(null);
        stopWatchingUpdates = watchServiceWorkerUpdates(
          registration,
          window,
          document,
          () => navigator.onLine,
          setWaitingWorker,
          (error) => {
            console.error("JavaHub could not check for service-worker updates.", error);
          }
        );
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          handleControllerChange
        );
        await refreshOfflineBundle();
      } catch (error) {
        if (!disposed) {
          setRegistrationError(getErrorMessage(error));
        }
      }
    };

    void registerServiceWorker();
    return () => {
      disposed = true;
      stopWatchingUpdates?.();
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, [basePath, enabled, refreshOfflineBundle, workerSupported]);

  const activateUpdate = useCallback(() => {
    if (!waitingWorker) {
      return;
    }
    reloadAfterUpdate.current = Boolean(navigator.serviceWorker.controller);
    waitingWorker.postMessage({ type: "ACTIVATE_UPDATE" });
  }, [waitingWorker]);
  const updateReady = shouldShowOfflineUpdate(
    offlineBundle !== null,
    waitingWorker !== null
  );

  const contextValue = useMemo(
    () => ({
      basePath,
      enabled,
      isOnline,
      offlineBundle,
      manifestVersion,
      workerSupported,
      registrationError,
      cacheError,
      updateError,
      updateReady,
      setManifestVersion,
      refreshOfflineBundle,
      activateUpdate,
    }),
    [
      activateUpdate,
      basePath,
      cacheError,
      enabled,
      isOnline,
      offlineBundle,
      manifestVersion,
      refreshOfflineBundle,
      registrationError,
      updateError,
      updateReady,
      workerSupported,
    ]
  );

  return (
    <OfflineRoadmapContext.Provider value={contextValue}>
      {!isOnline && (
        <aside
          role="status"
          className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-slate-700 dark:text-slate-200"
        >
          You are offline.{" "}
          {offlineBundle
            ? `${offlineBundle.topicCount} saved roadmap topics are available in this browser.`
            : "No offline roadmap copy is saved in this browser yet."}
        </aside>
      )}
      {updateReady && (
        <aside
          role="status"
          className="flex flex-col items-center justify-center gap-2 border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200 sm:flex-row sm:justify-between sm:text-left"
        >
          <span>A JavaHub update is ready to install.</span>
          <button
            type="button"
            onClick={activateUpdate}
            className="min-h-11 rounded-lg bg-emerald-700 px-4 font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-400 dark:text-slate-950 dark:hover:bg-emerald-300"
          >
            Update JavaHub
          </button>
        </aside>
      )}
      {updateError && (
        <aside
          role="status"
          className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm text-slate-700 dark:text-slate-200"
        >
          The offline copy could not update automatically. Reconnect and use
          the roadmap download controls to retry.
        </aside>
      )}
      {children}
    </OfflineRoadmapContext.Provider>
  );
}

export function useOfflineRoadmap() {
  const context = useContext(OfflineRoadmapContext);
  if (!context) {
    throw new Error(
      "useOfflineRoadmap must be used within an OfflineRoadmapProvider."
    );
  }
  return context;
}
