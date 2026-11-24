import assert from "node:assert/strict";
import { test } from "node:test";
import { filterOfflineSearchItems } from "./offline-search.mjs";

const items = [
  { id: "topic", title: "Java Basics", url: "/roadmap/level-0/java-basics", group: "Level 0" },
  { id: "article", title: "Architecture", url: "/general/architecture", group: "Articles" },
];

test("keeps all search results while online", () => {
  assert.deepEqual(filterOfflineSearchItems(items, true, false), items);
});

test("limits offline search to downloaded roadmap topics", () => {
  assert.deepEqual(filterOfflineSearchItems(items, false, true), [items[0]]);
  assert.deepEqual(filterOfflineSearchItems(items, false, false), []);
});
