"use client";

import { useState } from "react";
import { PlayCircle, ExternalLink, Film, Clock } from "lucide-react";

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
  roadmapUrl: string;
  branchName: string;
  renderedAt: string;
}

const RAW_BASE =
  "https://raw.githubusercontent.com/ravishankar2463/java_hub_resources/main/videos";
const BLOB_BASE =
  "https://github.com/ravishankar2463/java_hub_resources/blob/main/videos";

function formatDuration(sec: number): string {
  const rounded = Math.round(sec);
  const mins = Math.floor(rounded / 60);
  const rem = rounded % 60;
  return `${mins}:${String(rem).padStart(2, "0")}`;
}

export function ChapterVideos({ videos }: { videos: ChapterVideoItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (videos.length === 0) return null;

  const active = videos[selectedIndex] ?? videos[0];
  const rawUrl = active.videoUrl || `${RAW_BASE}/${active.file}`;
  const githubUrl = active.videoUrl || `${BLOB_BASE}/${active.file}`;

  return (
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
              Short Summary Videos ({videos.length} {videos.length === 1 ? "Part" : "Parts"})
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Watch bite-sized 9:16 visual breakdowns before diving into the full guide.
            </p>
          </div>
        </div>

        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-card)] hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium border border-[var(--color-border)] transition-colors"
        >
          <span>Open MP4 on GitHub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Vertical 9:16 Video Player */}
        <div className="w-full max-w-[270px] shrink-0 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md aspect-[9/16]">
          <video
            key={rawUrl}
            src={rawUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          >
            Your browser does not support embedded MP4 playback.{" "}
            <a href={rawUrl}>Download the video</a>.
          </video>
        </div>

        {/* Part Selector List */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          {videos.map((vid, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={vid.partSlug}
                type="button"
                onClick={() => setSelectedIndex(idx)}
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
  );
}
