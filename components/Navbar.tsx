'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, Compass, Home, Map, BookOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CommandPalette } from './CommandPalette'
import { ThemeToggle } from './ThemeToggle'

export type SearchItem = {
  id: string;
  title: string;
  url: string;
  group: string;
};

const LEVELS = [
  { level: 0, title: "Absolute Beginner", short: "L0: Basics" },
  { level: 1, title: "OOP Deep Dive", short: "L1: OOP" },
  { level: 2, title: "Essential APIs", short: "L2: APIs" },
  { level: 3, title: "Generics & JVM", short: "L3: JVM" },
  { level: 4, title: "Functional Java", short: "L4: Streams" },
  { level: 5, title: "Concurrency", short: "L5: Threads" },
  { level: 6, title: "Design Patterns", short: "L6: Patterns" },
  { level: 7, title: "Databases & JPA", short: "L7: SQL & JPA" },
  { level: 8, title: "Spring Ecosystem", short: "L8: Spring" },
  { level: 9, title: "Microservices", short: "L9: Cloud" },
  { level: 10, title: "Production Arch", short: "L10: Arch" },
];

export function Navbar({ searchItems = [] }: { searchItems?: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Reset mobile menu whenever pathname changes without triggering cascading renders in effect
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Cmd+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const isHomeActive = pathname === '/';
  const isRoadmapActive = pathname.startsWith('/roadmap');

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-black/10 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 group focus:outline-none"
                aria-label="JavaHub Home"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="font-bold text-xl tracking-tight text-foreground">
                  Java<span className="text-emerald-500">Hub</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Java 21+
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isHomeActive
                    ? 'text-foreground bg-black/5 dark:bg-white/10 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                href="/roadmap"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isRoadmapActive
                    ? 'text-foreground bg-black/5 dark:bg-white/10 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                Roadmap
                <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400">
                  73 Topics
                </span>
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search trigger */}
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer min-h-[40px]"
                aria-label="Open search dialog"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline-block text-xs font-medium">Search curriculum...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-neutral-500">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Menu Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:text-foreground transition-colors cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-background/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10 overflow-y-auto px-4 py-6 flex flex-col justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-6">
              {/* Mobile Quick Search Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOpen(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 text-sm font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-emerald-500" />
                  <span>Search all 73 topics & articles...</span>
                </div>
                <span className="px-2 py-0.5 text-[11px] rounded bg-black/10 dark:bg-white/10 font-mono">
                  ⌘K
                </span>
              </button>

              {/* Main Navigation Links */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-3">
                  Navigation
                </span>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-medium transition-colors ${
                    isHomeActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Home className="w-5 h-5 text-neutral-500" />
                  Home
                </Link>
                <Link
                  href="/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-medium transition-colors ${
                    isRoadmapActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Map className="w-5 h-5 text-neutral-500" />
                    <span>Mastery Roadmap</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                    11 Levels
                  </span>
                </Link>
              </div>

              {/* Jump to Level Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Quick Jump to Level
                  </span>
                  <Link
                    href="/roadmap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-emerald-500 hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LEVELS.map((lvl) => (
                    <Link
                      key={lvl.level}
                      href={`/roadmap#level-${lvl.level}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group"
                    >
                      <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                        {lvl.short}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {lvl.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Senior Java Curriculum</span>
              </div>
              <span className="font-mono text-[11px]">Java 21 LTS</span>
            </div>
          </div>
        )}
      </header>

      <CommandPalette open={open} setOpen={setOpen} searchItems={searchItems} />
    </>
  );
}
