import assert from "node:assert/strict";
import test from "node:test";
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeShortsUrl,
  getYouTubeThumbnailUrl,
  resolveChapterVideoSource,
  resolveVerticalSwipeAction,
} from "./chapter-videos.ts";

test("extractYouTubeId handles bare IDs and standard YouTube URL formats", () => {
  assert.equal(extractYouTubeId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(
    extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
  assert.equal(
    extractYouTubeId("https://youtube.com/watch?v=dQw4w9WgXcQ&t=12s"),
    "dQw4w9WgXcQ"
  );
  assert.equal(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
  assert.equal(
    extractYouTubeId("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
  assert.equal(extractYouTubeId("not-a-valid-id"), null);
  assert.equal(extractYouTubeId("https://example.com/shorts/dQw4w9WgXcQ"), null);
  assert.equal(extractYouTubeId(undefined), null);
});

test("resolveChapterVideoSource prefers YouTube embed when youtubeId or youtubeUrl is present", () => {
  const resolved = resolveChapterVideoSource({
    file: "level-0/environment-setup/part-1.mp4",
    videoUrl: "https://github.com/example/releases/download/v1/part-1.mp4",
    youtubeId: "abcDEF123_-",
  });

  assert.equal(resolved.kind, "youtube");
  assert.equal(resolved.youtubeId, "abcDEF123_-");
  assert.equal(
    resolved.embedUrl,
    getYouTubeEmbedUrl("abcDEF123_-")
  );
  assert.match(resolved.embedUrl ?? "", /playsinline=1/);
  assert.equal(resolved.externalUrl, getYouTubeShortsUrl("abcDEF123_-"));
  assert.equal(resolved.externalLabel, "Watch on YouTube");
});

test("resolveChapterVideoSource falls back to MP4 when no YouTube ID is present", () => {
  const resolved = resolveChapterVideoSource({
    file: "level-0/environment-setup/part-1.mp4",
    videoUrl: "https://github.com/example/releases/download/v1/part-1.mp4",
  });

  assert.equal(resolved.kind, "mp4");
  assert.equal(resolved.youtubeId, null);
  assert.equal(resolved.embedUrl, null);
  assert.equal(
    resolved.mp4Url,
    "https://github.com/example/releases/download/v1/part-1.mp4"
  );
  assert.equal(resolved.externalLabel, "Open MP4 on GitHub");
});

test("getYouTubeEmbedUrl supports autoplay, mute, loop, and jsapi options and thumbnail helper returns ytimg URL", () => {
  const autoUrl = getYouTubeEmbedUrl("rns2TnKTD4U", {
    autoplay: true,
    mute: true,
    enableJsApi: true,
    loop: true,
  });
  assert.match(autoUrl, /autoplay=1/);
  assert.match(autoUrl, /mute=1/);
  assert.match(autoUrl, /enablejsapi=1/);
  assert.match(autoUrl, /loop=1/);
  assert.match(autoUrl, /playlist=rns2TnKTD4U/);
  assert.match(autoUrl, /playsinline=1/);
  assert.match(autoUrl, /controls=0/);
  assert.match(autoUrl, /fs=0/);
  assert.match(autoUrl, /disablekb=1/);
  assert.match(autoUrl, /cc_load_policy=0/);
  assert.match(autoUrl, /iv_load_policy=3/);
  assert.equal(
    getYouTubeThumbnailUrl("rns2TnKTD4U"),
    "https://i.ytimg.com/vi/rns2TnKTD4U/hqdefault.jpg"
  );
});

test("resolveVerticalSwipeAction handles next, prev, and close boundaries", () => {
  // Small movement below threshold -> none
  assert.deepEqual(resolveVerticalSwipeAction(0, 3, 20), { type: "none" });
  // Swipe up on Part 1 -> Part 2
  assert.deepEqual(resolveVerticalSwipeAction(0, 3, 60), { type: "next", index: 1 });
  // Swipe down on Part 2 -> Part 1
  assert.deepEqual(resolveVerticalSwipeAction(1, 3, -60), { type: "prev", index: 0 });
  // Swipe down on Part 1 -> close
  assert.deepEqual(resolveVerticalSwipeAction(0, 3, -60), { type: "close" });
  // Swipe up on last part -> close
  assert.deepEqual(resolveVerticalSwipeAction(2, 3, 60), { type: "close" });
});
