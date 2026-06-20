"use client";

import { motion } from "framer-motion";
import { RoadmapLevel } from "@/data/roadmap";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/utils/slugify";

export const RoadmapLevelCard = ({ level, index }: { level: RoadmapLevel; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex flex-col gap-6 p-6 md:p-8 rounded-2xl border border-white/10 bg-neutral-950/50 backdrop-blur-xl overflow-hidden group"
    >
      {/* Background Gradient Effect */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${level.color}`} 
      />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${level.badge}`}>
            {level.title}
          </span>
        </div>
        
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {level.subtitle}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed max-w-3xl">
            {level.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-6 mt-8 pl-8 border-l border-black/10 dark:border-white/10 ml-4">
        {level.topics.map((topic, i) => {
          const levelSlug = `level-${level.level}`;
          const topicSlug = slugify(topic.title);
          
          return (
            <div key={i} className="relative group/topic">
              {/* Timeline Dot */}
              <div className="absolute -left-[37px] top-6 w-3 h-3 rounded-full border-2 border-background bg-neutral-400 dark:bg-neutral-600 group-hover/topic:bg-foreground transition-colors" />
              
              <Link 
                href={`/roadmap/${levelSlug}/${topicSlug}`} 
                className="p-5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all cursor-pointer block"
              >
                <h3 className="text-foreground font-medium mb-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-neutral-500" />
                    {topic.title}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-600 opacity-0 group-hover/topic:opacity-100 group-hover/topic:translate-x-1 transition-all" />
                </h3>
                <ul className="flex flex-col gap-2">
                  {topic.details.map((detail, j) => (
                    <li key={j} className="text-sm text-neutral-400 pl-6 relative before:content-[''] before:absolute before:left-2 before:top-2 before:w-1.5 before:h-1.5 before:bg-neutral-700 before:rounded-full">
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
