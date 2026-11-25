"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PlayCircle,
  Play,
  Pause,
  ExternalLink,
  Film,
  Clock,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  resolveChapterVideoSource,
  resolveVerticalSwipeAction,
  type ChapterVideoItem,
} from "@/lib/chapter-videos";

export type { ChapterVideoItem };

function formatDuration(sec: number): string {
  const rounded = Math.round(sec);
  const mins = Math.floor(rounded / 60);
  const rem = rounded % 60;
  return `${mins}:${String(rem).padStart(2, "0")}`;
}

export function ChapterVideos({ videos }: { videos: ChapterVideoItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [initialYouTubeId, setInitialYouTubeId] = useState<string | null>(null);

  const persistentIframeRef = useRef<HTMLIFrameElement | null>(null);
  const loadedYouTubeIdRef = useRef<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isClosingRef = useRef(false);

  const sendYouTubeCommand = useCallback(
    (func: string, args: unknown[] = []) => {
      const win = persistentIframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage(JSON.stringify({ event: "command", func, args }), "*");
    },
    []
  );

  const disableYouTubeCaptions = useCallback(() => {
    sendYouTubeCommand("unloadModule", ["captions"]);
    sendYouTubeCommand("unloadModule", ["cc"]);
  }, [sendYouTubeCommand]);

  const registerYouTubeListener = useCallback(() => {
    const win = persistentIframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*");
    disableYouTubeCaptions();
  }, [disableYouTubeCaptions]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      sendYouTubeCommand(nextMuted ? "mute" : "unMute");
      if (!nextMuted) {
        sendYouTubeCommand("playVideo");
      }
      return nextMuted;
    });
  }, [sendYouTubeCommand]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      sendYouTubeCommand("pauseVideo");
      setIsPlaying(false);
    } else {
      sendYouTubeCommand("playVideo");
      setIsPlaying(true);
    }
  }, [isPlaying, sendYouTubeCommand]);

  const closeFullscreen = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    loadedYouTubeIdRef.current = null;
    setInitialYouTubeId(null);
    setHasStartedPlaying(false);
    setIsPlaying(false);
    setDragOffsetY(0);
    setIsDragging(false);
    setIsFullscreen(false);
    setTimeout(() => {
      isClosingRef.current = false;
    }, 150);
  }, []);

  const openFullscreenAt = useCallback(
    (index: number) => {
      isClosingRef.current = false;
      const target = videos[index] ?? videos[0];
      const ytId = target ? resolveChapterVideoSource(target).youtubeId : null;
      loadedYouTubeIdRef.current = ytId;
      setInitialYouTubeId(ytId);
      setSelectedIndex(index);
      setIsMuted(false);
      setIsPlaying(false);
      setHasStartedPlaying(false);
      setDragOffsetY(0);
      setIsDragging(false);
      setFailedSrc(null);
      setIsFullscreen(true);
    },
    [videos]
  );

  const navigateToPart = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= videos.length) {
        closeFullscreen();
        return;
      }
      setSelectedIndex(targetIndex);
      setFailedSrc(null);
      setDragOffsetY(0);
      setIsDragging(false);
    },
    [videos.length, closeFullscreen]
  );

  // Listen for YouTube IFrame playerState updates (1 = playing, 2 = paused)
  // so once playback starts on iOS Safari we can enable full-area swipe + tap-to-pause.
  useEffect(() => {
    if (!isFullscreen) return;

    const handleMessage = (event: MessageEvent) => {
      if (
        typeof event.origin === "string" &&
        !event.origin.includes("youtube")
      ) {
        return;
      }
      let data: unknown = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      const payload = data as {
        event?: string;
        info?: { playerState?: number };
      };
      if (payload.event === "onReady") {
        disableYouTubeCaptions();
      }
      const state = payload.info?.playerState;
      if (state === 1) {
        setIsPlaying(true);
        setHasStartedPlaying(true);
        disableYouTubeCaptions();
      } else if (state === 2 || state === 0) {
        setIsPlaying(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isFullscreen, disableYouTubeCaptions]);

  // Switch videos on the persistent YouTube iframe via postMessage so unmuted
  // playback continues seamlessly across Parts 2..N without remounting the iframe.
  useEffect(() => {
    if (!isFullscreen) return;
    const current = videos[selectedIndex];
    if (!current) return;
    const nextYtId = resolveChapterVideoSource(current).youtubeId;

    if (!nextYtId) return;

    if (!initialYouTubeId) {
      loadedYouTubeIdRef.current = nextYtId;
      setInitialYouTubeId(nextYtId);
      return;
    }

    if (loadedYouTubeIdRef.current !== nextYtId) {
      loadedYouTubeIdRef.current = nextYtId;
      sendYouTubeCommand("loadVideoById", [nextYtId]);
      disableYouTubeCaptions();
      if (!isMuted) {
        sendYouTubeCommand("unMute");
      }
    }
  }, [
    isFullscreen,
    selectedIndex,
    videos,
    initialYouTubeId,
    isMuted,
    sendYouTubeCommand,
    disableYouTubeCaptions,
  ]);

  // Lock background page scroll while fullscreen Shorts player is open
  // so closing returns to the exact scroll position where the user left off.
  useEffect(() => {
    if (!isFullscreen) return;

    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [isFullscreen]);

  // Keyboard navigation while fullscreen Shorts player is open
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFullscreen();
      } else if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        navigateToPart(selectedIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        navigateToPart(selectedIndex - 1);
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isFullscreen,
    selectedIndex,
    closeFullscreen,
    navigateToPart,
    toggleMute,
    togglePlayPause,
  ]);

  // Unified touch swipe handlers (used on top bar, bottom bar, edge rails, and active gesture shield).
  // Paired with touch-action: none so iOS Safari never hijacks vertical swipes for page bounce.
  const handleGestureTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
    setDragOffsetY(0);
  };

  const handleGestureTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rawDelta = touch.clientY - touchStartRef.current.y;
    // Clamp live visual drag feedback to ±140px
    const clamped = Math.max(-140, Math.min(140, rawDelta));
    setDragOffsetY(clamped);
  };

  const handleGestureTouchEnd = (
    e: React.TouchEvent,
    allowTapToggle = false
  ) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const start = touchStartRef.current;
    touchStartRef.current = null;
    setIsDragging(false);
    setDragOffsetY(0);

    if (!touch) return;
    const deltaY = start.y - touch.clientY; // positive = swipe up, negative = swipe down
    const deltaX = Math.abs(start.x - touch.clientX);

    const action = resolveVerticalSwipeAction(
      selectedIndex,
      videos.length,
      deltaY,
      45
    );

    if (action.type === "close") {
      closeFullscreen();
    } else if (action.type === "next" || action.type === "prev") {
      navigateToPart(action.index);
    } else if (allowTapToggle && Math.abs(deltaY) < 12 && deltaX < 12) {
      togglePlayPause();
    }
  };

  const handleGestureTouchCancel = () => {
    touchStartRef.current = null;
    setIsDragging(false);
    setDragOffsetY(0);
  };

  if (videos.length === 0) return null;

  const active = videos[selectedIndex] ?? videos[0];
  const activeSource = resolveChapterVideoSource(active);
  const activeThumb = activeSource.youtubeId
    ? getYouTubeThumbnailUrl(activeSource.youtubeId)
    : null;
  const isLastActive = selectedIndex === videos.length - 1;
  const persistentEmbedUrl = initialYouTubeId
    ? getYouTubeEmbedUrl(initialYouTubeId, {
        autoplay: true,
        mute: false,
        enableJsApi: true,
        loop: true,
      })
    : null;
  const hasMp4Err =
    activeSource.kind === "mp4" && failedSrc === activeSource.mp4Url;

  return (
    <>
      <section
        id="chapter-videos"
        className="mb-10 p-5 sm:p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Short Summary Videos ({videos.length}{" "}
                {videos.length === 1 ? "Part" : "Parts"})
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Tap Play for full-screen Shorts mode — swipe up or down between parts.
              </p>
            </div>
          </div>

          <a
            href={activeSource.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-card)] hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium border border-[var(--color-border)] transition-colors"
          >
            <span>{activeSource.externalLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Vertical 9:16 Shorts Preview Card — Click to Open Fullscreen */}
          <button
            type="button"
            onClick={() => openFullscreenAt(selectedIndex)}
            aria-label={`Play Part ${active.partNumber}: ${active.partTitle} in full screen`}
            className="group relative w-full max-w-[270px] shrink-0 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-emerald-500/60 shadow-md aspect-[9/16] text-left cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {activeThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeThumb}
                alt={`${active.chapterTitle} — Part ${active.partNumber}`}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-950" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/45" />

            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                Part {active.partNumber}/{active.totalParts}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/65 backdrop-blur-sm text-[11px] font-mono text-slate-200 border border-white/10">
                <Clock className="w-3 h-3" />
                {formatDuration(active.durationSec)}
              </span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/90 group-hover:bg-emerald-400 group-hover:scale-110 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-950/60 transition-all duration-200">
                <Play className="w-7 h-7 fill-current ml-0.5" />
              </div>
            </div>

            <div className="absolute bottom-3 inset-x-3 flex flex-col gap-1">
              <div className="text-sm font-bold text-white leading-snug line-clamp-2 drop-shadow">
                {active.partTitle}
              </div>
              <div className="text-[11px] text-emerald-300/90 font-medium">
                Tap to watch full screen
              </div>
            </div>
          </button>

          {/* Part Selector List */}
          <div className="flex-1 w-full flex flex-col gap-2.5">
            {videos.map((vid, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={vid.partSlug}
                  type="button"
                  onClick={() => openFullscreenAt(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500/50 shadow-xs"
                      : "bg-[var(--color-card)] border-[var(--color-border)] hover:border-emerald-500/35"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <PlayCircle
                      className={`w-5 h-5 mt-0.5 shrink-0 ${
                        isSelected
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Part {vid.partNumber} of {vid.totalParts}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {vid.partTitle}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/10 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDuration(vid.durationSec)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full-Screen Vertical Swipe Shorts Player */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${active.chapterTitle} Short Summary Videos`}
          className="fixed inset-0 z-[100] h-[100dvh] bg-black text-white flex flex-col select-none"
        >
          {/* Dedicated Top Header Bar (swipeable with touch-action: none) */}
          <div
            onTouchStart={handleGestureTouchStart}
            onTouchMove={handleGestureTouchMove}
            onTouchEnd={(e) => handleGestureTouchEnd(e, false)}
            onTouchCancel={handleGestureTouchCancel}
            className="shrink-0 z-30 flex items-center justify-between gap-2 px-3.5 pt-[max(0.65rem,env(safe-area-inset-top))] pb-2.5 bg-slate-950 border-b border-white/10 touch-none"
          >
            <div className="min-w-0 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shrink-0">
                Part {active.partNumber}/{active.totalParts}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white/90 truncate">
                {active.chapterTitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {activeSource.kind === "youtube" && (
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    isMuted
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Unmute</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sound On</span>
                    </>
                  )}
                </button>
              )}

              <a
                href={activeSource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={activeSource.externalLabel}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              >
                <span className="hidden sm:inline">{activeSource.externalLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={closeFullscreen}
                aria-label="Close full-screen video"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle Video Stage with live drag feedback + iOS-safe touch swipe zones */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center bg-black overflow-hidden">
            <div
              style={{
                transform: `translate3d(0, ${dragOffsetY}px, 0)`,
                transition: isDragging ? "none" : "transform 200ms ease-out",
              }}
              className="relative z-10 w-full h-full max-w-[calc(100dvh*9/16)] sm:aspect-[9/16] overflow-hidden bg-slate-950"
            >
              {persistentEmbedUrl && activeSource.kind === "youtube" ? (
                <iframe
                  ref={persistentIframeRef}
                  src={persistentEmbedUrl}
                  onLoad={registerYouTubeListener}
                  title={`${active.chapterTitle} — Part ${active.partNumber}: ${active.partTitle}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : hasMp4Err ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-3 bg-slate-950 text-slate-200">
                  <AlertCircle className="w-9 h-9 text-amber-400" />
                  <div className="text-sm font-semibold text-white">
                    Inline playback unavailable on this browser
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
                    This part is queued for YouTube Shorts. On iOS Safari, open the MP4 directly to watch it now.
                  </p>
                  <a
                    href={activeSource.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    <span>Open MP4</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <video
                  key={activeSource.mp4Url}
                  autoPlay
                  muted={isMuted}
                  controls
                  playsInline
                  preload="auto"
                  onError={() => setFailedSrc(activeSource.mp4Url)}
                  className="w-full h-full object-cover"
                >
                  <source src={activeSource.mp4Url} type="video/mp4" />
                </video>
              )}

              {/* Active Gesture Shield: once playback starts, allows swiping up/down ANYWHERE
                  over the video + tap to pause/play (YouTube player controls are hidden via controls=0) */}
              {activeSource.kind === "youtube" && hasStartedPlaying && (
                <div
                  data-testid="shorts-gesture-shield"
                  onTouchStart={handleGestureTouchStart}
                  onTouchMove={handleGestureTouchMove}
                  onTouchEnd={(e) => handleGestureTouchEnd(e, true)}
                  onTouchCancel={handleGestureTouchCancel}
                  className="absolute inset-0 z-20 touch-none flex items-center justify-center"
                >
                  {!isPlaying && (
                    <div className="w-16 h-16 rounded-full bg-black/65 backdrop-blur-sm text-white flex items-center justify-center border border-white/20">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </div>
                  )}
                </div>
              )}

              {/* Always-active Left & Right Edge Swipe Rails (so swiping works even BEFORE first play tap on iOS Safari) */}
              <div
                data-testid="shorts-swipe-rail-left"
                onTouchStart={handleGestureTouchStart}
                onTouchMove={handleGestureTouchMove}
                onTouchEnd={(e) => handleGestureTouchEnd(e, false)}
                onTouchCancel={handleGestureTouchCancel}
                className="absolute inset-y-0 left-0 w-12 z-20 touch-none"
              />
              <div
                data-testid="shorts-swipe-rail-right"
                onTouchStart={handleGestureTouchStart}
                onTouchMove={handleGestureTouchMove}
                onTouchEnd={(e) => handleGestureTouchEnd(e, false)}
                onTouchCancel={handleGestureTouchCancel}
                className="absolute inset-y-0 right-0 w-12 z-20 touch-none"
              />
            </div>

            {/* Drag direction hint banner while swiping */}
            {isDragging && Math.abs(dragOffsetY) > 25 && (
              <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-black/80 border border-white/15 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                {dragOffsetY < 0
                  ? isLastActive
                    ? "Release to return to guide"
                    : `Release for Part ${active.partNumber + 1}`
                  : selectedIndex === 0
                    ? "Release to return to guide"
                    : `Release for Part ${active.partNumber - 1}`}
              </div>
            )}

            {/* Right-side Shorts Navigation Arrows */}
            <div className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => navigateToPart(selectedIndex - 1)}
                aria-label={
                  selectedIndex === 0
                    ? "Close and return to guide"
                    : "Previous part"
                }
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer transition-all"
              >
                <ChevronUp className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-1.5 py-0.5">
                {videos.map((v, idx) => (
                  <button
                    key={v.partSlug}
                    type="button"
                    onClick={() => navigateToPart(idx)}
                    aria-label={`Jump to Part ${v.partNumber}`}
                    className={`w-1.5 rounded-full transition-all cursor-pointer ${
                      idx === selectedIndex
                        ? "h-5 bg-emerald-400"
                        : "h-1.5 bg-white/35 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigateToPart(selectedIndex + 1)}
                aria-label={
                  isLastActive ? "Finish and return to guide" : "Next part"
                }
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer transition-all"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              {activeSource.kind === "youtube" && hasStartedPlaying && (
                <button
                  type="button"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  className="mt-1 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Dedicated Bottom Swipe Bar (large thumb-friendly touch-action: none swipe zone) */}
          <div
            data-testid="shorts-bottom-swipe-bar"
            onTouchStart={handleGestureTouchStart}
            onTouchMove={handleGestureTouchMove}
            onTouchEnd={(e) => handleGestureTouchEnd(e, false)}
            onTouchCancel={handleGestureTouchCancel}
            className="shrink-0 z-30 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-slate-950 border-t border-white/10 flex flex-col items-center text-center gap-2 touch-none"
          >
            <div className="w-10 h-1 rounded-full bg-white/25 mb-0.5" />
            <div className="text-xs sm:text-sm font-semibold text-white/95 line-clamp-1 max-w-md">
              {active.partTitle}
            </div>

            <button
              type="button"
              onClick={() => navigateToPart(selectedIndex + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/12 hover:bg-white/20 text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              <span>
                {isLastActive
                  ? "Swipe up or tap to return to guide"
                  : `Swipe up for Part ${active.partNumber + 1} of ${active.totalParts}`}
              </span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
