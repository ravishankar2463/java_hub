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
  { level: 7, label: "L7: SQL & JPA" },
  { level: 8, label: "L8: Spring" },
  { level: 9, label: "L9: Cloud" },
  { level: 10, label: "L10: Arch" },
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Career Curriculum</span>
          <span className="text-neutral-400">&bull;</span>
          <span className="font-mono">Java 21+</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-4xl leading-[1.15]">
          The Java Mastery Roadmap
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          From your first <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">public static void main</code> to
          architecting resilient, multi-region distributed cloud platforms. A unified, senior-engineer curated curriculum.
        </p>

        {/* Curriculum Stats Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span><strong>11</strong> Mastery Levels</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span><strong>{totalTopics}</strong> Deep-Dive Lessons</span>
          </div>
        </div>

        {/* Level Quick-Jump Navigation Bar (Sticky/Scrollable) */}
        <div className="w-full max-w-4xl mt-6 p-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 backdrop-blur-md">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 px-2 text-left">
            Jump Directly to Level
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin px-1">
            {LEVEL_SHORTCUTS.map((lvl) => (
              <a
                key={lvl.level}
                href={`#level-${lvl.level}`}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-neutral-600 dark:text-neutral-300 hover:text-foreground hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer"
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
