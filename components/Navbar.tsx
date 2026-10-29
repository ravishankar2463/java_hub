'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, Compass, Home, Map, BookOpen, Code2, ExternalLink } from 'lucide-react'
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
  { level: 7, title: "Data & Storage", short: "L7: Data" },
  { level: 8, title: "Spring Boot 3", short: "L8: Spring" },
  { level: 9, title: "Security & APIs", short: "L9: Security" },
  { level: 10, title: "Event Streaming", short: "L10: Kafka" },
  { level: 11, title: "Microservices", short: "L11: Distributed" },
  { level: 12, title: "Cloud & K8s", short: "L12: Cloud" },
  { level: 13, title: "System Design & SRE", short: "L13: SRE" },
  { level: 14, title: "Enterprise AI", short: "L14: AI" },
  { level: 15, title: "Low Latency & HFT", short: "L15: Low Latency" },
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
      <header className="sticky top-0 z-50 w-full bg-[var(--color-card)]/90 backdrop-blur-md border-b border-[var(--color-border)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 group focus:outline-none"
                aria-label="JavaHub Home"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">
                  Java<span className="text-emerald-600 dark:text-emerald-400">Hub</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
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
                    ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 font-semibold border border-emerald-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[var(--color-card-subtle)]'
                }`}
              >
                Home
              </Link>
              <Link
                href="/roadmap"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isRoadmapActive
                    ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 font-semibold border border-emerald-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[var(--color-card-subtle)]'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                Roadmap
                <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-[var(--color-card-subtle)] text-slate-500 dark:text-slate-400 border border-[var(--color-border)]">
                  116 Topics
                </span>
              </Link>
              <a
                href="https://github.com/ravishankar2463/java_hub_resources"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-[var(--color-card-subtle)]"
                title="116 Runnable Topic Labs on GitHub"
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Code Labs</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search trigger */}
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-[var(--color-card)] border border-[var(--color-border)] px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:text-foreground hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer min-h-[40px] shadow-xs"
                aria-label="Open search dialog"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline-block text-xs font-medium">Search curriculum...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-[var(--color-card-subtle)] border border-[var(--color-border)] px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-500">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Menu Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors cursor-pointer shadow-xs"
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
          <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-[var(--color-card)]/98 backdrop-blur-xl border-b border-[var(--color-border)] overflow-y-auto px-4 py-6 flex flex-col justify-between animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-6">
              {/* Mobile Quick Search Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOpen(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-card-subtle)] border border-[var(--color-border)] text-slate-700 dark:text-slate-300 text-sm font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Search all 116 topics & articles...</span>
                </div>
                <span className="px-2 py-0.5 text-[11px] rounded bg-[var(--color-card)] border border-[var(--color-border)] font-mono text-slate-500">
                  ⌘K
                </span>
              </button>

              {/* Main Navigation Links */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                  Navigation
                </span>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-base font-medium transition-colors ${
                    isHomeActive
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-[var(--color-card-subtle)]'
                  }`}
                >
                  <Home className="w-5 h-5 text-slate-500" />
                  Home
                </Link>
                <Link
                  href="/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-medium transition-colors ${
                    isRoadmapActive
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-[var(--color-card-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Map className="w-5 h-5 text-slate-500" />
                    <span>Mastery Roadmap</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-medium">
                    16 Levels
                  </span>
                </Link>
                <a
                  href="https://github.com/ravishankar2463/java_hub_resources"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-medium transition-colors text-slate-700 dark:text-slate-300 hover:bg-[var(--color-card-subtle)]"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Code Labs (116 Branches)</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              {/* Jump to Level Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Quick Jump to Level
                  </span>
                  <Link
                    href="/roadmap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
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
                      className="p-2.5 rounded-lg bg-[var(--color-card-subtle)] border border-[var(--color-border)] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-left group"
                    >
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {lvl.short}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {lvl.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
