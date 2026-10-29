'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ArrowRight } from 'lucide-react'

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        'grid md:auto-rows-[19rem] grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  url,
  category,
}: {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
  url: string
  category?: string
}) => {
  return (
    <Link href={url} className="group h-full block">
      <motion.div
        whileHover={{ scale: 0.99, translateY: -2 }}
        className={cn(
          "h-full rounded-3xl transition duration-200 p-6 sm:p-8 bg-[var(--color-card)] border border-[var(--color-card-border)] hover:border-emerald-500/40 hover:bg-emerald-500/5 justify-between flex flex-col space-y-4 shadow-xs",
          className
        )}
      >
        <div>
          {header}
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-[var(--color-card-subtle)] border border-[var(--color-border)] w-fit text-emerald-600 dark:text-emerald-400">
              {icon}
            </div>
            {category && (
              <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-card-subtle)] border border-[var(--color-border)] text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {category}
              </span>
            )}
          </div>

          <div className="group-hover:translate-x-0.5 transition duration-200">
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {title}
            </div>
            <div className="font-normal text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
              {description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors pt-2 border-t border-[var(--color-border)]">
          <span>Read lesson</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.div>
    </Link>
  )
}
