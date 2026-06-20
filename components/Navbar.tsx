'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CommandPalette } from './CommandPalette'
import { ThemeToggle } from './ThemeToggle'

export type SearchItem = {
  id: string;
  title: string;
  url: string;
  group: string;
};

export function Navbar({ searchItems = [] }: { searchItems?: SearchItem[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-16">
            <div className="flex-1 flex justify-start">
              <Link href="/" className="font-bold text-xl tracking-tighter">
                Java<span className="text-neutral-500">Hub</span>
              </Link>
            </div>
            
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-neutral-400 hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/roadmap" className="text-sm font-medium text-neutral-400 hover:text-foreground transition-colors">
                Roadmap
              </Link>
            </div>

            <div className="flex-1 flex justify-end items-center space-x-3">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline-block">Search...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
      <CommandPalette open={open} setOpen={setOpen} searchItems={searchItems} />
    </>
  )
}
