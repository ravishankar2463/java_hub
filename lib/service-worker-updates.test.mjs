import assert from "node:assert/strict";
import { test } from "node:test";
import {
  shouldShowOfflineUpdate,
  watchServiceWorkerUpdates,
} from "./service-worker-updates.ts";

function createEventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      const eventListeners = listeners.get(type) ?? new Set();
      eventListeners.add(listener);
      listeners.set(type, eventListeners);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type) {
      for (const listener of listeners.get(type) ?? []) {
        listener({ type });
      }
    },
  };
}

function createRegistration() {
  const eventTarget = createEventTarget();
  return {
    ...eventTarget,
    installing: null,
    waiting: null,
    updateCalls: 0,
    async update() {
      this.updateCalls += 1;
    },
  };
}

const nextEventLoopTurn = () =>
  new Promise((resolve) => setImmediate(resolve));

test("hides the update prompt when no offline roadmap is saved", () => {
  assert.equal(shouldShowOfflineUpdate(false, true), false);
});

test("shows the update prompt when a saved offline roadmap has a waiting update", () => {
  assert.equal(shouldShowOfflineUpdate(true, true), true);
});

test("checks for service-worker updates when the app resumes or reconnects", async () => {
  const registration = createRegistration();
  const windowTarget = createEventTarget();
  const documentTarget = Object.assign(createEventTarget(), {
    visibilityState: "visible",
  });
  const errors = [];
  const stopWatching = watchServiceWorkerUpdates(
    registration,
    windowTarget,
    documentTarget,
    () => true,
    () => {},
    (error) => errors.push(error)
  );
  await nextEventLoopTurn();
  registration.updateCalls = 0;

  windowTarget.dispatch("pageshow");
  windowTarget.dispatch("focus");
  documentTarget.dispatch("visibilitychange");
  await nextEventLoopTurn();

  assert.equal(registration.updateCalls, 1);
  assert.deepEqual(errors, []);

  stopWatching();
});

test("surfaces an already waiting worker even while offline", () => {
  const registration = createRegistration();
  const waitingWorker = { state: "installed" };
  registration.waiting = waitingWorker;
  const waitingWorkers = [];
  const stopWatching = watchServiceWorkerUpdates(
    registration,
    createEventTarget(),
    Object.assign(createEventTarget(), { visibilityState: "visible" }),
    () => false,
    (worker) => waitingWorkers.push(worker),
    () => {}
  );

  assert.deepEqual(waitingWorkers, [waitingWorker]);
  assert.equal(registration.updateCalls, 0);

  stopWatching();
});

test("notifies when the installing worker becomes waiting", () => {
  const registration = createRegistration();
  const installingWorker = Object.assign(createEventTarget(), {
    state: "installing",
  });
  registration.installing = installingWorker;
  const waitingWorkers = [];
  const stopWatching = watchServiceWorkerUpdates(
    registration,
    createEventTarget(),
    Object.assign(createEventTarget(), { visibilityState: "hidden" }),
    () => false,
    (worker) => waitingWorkers.push(worker),
    () => {}
  );

  registration.waiting = installingWorker;
  installingWorker.state = "installed";
  installingWorker.dispatch("statechange");

  assert.deepEqual(waitingWorkers, [installingWorker]);

  stopWatching();
});
