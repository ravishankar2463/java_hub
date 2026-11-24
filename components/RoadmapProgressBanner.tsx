"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRoadmapProgress } from "@/hooks/useRoadmapProgress";

type RoadmapTopicLink = {
  id: string;
  title: string;
  url: string;
};

export function RoadmapProgressBanner({
  topics,
}: {
  topics: RoadmapTopicLink[];
}) {
  const { progress, storageAvailable } = useRoadmapProgress();
  const lastOpenedTopic = progress?.lastOpenedTopic;
  const lastTopic = topics.find((topic) => topic.id === lastOpenedTopic);

  useEffect(() => {
    if (!lastOpenedTopic || window.location.hash) {
      return;
    }

    const elementId = `topic-${lastOpenedTopic.replace("/", "-")}`;
    const scrollFrame = window.requestAnimationFrame(() => {
      document.getElementById(elementId)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    });

    return () => {
      window.cancelAnimationFrame(scrollFrame);
    };
  }, [lastOpenedTopic]);

  if (!storageAvailable) {
    return (
      <aside
        role="status"
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
      >
        Roadmap progress could not be loaded because this browser could not access local storage.
      </aside>
    );
  }

  if (!progress || progress.visitedTopics.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Roadmap progress"
      className="flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {lastTopic
            ? `Pick up where you left off: ${lastTopic.title}`
            : "Your roadmap progress is saved"}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {progress.visitedTopics.length}{" "}
          {progress.visitedTopics.length === 1 ? "topic visited" : "topics visited"}.
          {" "}Saved in this browser using local storage, not cookies.
        </p>
      </div>
      {lastTopic && (
        <Link
          href={lastTopic.url}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-emerald-600/30 px-4 font-medium text-emerald-800 transition-colors hover:bg-emerald-500/10 dark:text-emerald-300"
        >
          Continue lesson
        </Link>
      )}
    </aside>
  );
}
