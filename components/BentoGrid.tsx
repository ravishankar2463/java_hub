'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

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
        'grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto',
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
  category: string
}) => {
  return (
    <Link href={url} className="group h-full">
      <motion.div
        whileHover={{ scale: 0.99, translateY: -2 }}
        className={cn(
          "row-span-1 rounded-3xl group/bento transition duration-200 shadow-input dark:shadow-none p-6 md:p-8 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 justify-between flex flex-col space-y-4",
          className
        )}
      >
        {header}
        <div className="group-hover:translate-x-1 transition duration-200">
          {icon}
          <div className="font-bold text-foreground mb-2 mt-2">
            {title}
          </div>
          <div className="font-normal text-neutral-600 dark:text-neutral-300 text-sm">
            {description}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
