'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

export function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string; level: number }[]
}) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0px 0px -80% 0px' }
    )

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="sticky top-24 hidden lg:block w-64 shrink-0">
      <h4 className="text-sm font-semibold text-foreground mb-4">On this page</h4>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={clsx(
                'block hover:text-foreground transition-colors',
                activeId === heading.id ? 'text-foreground font-medium' : 'text-neutral-500'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
