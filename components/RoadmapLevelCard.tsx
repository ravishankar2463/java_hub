"use client";

import { motion } from "framer-motion";
import { RoadmapLevel } from "@/data/roadmap";
import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/utils/slugify";

export const RoadmapLevelCard = ({
  level,
  index,
}: {
  level: RoadmapLevel;
  index: number;
}) => {
  return (
    <motion.div
      id={`level-${level.level}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      className="scroll-mt-24 relative flex flex-col gap-6 p-5 sm:p-8 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-neutral-950/50 backdrop-blur-xl overflow-hidden group shadow-sm"
    >
      {/* Background Gradient Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${level.color}`}
      />

      {/* Level Header */}
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${level.badge}`}
          >
            {level.title}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-mono text-neutral-600 dark:text-neutral-400">
            <BookOpen className="w-3 h-3 text-emerald-500" />
            {level.topics.length} Topics
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {level.subtitle}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            {level.description}
          </p>
        </div>
      </div>

      {/* Level Topics Timeline */}
      <div className="relative z-10 flex flex-col gap-4 mt-4 sm:pl-6 sm:border-l sm:border-black/10 dark:sm:border-white/10 sm:ml-3">
        {level.topics.map((topic, i) => {
          const levelSlug = `level-${level.level}`;
          const topicSlug = slugify(topic.title);

          return (
            <div key={i} className="relative group/topic">
              {/* Timeline Dot (visible on sm+) */}
              <div className="hidden sm:block absolute -left-[31px] top-5 w-2.5 h-2.5 rounded-full border-2 border-background bg-neutral-400 dark:bg-neutral-600 group-hover/topic:bg-emerald-500 group-hover/topic:scale-125 transition-all" />

              <Link
                href={`/roadmap/${levelSlug}/${topicSlug}`}
                className="p-4 sm:p-5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer block"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <h3 className="text-foreground font-semibold text-sm sm:text-base group-hover/topic:text-emerald-500 transition-colors truncate">
                      {topic.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover/topic:text-emerald-500 group-hover/topic:translate-x-1 transition-all shrink-0">
                    <span className="hidden sm:inline-block">Read lesson</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Topic Detail Bullets */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                  {topic.details.map((detail, j) => (
                    <li
                      key={j}
                      className="text-xs text-neutral-500 dark:text-neutral-400 pl-4 relative before:content-[''] before:absolute before:left-1 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-neutral-400 dark:before:bg-neutral-700 before:rounded-full truncate"
                      title={detail}
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              </Link>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
