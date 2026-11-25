export interface ChapterVideoItem {
  chapterId: string;
  level: string;
  slug: string;
  chapterTitle: string;
  partNumber: number;
  totalParts: number;
  partSlug: string;
  partTitle: string;
  format: string;
  durationSec: number;
  file: string;
  videoUrl?: string;
  releaseTag?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  youtubeStatus?: "unlisted" | "public" | "private";
  scheduledPublishAt?: string;
  publishedAt?: string;
  roadmapUrl: string;
  branchName: string;
  renderedAt: string;
}

const RAW_BASE =
  "https://raw.githubusercontent.com/ravishankar2463/java_hub_resources/main/videos";
const BLOB_BASE =
  "https://github.com/ravishankar2463/java_hub_resources/blob/main/videos";

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Extracts a valid 11-character YouTube video ID from a bare ID or common YouTube URL formats
 * (shorts, watch, embed, youtu.be). Returns null if invalid.
 */
export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (YOUTUBE_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const candidate = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
      return YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const watchId = parsed.searchParams.get("v");
      if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) {
        return watchId;
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (
        parts.length >= 2 &&
        (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") &&
        YOUTUBE_ID_PATTERN.test(parts[1])
      ) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Privacy-enhanced YouTube embed URL with playsinline=1 for smooth iOS Safari playback.
 */
export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`;
}

/**
 * Canonical YouTube Shorts watch URL.
 */
export function getYouTubeShortsUrl(youtubeId: string): string {
  return `https://www.youtube.com/shorts/${youtubeId}`;
}

export interface ResolvedChapterVideoSource {
  kind: "youtube" | "mp4";
  youtubeId: string | null;
  embedUrl: string | null;
  mp4Url: string;
  externalUrl: string;
  externalLabel: string;
}

export function resolveChapterVideoSource(
  video: Pick<ChapterVideoItem, "file" | "videoUrl" | "youtubeId" | "youtubeUrl">
): ResolvedChapterVideoSource {
  const youtubeId =
    extractYouTubeId(video.youtubeId) ?? extractYouTubeId(video.youtubeUrl);
  const mp4Url = video.videoUrl || `${RAW_BASE}/${video.file}`;

  if (youtubeId) {
    return {
      kind: "youtube",
      youtubeId,
      embedUrl: getYouTubeEmbedUrl(youtubeId),
      mp4Url,
      externalUrl: getYouTubeShortsUrl(youtubeId),
      externalLabel: "Watch on YouTube",
    };
  }

  return {
    kind: "mp4",
    youtubeId: null,
    embedUrl: null,
    mp4Url,
    externalUrl: video.videoUrl || `${BLOB_BASE}/${video.file}`,
    externalLabel: "Open MP4 on GitHub",
  };
}
