type ServiceWorkerUpdateRegistration = Pick<
  ServiceWorkerRegistration,
  | "addEventListener"
  | "removeEventListener"
  | "installing"
  | "waiting"
  | "update"
>;

type EventTargetLike = Pick<EventTarget, "addEventListener" | "removeEventListener">;

export function watchServiceWorkerUpdates(
  registration: ServiceWorkerUpdateRegistration,
  windowTarget: EventTargetLike,
  documentTarget: EventTargetLike & Pick<Document, "visibilityState">,
  isOnline: () => boolean,
  onWaiting: (worker: ServiceWorker) => void,
  onError: (error: unknown) => void
) {
  let disposed = false;
  let updateCheckInProgress = false;
  let observedWorker: ServiceWorker | null = null;

  const notifyWaitingWorker = () => {
    if (registration.waiting) {
      onWaiting(registration.waiting);
    }
  };

  const handleWorkerStateChange = () => {
    notifyWaitingWorker();
  };

  const observeInstallingWorker = () => {
    const installingWorker = registration.installing;
    if (installingWorker !== observedWorker) {
      observedWorker?.removeEventListener(
        "statechange",
        handleWorkerStateChange
      );
      observedWorker = installingWorker;
      observedWorker?.addEventListener(
        "statechange",
        handleWorkerStateChange
      );
    }
    notifyWaitingWorker();
  };

  const checkForUpdate = () => {
    observeInstallingWorker();
    if (disposed || !isOnline() || updateCheckInProgress) {
      return;
    }

    updateCheckInProgress = true;
    void Promise.resolve()
      .then(() => registration.update())
      .then(() => {
        if (!disposed) {
          observeInstallingWorker();
        }
      })
      .catch((error: unknown) => {
        if (!disposed) {
          onError(error);
        }
      })
      .finally(() => {
        updateCheckInProgress = false;
      });
  };

  const handleUpdateFound = () => {
    observeInstallingWorker();
  };
  const handleVisibilityChange = () => {
    if (documentTarget.visibilityState === "visible") {
      checkForUpdate();
    }
  };

  registration.addEventListener("updatefound", handleUpdateFound);
  windowTarget.addEventListener("pageshow", checkForUpdate);
  windowTarget.addEventListener("focus", checkForUpdate);
  windowTarget.addEventListener("online", checkForUpdate);
  documentTarget.addEventListener("visibilitychange", handleVisibilityChange);
  checkForUpdate();

  return () => {
    disposed = true;
    registration.removeEventListener("updatefound", handleUpdateFound);
    windowTarget.removeEventListener("pageshow", checkForUpdate);
    windowTarget.removeEventListener("focus", checkForUpdate);
    windowTarget.removeEventListener("online", checkForUpdate);
    documentTarget.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    observedWorker?.removeEventListener(
      "statechange",
      handleWorkerStateChange
    );
  };
}
