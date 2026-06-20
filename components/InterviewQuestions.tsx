"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { InterviewQuestion } from "@/data/roadmap";

export const InterviewQuestions = ({ questions }: { questions: InterviewQuestion[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-6 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircleQuestion className="w-5 h-5 text-neutral-400" />
        <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
          Common Interview Questions
        </h4>
      </div>
      
      {questions.map((q, i) => (
        <div 
          key={i} 
          className="rounded-lg border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        >
          <button
            onClick={() => toggleQuestion(i)}
            className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
          >
            <span className="text-sm font-medium text-foreground pr-4">
              {q.question}
            </span>
            <motion.div
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </motion.div>
          </button>
          
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <div className="px-4 pb-4 pt-0">
                  <div className="p-3 rounded bg-white/50 dark:bg-neutral-950/50 border border-black/5 dark:border-white/5 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="font-semibold text-foreground mr-2">Expectation:</span>
                    {q.expectation}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
