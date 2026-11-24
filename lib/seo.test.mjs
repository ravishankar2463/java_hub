import assert from "node:assert/strict";
import test from "node:test";
import { getSiteUrl } from "./seo.mjs";

test("builds absolute canonical URLs under the GitHub Pages project path", () => {
  assert.equal(
    getSiteUrl("/roadmap/level-8/spring-core-internals"),
    "https://ravishankar2463.github.io/java_hub/roadmap/level-8/spring-core-internals"
  );
});

test("builds the canonical URL for the site root with a trailing slash", () => {
  assert.equal(getSiteUrl("/"), "https://ravishankar2463.github.io/java_hub/");
});
