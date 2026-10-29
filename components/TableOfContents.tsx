'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ArrowUp, ListFilter, BookOpen } from 'lucide-react'
import clsx from 'clsx'

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({
  headings,
}: {
  headings: HeadingItem[];
}) {
  const [activeId, setActiveId] = useState<string>('')
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const offset = 90 // Account for sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = el.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
    setIsMobileOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {/* Mobile / Tablet Collapsible Accordion (visible on < xl) */}
      <div className="xl:hidden w-full mb-8 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          aria-expanded={isMobileOpen}
        >
          <div className="flex items-center gap-2.5">
            <ListFilter className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">Table of Contents</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
              {headings.length} sections
            </span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-neutral-400 transition-transform duration-200',
              isMobileOpen && 'rotate-180'
            )}
          />
        </button>

        {isMobileOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-black/5 dark:border-white/5 max-h-72 overflow-y-auto">
            <ul className="space-y-1.5 text-sm pt-2">
              {headings.map((heading) => {
                const isActive = activeId === heading.id
                return (
                  <li
                    key={heading.id}
                    style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
                  >
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={clsx(
                        'w-full text-left py-1.5 px-2 rounded-lg transition-colors flex items-center gap-2 text-xs',
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                      )}
                    >
                      <span
                        className={clsx(
                          'w-1.5 h-1.5 rounded-full shrink-0',
                          isActive ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'
                        )}
                      />
                      <span className="truncate">{heading.text}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Desktop Sticky Sidebar (visible on >= xl) */}
      <aside className="sticky top-24 hidden xl:flex flex-col w-64 2xl:w-72 shrink-0 gap-4">
        <div className="p-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                On This Page
              </h4>
            </div>
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-500">
              {headings.length}
            </span>
          </div>

          <nav className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
            <ul className="space-y-1 text-sm">
              {headings.map((heading) => {
                const isActive = activeId === heading.id
                return (
                  <li
                    key={heading.id}
                    style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
                  >
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={clsx(
                        'w-full text-left py-1 px-2 rounded-md transition-all text-xs flex items-center gap-2 cursor-pointer',
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border-l-2 border-emerald-500'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                      )}
                    >
                      <span className="truncate">{heading.text}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Back to Top</span>
        </button>
      </aside>
    </>
  )
}
