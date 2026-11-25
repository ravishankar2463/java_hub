"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PlayCircle,
  Play,
  ExternalLink,
  Film,
  Clock,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  resolveChapterVideoSource,
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const feedRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const initialIndexRef = useRef(0);
  const isClosingRef = useRef(false);

  const closeFullscreen = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsFullscreen(false);
    setTimeout(() => {
      isClosingRef.current = false;
    }, 150);
  }, []);

  const openFullscreenAt = useCallback((index: number) => {
    isClosingRef.current = false;
    initialIndexRef.current = index;
    setSelectedIndex(index);
    setFailedSrc(null);
    setIsFullscreen(true);
  }, []);

  const scrollToSlide = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0) return;
      if (targetIndex >= videos.length) {
        closeFullscreen();
        return;
      }
      setSelectedIndex(targetIndex);
      setFailedSrc(null);
      const container = feedRef.current;
      if (container) {
        container.scrollTo({
          top: targetIndex * container.clientHeight,
          behavior: "smooth",
        });
      }
    },
    [videos.length, closeFullscreen]
  );

  // Lock background page scroll & jump to initial slide ONLY when opening fullscreen,
  // so closing returns to the exact scroll position where the user left off.
  useEffect(() => {
    if (!isFullscreen) return;

    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    const container = feedRef.current;
    if (container) {
      container.scrollTo({
        top: initialIndexRef.current * container.clientHeight,
        behavior: "instant" as ScrollBehavior,
      });
    }

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
        scrollToSlide(selectedIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToSlide(selectedIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, selectedIndex, closeFullscreen, scrollToSlide]);

  // Detect scroll-snap slide changes (including swiping up past the last part -> close)
  const handleFeedScroll = useCallback(() => {
    const container = feedRef.current;
    if (!container || !isFullscreen) return;
    const slideHeight = container.clientHeight;
    if (slideHeight <= 0) return;

    const rawIndex = Math.round(container.scrollTop / slideHeight);
    if (rawIndex >= videos.length) {
      // User swiped up past the final part -> return smoothly to app UI
      closeFullscreen();
      return;
    }
    if (rawIndex >= 0 && rawIndex < videos.length && rawIndex !== selectedIndex) {
      setSelectedIndex(rawIndex);
      setFailedSrc(null);
    }
  }, [isFullscreen, videos.length, selectedIndex, closeFullscreen]);

  // Direct touch swipe handler on the HUD bars (reliable on iOS Safari even over iframes)
  const handleSwipeTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleSwipeTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const deltaY = touchStartYRef.current - endY;
    touchStartYRef.current = null;

    if (deltaY > 45) {
      // Swiped up -> next part (or exit back to guide if on last part)
      scrollToSlide(selectedIndex + 1);
    } else if (deltaY < -45) {
      // Swiped down -> previous part
      scrollToSlide(selectedIndex - 1);
    }
  };

  if (videos.length === 0) return null;

  const active = videos[selectedIndex] ?? videos[0];
  const activeSource = resolveChapterVideoSource(active);
  const activeThumb = activeSource.youtubeId
    ? getYouTubeThumbnailUrl(activeSource.youtubeId)
    : null;

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
                Tap Play for full-screen Shorts mode — swipe up between parts.
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

            {/* Dark vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/45" />

            {/* Top pills */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                Part {active.partNumber}/{active.totalParts}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/65 backdrop-blur-sm text-[11px] font-mono text-slate-200 border border-white/10">
                <Clock className="w-3 h-3" />
                {formatDuration(active.durationSec)}
              </span>
            </div>

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/90 group-hover:bg-emerald-400 group-hover:scale-110 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-950/60 transition-all duration-200">
                <Play className="w-7 h-7 fill-current ml-0.5" />
              </div>
            </div>

            {/* Bottom caption */}
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
          className="fixed inset-0 z-[100] bg-black text-white flex flex-col"
        >
          {/* Floating Top Header Bar (also swipeable on iOS) */}
          <div
            onTouchStart={handleSwipeTouchStart}
            onTouchEnd={handleSwipeTouchEnd}
            className="absolute top-0 inset-x-0 z-30 flex items-center justify-between gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-auto"
          >
            <div className="min-w-0 flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shrink-0">
                Part {active.partNumber}/{active.totalParts}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white/90 truncate">
                {active.chapterTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={activeSource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-sm transition-colors"
              >
                <span className="hidden sm:inline">{activeSource.externalLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={closeFullscreen}
                aria-label="Close full-screen video"
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right-side Shorts Navigation Arrows (Desktop + Mobile quick tap) */}
          <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollToSlide(selectedIndex - 1)}
              disabled={selectedIndex === 0}
              aria-label="Previous part"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-25 disabled:cursor-not-allowed text-white flex items-center justify-center backdrop-blur-sm cursor-pointer transition-all"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            {/* Progress dots */}
            <div className="flex flex-col gap-1.5 py-1">
              {videos.map((v, idx) => (
                <button
                  key={v.partSlug}
                  type="button"
                  onClick={() => scrollToSlide(idx)}
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
              onClick={() => scrollToSlide(selectedIndex + 1)}
              aria-label={
                selectedIndex === videos.length - 1
                  ? "Finish and return to guide"
                  : "Next part"
              }
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm cursor-pointer transition-all"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Vertical Scroll-Snap Shorts Feed */}
          <div
            ref={feedRef}
            onScroll={handleFeedScroll}
            className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory overscroll-contain scroll-smooth"
          >
            {videos.map((vid, idx) => {
              const isActive = idx === selectedIndex;
              const isLast = idx === videos.length - 1;
              const src = resolveChapterVideoSource(vid);
              const ytAutoplayUrl = src.youtubeId
                ? getYouTubeEmbedUrl(src.youtubeId, { autoplay: true })
                : null;
              const thumbUrl = src.youtubeId
                ? getYouTubeThumbnailUrl(src.youtubeId)
                : null;
              const hasMp4Err = src.kind === "mp4" && failedSrc === src.mp4Url;

              return (
                <div
                  key={vid.partSlug}
                  className="relative w-full h-[100dvh] snap-start snap-always flex items-center justify-center bg-black overflow-hidden"
                >
                  {/* 9:16 Centered Shorts Stage */}
                  <div className="relative w-full h-full max-w-[calc(100dvh*9/16)] sm:max-h-[92dvh] sm:aspect-[9/16] sm:rounded-2xl overflow-hidden bg-slate-950">
                    {isActive ? (
                      src.kind === "youtube" && ytAutoplayUrl ? (
                        <iframe
                          key={ytAutoplayUrl}
                          src={ytAutoplayUrl}
                          title={`${vid.chapterTitle} — Part ${vid.partNumber}: ${vid.partTitle}`}
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
                            href={src.externalUrl}
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
                          key={src.mp4Url}
                          autoPlay
                          controls
                          playsInline
                          preload="auto"
                          onError={() => setFailedSrc(src.mp4Url)}
                          className="w-full h-full object-cover"
                        >
                          <source src={src.mp4Url} type="video/mp4" />
                        </video>
                      )
                    ) : thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbUrl}
                        alt={vid.partTitle}
                        className="w-full h-full object-cover opacity-50"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-950" />
                    )}
                  </div>

                  {/* Bottom Swipeable HUD Bar (works reliably on iOS Safari above iframe) */}
                  <div
                    onTouchStart={handleSwipeTouchStart}
                    onTouchEnd={handleSwipeTouchEnd}
                    className="absolute bottom-0 inset-x-0 z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col items-center text-center gap-2 pointer-events-auto"
                  >
                    <div className="max-w-md">
                      <div className="text-sm sm:text-base font-bold text-white leading-snug">
                        {vid.partTitle}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollToSlide(idx + 1)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-emerald-300 text-xs font-semibold backdrop-blur-sm cursor-pointer transition-colors"
                    >
                      <span>
                        {isLast
                          ? "Swipe up or tap to return to guide"
                          : `Swipe up for Part ${vid.partNumber + 1} of ${vid.totalParts}`}
                      </span>
                      <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* End Sentinel Slide — Swiping up past the last part snaps here and closes back to the app UI */}
            <div className="w-full h-[100dvh] snap-start snap-always flex flex-col items-center justify-center gap-3 bg-black text-white px-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <div className="text-base font-bold">All {videos.length} parts completed</div>
              <p className="text-xs text-slate-400">Returning to your guide…</p>
              <button
                type="button"
                onClick={closeFullscreen}
                className="mt-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                Back to Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
