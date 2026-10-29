import { roadmapData } from "@/data/roadmap";
import { RoadmapLevelCard } from "@/components/RoadmapLevelCard";
import { Layers, CheckCircle, Sparkles } from "lucide-react";

export const metadata = {
  title: "Java Mastery Roadmap | JavaHub",
  description:
    "The comprehensive phase-by-phase curriculum to achieve Java mastery. 11 levels, 73 deep-dive topics from JVM architecture to cloud-native systems.",
};

const LEVEL_SHORTCUTS = [
  { level: 0, label: "L0: Basics" },
  { level: 1, label: "L1: OOP" },
  { level: 2, label: "L2: APIs" },
  { level: 3, label: "L3: JVM" },
  { level: 4, label: "L4: Streams" },
  { level: 5, label: "L5: Threads" },
  { level: 6, label: "L6: Patterns" },
  { level: 7, label: "L7: Data & Storage" },
  { level: 8, label: "L8: Spring Boot" },
  { level: 9, label: "L9: Security & APIs" },
  { level: 10, label: "L10: Event Streaming" },
  { level: 11, label: "L11: Microservices" },
  { level: 12, label: "L12: Cloud & K8s" },
  { level: 13, label: "L13: System Design" },
  { level: 14, label: "L14: Enterprise AI" },
  { level: 15, label: "L15: Low Latency" },
];

export default function RoadmapPage() {
  const totalTopics = roadmapData.reduce(
    (acc, level) => acc + level.topics.length,
    0
  );

  return (
    <div className="flex flex-col gap-12 w-full pb-16">
      {/* Hero Header */}
      <section className="flex flex-col items-center justify-center text-center gap-6 pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Interactive Career Curriculum</span>
          <span className="text-slate-400">&bull;</span>
          <span className="font-mono">Java 21+</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl leading-[1.15]">
          The Java Mastery Roadmap
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          From your first <code className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-1.5 py-0.5 rounded text-xs font-mono font-medium">public static void main</code> to
          architecting resilient, multi-region distributed cloud platforms. A unified, senior-engineer curated curriculum.
        </p>

        {/* Curriculum Stats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-xs sm:text-sm text-slate-700 dark:text-slate-300 shadow-xs">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span><strong className="text-slate-900 dark:text-slate-100">{roadmapData.length}</strong> Mastery Levels</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-xs sm:text-sm text-slate-700 dark:text-slate-300 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span><strong className="text-slate-900 dark:text-slate-100">{totalTopics}</strong> Deep-Dive Lessons</span>
          </div>
        </div>

        {/* Level Quick-Jump Navigation Bar */}
        <div className="w-full max-w-4xl mt-6 p-2 rounded-2xl bg-[var(--color-card)] border border-[var(--color-card-border)] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2 text-left">
            Jump Directly to Level
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin px-1">
            {LEVEL_SHORTCUTS.map((lvl) => (
              <a
                key={lvl.level}
                href={`#level-${lvl.level}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-[var(--color-card-subtle)] border border-[var(--color-border)] text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer"
              >
                {lvl.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Levels Timeline Grid */}
      <section className="flex flex-col gap-8 sm:gap-12 relative max-w-5xl mx-auto w-full">
        {roadmapData.map((level, index) => (
          <div key={level.level} className="relative z-10 w-full">
            <RoadmapLevelCard level={level} index={index} />
          </div>
        ))}
      </section>
    </div>
  );
}
