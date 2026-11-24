import assert from "node:assert/strict";
import { test } from "node:test";
import { getStaticBasePath } from "./site-paths.mjs";

test("uses the GitHub repository name as the static base path", () => {
  assert.equal(
    getStaticBasePath({
      GITHUB_ACTIONS: "true",
      GITHUB_REPOSITORY: "owner/java_hub",
    }),
    "/java_hub"
  );
});

test("keeps local builds at the origin root", () => {
  assert.equal(getStaticBasePath({}), "");
});
