import { roadmapData } from "@/data/roadmap";
import { RoadmapLevelCard } from "@/components/RoadmapLevelCard";

export const metadata = {
  title: "Java Mastery Roadmap | Java Developer Hub",
  description: "The comprehensive roadmap to achieving mastery in Java. From JVM internals to Cloud Native Architecture.",
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 max-w-5xl mx-auto flex flex-col gap-16">
      <section className="flex flex-col items-center justify-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-neutral-600 dark:text-neutral-300">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Interactive Guide
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 bg-clip-text text-transparent">
          The Mastery Roadmap
        </h1>
        <p className="max-w-[700px] text-lg text-neutral-400">
          A definitive, phase-by-phase guide to taking your skills from writing your first `public static void main` to architecting distributed, cloud-native enterprise systems.
        </p>
      </section>

      <section className="flex flex-col gap-12 relative">
        {/* Vertical timeline line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent -translate-x-1/2 z-0 hidden md:block" />

        {roadmapData.map((level, index) => (
          <div key={level.level} className="relative z-10 w-full">
            <RoadmapLevelCard level={level} index={index} />
          </div>
        ))}
      </section>
    </div>
  );
}
